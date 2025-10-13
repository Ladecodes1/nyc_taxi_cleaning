const Trip = require('../models/Trip');
const anomalyDetector = require('../utils/anomalyDetector');

class AnomalyController {
    async detectAnomalies(req, res) {
        try {
            const { threshold = 0.1 } = req.query;
            const thresh = parseFloat(threshold);

            if (thresh < 0 || thresh > 1) {
                return res.status(400).json({
                    success: false,
                    error: 'Threshold must be between 0 and 1'
                });
            }

            const anomalies = await Trip.findAnomalies(thresh);
            const stats = await Trip.getStats();
            const rate = stats.total_trips > 0 
                ? ((anomalies.length / stats.total_trips) * 100).toFixed(2) 
                : '0.00';

            res.json({
                success: true,
                data: {
                    anomalies,
                    totalAnomalies: anomalies.length,
                    anomalyRate: `${rate}%`,
                    threshold: thresh
                }
            });

        } catch (error) {
            console.error('Error detecting anomalies:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    async getAnomalySummary(req, res) {
        try {
            const { threshold = 0.1 } = req.query;
            const thresh = parseFloat(threshold);

            const anomalies = await Trip.findAnomalies(thresh);
            const stats = await Trip.getStats();

            // Group by anomaly type
            const speedCount = anomalies.filter(a => a.speed_anomaly).length;
            const distanceCount = anomalies.filter(a => a.distance_anomaly).length;
            const durationCount = anomalies.filter(a => a.duration_anomaly).length;

            const types = {
                speed: speedCount,
                distance: distanceCount,
                duration: durationCount
            };

            // Find most common type
            const mostCommon = Object.keys(types).reduce((a, b) => 
                types[a] > types[b] ? a : b
            );

            const summary = {
                totalAnomalies: anomalies.length,
                totalTrips: stats.total_trips,
                anomalyRate: stats.total_trips > 0 
                    ? ((anomalies.length / stats.total_trips) * 100).toFixed(2) 
                    : '0.00',
                anomalyTypes: types,
                mostCommonType: mostCommon,
                threshold: thresh
            };

            res.json({
                success: true,
                data: summary
            });

        } catch (error) {
            console.error('Error getting anomaly summary:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    async getSpeedAnomalies(req, res) {
        try {
            const { minSpeed = 120 } = req.query;
            const min = parseFloat(minSpeed);

            // TODO: Add custom query to optimize this
            const anomalies = await Trip.findAnomalies(0.1);
            const speedAnomalies = anomalies.filter(a => a.trip_speed_kmh > min);

            res.json({
                success: true,
                data: {
                    anomalies: speedAnomalies,
                    totalSpeedAnomalies: speedAnomalies.length,
                    minSpeedThreshold: min
                }
            });

        } catch (error) {
            console.error('Error getting speed anomalies:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    async getDistanceAnomalies(req, res) {
        try {
            const { maxDistance = 50, minDistance = 0.001 } = req.query;
            const max = parseFloat(maxDistance);
            const min = parseFloat(minDistance);

            const anomalies = await Trip.findAnomalies(0.1);
            const distAnomalies = anomalies.filter(a => 
                a.trip_distance_km > max || a.trip_distance_km < min
            );

            res.json({
                success: true,
                data: {
                    anomalies: distAnomalies,
                    totalDistanceAnomalies: distAnomalies.length,
                    distanceThresholds: { min, max }
                }
            });

        } catch (error) {
            console.error('Error getting distance anomalies:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    async getDurationAnomalies(req, res) {
        try {
            const { maxDuration = 7200, minDuration = 60 } = req.query;
            const max = parseFloat(maxDuration);
            const min = parseFloat(minDuration);

            const anomalies = await Trip.findAnomalies(0.1);
            const durAnomalies = anomalies.filter(a => 
                a.trip_duration > max || a.trip_duration < min
            );

            res.json({
                success: true,
                data: {
                    anomalies: durAnomalies,
                    totalDurationAnomalies: durAnomalies.length,
                    durationThresholds: { min, max }
                }
            });

        } catch (error) {
            console.error('Error getting duration anomalies:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Check for trips outside NYC bounds
    async getGeographicAnomalies(req, res) {
        try {
            const anomalies = await Trip.findAnomalies(0.1);
            
            // NYC bounding box
            const bounds = {
                lat: { min: 40.4774, max: 40.9176 },
                lng: { min: -74.2591, max: -73.7004 }
            };

            const geoAnomalies = anomalies.filter(a => 
                a.pickup_latitude < bounds.lat.min || a.pickup_latitude > bounds.lat.max ||
                a.pickup_longitude < bounds.lng.min || a.pickup_longitude > bounds.lng.max ||
                a.dropoff_latitude < bounds.lat.min || a.dropoff_latitude > bounds.lat.max ||
                a.dropoff_longitude < bounds.lng.min || a.dropoff_longitude > bounds.lng.max
            );

            res.json({
                success: true,
                data: {
                    anomalies: geoAnomalies,
                    totalGeographicAnomalies: geoAnomalies.length,
                    nycBounds: {
                        latitude: bounds.lat,
                        longitude: bounds.lng
                    }
                }
            });

        } catch (error) {
            console.error('Error getting geographic anomalies:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

module.exports = new AnomalyController();