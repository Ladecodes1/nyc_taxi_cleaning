const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class DataLoader {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/cleaned_taxi_data.csv');
        this.fallbackPath = path.join(__dirname, '../../logs/removed_records.csv');
    }

    async loadTaxiData() {
        try {
            if (fs.existsSync(this.dataPath)) {
                console.log('📁 Loading cleaned data...');
                return await this.parseCSV(this.dataPath);
            }
            
            if (fs.existsSync(this.fallbackPath)) {
                console.log('⚠️ Using removed records for demo...');
                return await this.parseCSV(this.fallbackPath);
            }
            
            throw new Error('No data files found. Ensure data/cleaned_taxi_data.csv exists.');
            
        } catch (error) {
            console.error('Error loading data:', error.message);
            throw error;
        }
    }

    async parseCSV(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    const cleaned = this.cleanRecord(data);
                    if (cleaned) results.push(cleaned);
                })
                .on('end', () => {
                    console.log(`✅ Parsed ${results.length} records`);
                    resolve(results);
                })
                .on('error', (error) => {
                    console.error('Error parsing CSV:', error);
                    reject(error);
                });
        });
    }

    cleanRecord(rec) {
        try {
            const cleaned = {
                id: rec.id || null,
                vendor_id: parseInt(rec.vendor_id) || null,
                pickup_datetime: rec.pickup_datetime || null,
                dropoff_datetime: rec.dropoff_datetime || null,
                passenger_count: parseInt(rec.passenger_count) || 0,
                pickup_longitude: parseFloat(rec.pickup_longitude) || null,
                pickup_latitude: parseFloat(rec.pickup_latitude) || null,
                dropoff_longitude: parseFloat(rec.dropoff_longitude) || null,
                dropoff_latitude: parseFloat(rec.dropoff_latitude) || null,
                store_and_fwd_flag: rec.store_and_fwd_flag || 'N',
                trip_duration: parseFloat(rec.trip_duration) || null
            };

            // Skip if missing essential data
            if (!cleaned.pickup_datetime || !cleaned.dropoff_datetime) {
                return null;
            }

            // Calculate derived fields
            cleaned.trip_duration_min = cleaned.trip_duration ? cleaned.trip_duration / 60 : null;
            cleaned.trip_distance_km = this.calcDistance(
                cleaned.pickup_latitude, cleaned.pickup_longitude,
                cleaned.dropoff_latitude, cleaned.dropoff_longitude
            );
            cleaned.trip_speed_kmh = this.calcSpeed(
                cleaned.trip_distance_km, cleaned.trip_duration
            );
            cleaned.distance_per_passenger = this.calcDistPerPassenger(
                cleaned.trip_distance_km, cleaned.passenger_count
            );

            // Add time features
            const dt = new Date(cleaned.pickup_datetime);
            cleaned.pickup_hour = dt.getHours();
            cleaned.pickup_day = dt.getDay();
            cleaned.pickup_day_name = this.getDayName(dt.getDay());
            cleaned.pickup_month = dt.getMonth() + 1;
            cleaned.pickup_month_name = this.getMonthName(dt.getMonth());

            return cleaned;

        } catch (error) {
            console.warn('Error cleaning record:', error.message);
            return null;
        }
    }

    // Haversine formula for distance
    calcDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        
        const R = 6371; // Earth radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRad(deg) {
        return deg * (Math.PI / 180);
    }

    calcSpeed(dist, dur) {
        if (!dist || !dur || dur === 0) return null;
        return (dist / (dur / 3600));
    }

    calcDistPerPassenger(dist, passengers) {
        if (!dist || !passengers || passengers === 0) return null;
        return dist / passengers;
    }

    getDayName(day) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day];
    }

    getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month];
    }

    getDataStats(data) {
        if (!data || data.length === 0) {
            return { count: 0, message: 'No data available' };
        }

        const speeds = data.map(r => r.trip_speed_kmh).filter(s => s && !isNaN(s));
        const dists = data.map(r => r.trip_distance_km).filter(d => d && !isNaN(d));
        const durs = data.map(r => r.trip_duration).filter(d => d && !isNaN(d));

        return {
            count: data.length,
            avgSpeed: speeds.length > 0 ? (speeds.reduce((sum, s) => sum + s, 0) / speeds.length).toFixed(2) : 0,
            avgDistance: dists.length > 0 ? (dists.reduce((sum, d) => sum + d, 0) / dists.length).toFixed(2) : 0,
            avgDuration: durs.length > 0 ? (durs.reduce((sum, d) => sum + d, 0) / durs.length).toFixed(2) : 0,
            dateRange: {
                earliest: data.reduce((earliest, r) => 
                    new Date(r.pickup_datetime) < new Date(earliest) ? r.pickup_datetime : earliest, 
                    data[0].pickup_datetime),
                latest: data.reduce((latest, r) => 
                    new Date(r.pickup_datetime) > new Date(latest) ? r.pickup_datetime : latest, 
                    data[0].pickup_datetime)
            }
        };
    }
}

module.exports = new DataLoader();