class AnomalyDetector {
    constructor() {
        this.speedThreshold = 120; // km/h
        this.distThreshold = 0.001; // km
        this.minDuration = 60; // seconds
        this.maxDuration = 7200; // 2 hours
    }

    detectAnomalies(data, threshold = 0.1) {
        if (!data || data.length === 0) return [];

        console.log(`🔍 Detecting anomalies (threshold: ${threshold})`);
        
        const anomalies = [];
        const stats = this.calcStats(data);

        data.forEach((rec, idx) => {
            const score = this.calcAnomalyScore(rec, stats);
            
            if (score > threshold) {
                anomalies.push({
                    ...rec,
                    anomalyScore: score.toFixed(4),
                    anomalyReasons: this.getReasons(rec, stats),
                    recordIndex: idx
                });
            }
        });

        console.log(`🚨 Found ${anomalies.length} anomalies out of ${data.length} records`);
        return anomalies;
    }

    calcAnomalyScore(rec, stats) {
        let score = 0;
        let factors = 0;

        // Unrealistic speed
        if (rec.trip_speed_kmh && rec.trip_speed_kmh > this.speedThreshold) {
            score += Math.min((rec.trip_speed_kmh - this.speedThreshold) / this.speedThreshold, 1);
            factors++;
        }

        // Distance too short or long
        if (rec.trip_distance_km) {
            if (rec.trip_distance_km < this.distThreshold) {
                score += 0.8;
                factors++;
            } else if (rec.trip_distance_km > stats.maxDist * 3) {
                score += Math.min(rec.trip_distance_km / (stats.maxDist * 3), 1);
                factors++;
            }
        }

        // Duration anomaly
        if (rec.trip_duration) {
            if (rec.trip_duration < this.minDuration) {
                score += 0.7;
                factors++;
            } else if (rec.trip_duration > this.maxDuration) {
                score += Math.min(rec.trip_duration / (this.maxDuration * 2), 1);
                factors++;
            }
        }

        // Speed vs distance mismatch
        if (rec.trip_speed_kmh && rec.trip_distance_km && rec.trip_duration) {
            const expectedSpeed = rec.trip_distance_km / (rec.trip_duration / 3600);
            const diff = Math.abs(rec.trip_speed_kmh - expectedSpeed);
            if (diff > 20) {
                score += Math.min(diff / 100, 1);
                factors++;
            }
        }

        // Outside NYC bounds
        if (this.isOutsideNYC(rec.pickup_latitude, rec.pickup_longitude) ||
            this.isOutsideNYC(rec.dropoff_latitude, rec.dropoff_longitude)) {
            score += 0.9;
            factors++;
        }

        // Passenger count
        if (rec.passenger_count > 6 || rec.passenger_count < 0) {
            score += 0.6;
            factors++;
        }

        // Invalid dates
        const dt = new Date(rec.pickup_datetime);
        const now = new Date();
        const y2000 = new Date('2000-01-01');
        
        if (dt > now || dt < y2000) {
            score += 0.8;
            factors++;
        }

        return factors > 0 ? score / factors : 0;
    }

    calcStats(data) {
        const speeds = data.map(r => r.trip_speed_kmh).filter(s => s && !isNaN(s));
        const dists = data.map(r => r.trip_distance_km).filter(d => d && !isNaN(d));
        const durs = data.map(r => r.trip_duration).filter(d => d && !isNaN(d));

        return {
            avgSpeed: speeds.length > 0 ? speeds.reduce((sum, s) => sum + s, 0) / speeds.length : 0,
            maxSpeed: speeds.length > 0 ? Math.max(...speeds) : 0,
            avgDist: dists.length > 0 ? dists.reduce((sum, d) => sum + d, 0) / dists.length : 0,
            maxDist: dists.length > 0 ? Math.max(...dists) : 0,
            avgDur: durs.length > 0 ? durs.reduce((sum, d) => sum + d, 0) / durs.length : 0,
            maxDur: durs.length > 0 ? Math.max(...durs) : 0
        };
    }

    getReasons(rec, stats) {
        const reasons = [];

        if (rec.trip_speed_kmh && rec.trip_speed_kmh > this.speedThreshold) {
            reasons.push(`Unrealistic speed: ${rec.trip_speed_kmh.toFixed(2)} km/h`);
        }

        if (rec.trip_distance_km && rec.trip_distance_km < this.distThreshold) {
            reasons.push(`Too short: ${rec.trip_distance_km.toFixed(4)} km`);
        }

        if (rec.trip_distance_km && rec.trip_distance_km > stats.maxDist * 3) {
            reasons.push(`Extremely long: ${rec.trip_distance_km.toFixed(2)} km`);
        }

        if (rec.trip_duration && rec.trip_duration < this.minDuration) {
            reasons.push(`Too short: ${rec.trip_duration}s`);
        }

        if (rec.trip_duration && rec.trip_duration > this.maxDuration) {
            reasons.push(`Too long: ${(rec.trip_duration / 3600).toFixed(2)}h`);
        }

        if (this.isOutsideNYC(rec.pickup_latitude, rec.pickup_longitude)) {
            reasons.push('Pickup outside NYC');
        }

        if (this.isOutsideNYC(rec.dropoff_latitude, rec.dropoff_longitude)) {
            reasons.push('Dropoff outside NYC');
        }

        if (rec.passenger_count > 6 || rec.passenger_count < 0) {
            reasons.push(`Invalid passenger count: ${rec.passenger_count}`);
        }

        return reasons;
    }

    isOutsideNYC(lat, lon) {
        if (!lat || !lon) return true;
        
        // NYC bounds
        const bounds = {
            north: 40.9176,
            south: 40.4774,
            east: -73.7004,
            west: -74.2591
        };

        return lat < bounds.south || lat > bounds.north || 
               lon < bounds.west || lon > bounds.east;
    }

    detectSpeedAnomalies(data) {
        return data.filter(r => 
            r.trip_speed_kmh && r.trip_speed_kmh > this.speedThreshold
        );
    }

    detectDistanceAnomalies(data) {
        return data.filter(r => 
            r.trip_distance_km && 
            (r.trip_distance_km < this.distThreshold || r.trip_distance_km > 50)
        );
    }

    detectTimeAnomalies(data) {
        return data.filter(r => {
            const pickup = new Date(r.pickup_datetime);
            const dropoff = new Date(r.dropoff_datetime);
            const now = new Date();
            
            return pickup > now || 
                   dropoff > now || 
                   dropoff < pickup ||
                   r.trip_duration < this.minDuration ||
                   r.trip_duration > this.maxDuration;
        });
    }

    getSummary(anomalies, totalData) {
        if (!anomalies || anomalies.length === 0) {
            return {
                totalAnomalies: 0,
                anomalyRate: 0,
                mostCommonReason: 'None',
                speedAnomalies: 0,
                distanceAnomalies: 0,
                timeAnomalies: 0
            };
        }

        const speedCount = anomalies.filter(a => a.anomalyReasons.some(r => r.includes('speed'))).length;
        const distCount = anomalies.filter(a => a.anomalyReasons.some(r => r.includes('distance') || r.includes('short') || r.includes('long'))).length;
        const timeCount = anomalies.filter(a => a.anomalyReasons.some(r => r.includes('duration') || r.includes('short') || r.includes('long'))).length;

        // Find most common reason
        const counts = {};
        anomalies.forEach(a => {
            a.anomalyReasons.forEach(r => {
                counts[r] = (counts[r] || 0) + 1;
            });
        });

        const mostCommon = Object.keys(counts).reduce((a, b) => 
            counts[a] > counts[b] ? a : b, 'None'
        );

        return {
            totalAnomalies: anomalies.length,
            anomalyRate: ((anomalies.length / totalData.length) * 100).toFixed(2),
            mostCommonReason: mostCommon,
            speedAnomalies: speedCount,
            distanceAnomalies: distCount,
            timeAnomalies: timeCount,
            avgScore: (anomalies.reduce((sum, a) => sum + parseFloat(a.anomalyScore), 0) / anomalies.length).toFixed(4)
        };
    }
}

module.exports = new AnomalyDetector();