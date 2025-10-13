const Trip = require('../models/Trip');

/**
 * Location Controller - Handles location-based analytics
 */
class LocationController {
    /**
     * Get location summaries for pickup and dropoff points
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getLocations(req, res) {
        try {
            const { type = 'both', limit = 50 } = req.query;
            const limitNum = parseInt(limit);

            let locations = {};

            if (type === 'pickup' || type === 'both') {
                const pickupLocations = await Trip.getLocationSummary('pickup', limitNum);
                locations.pickup = pickupLocations.map(location => ({
                    latitude: parseFloat(location.latitude),
                    longitude: parseFloat(location.longitude),
                    count: location.count,
                    averageDistance: parseFloat(location.avg_distance || 0).toFixed(2),
                    averageSpeed: parseFloat(location.avg_speed || 0).toFixed(2)
                }));
            }

            if (type === 'dropoff' || type === 'both') {
                const dropoffLocations = await Trip.getLocationSummary('dropoff', limitNum);
                locations.dropoff = dropoffLocations.map(location => ({
                    latitude: parseFloat(location.latitude),
                    longitude: parseFloat(location.longitude),
                    count: location.count,
                    averageDistance: parseFloat(location.avg_distance || 0).toFixed(2),
                    averageSpeed: parseFloat(location.avg_speed || 0).toFixed(2)
                }));
            }

            res.json({
                success: true,
                data: locations
            });

        } catch (error) {
            console.error('Error in getLocations:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get pickup location summaries
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getPickupLocations(req, res) {
        try {
            const { limit = 50 } = req.query;
            const limitNum = parseInt(limit);

            const pickupLocations = await Trip.getLocationSummary('pickup', limitNum);
            
            const locations = pickupLocations.map(location => ({
                latitude: parseFloat(location.latitude),
                longitude: parseFloat(location.longitude),
                count: location.count,
                averageDistance: parseFloat(location.avg_distance || 0).toFixed(2),
                averageSpeed: parseFloat(location.avg_speed || 0).toFixed(2)
            }));

            res.json({
                success: true,
                data: locations
            });

        } catch (error) {
            console.error('Error in getPickupLocations:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get dropoff location summaries
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getDropoffLocations(req, res) {
        try {
            const { limit = 50 } = req.query;
            const limitNum = parseInt(limit);

            const dropoffLocations = await Trip.getLocationSummary('dropoff', limitNum);
            
            const locations = dropoffLocations.map(location => ({
                latitude: parseFloat(location.latitude),
                longitude: parseFloat(location.longitude),
                count: location.count,
                averageDistance: parseFloat(location.avg_distance || 0).toFixed(2),
                averageSpeed: parseFloat(location.avg_speed || 0).toFixed(2)
            }));

            res.json({
                success: true,
                data: locations
            });

        } catch (error) {
            console.error('Error in getDropoffLocations:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get location statistics within a bounding box
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getLocationStats(req, res) {
        try {
            const { 
                minLat, maxLat, minLon, maxLon, 
                type = 'both', limit = 100 
            } = req.query;

            if (!minLat || !maxLat || !minLon || !maxLon) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: minLat, maxLat, minLon, maxLon'
                });
            }

            // This would require a custom query in the Trip model
            // For now, we'll return a placeholder response
            res.json({
                success: true,
                data: {
                    message: 'Location stats within bounding box - requires custom implementation',
                    bounds: {
                        minLat: parseFloat(minLat),
                        maxLat: parseFloat(maxLat),
                        minLon: parseFloat(minLon),
                        maxLon: parseFloat(maxLon)
                    }
                }
            });

        } catch (error) {
            console.error('Error in getLocationStats:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

module.exports = new LocationController();
