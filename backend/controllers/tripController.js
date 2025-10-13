const Trip = require('../models/Trip');

// Get all trips with filters
const getTrips = async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            minDuration: req.query.minDuration,
            maxDuration: req.query.maxDuration,
            minDistance: req.query.minDistance,
            maxDistance: req.query.maxDistance,
            minSpeed: req.query.minSpeed,
            maxSpeed: req.query.maxSpeed,
            passengerCount: req.query.passengerCount,
            vendorId: req.query.vendorId
        };

        const options = {
            limit: req.query.limit,
            offset: req.query.offset,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder
        };

        const result = await Trip.findWithFilters(filters, options);

        res.json({
            success: true,
            data: result.data,
            total: result.total,
            limit: result.limit,
            offset: result.offset
        });

    } catch (error) {
        console.error('Error getting trips:', error);
        res.status(500).json({
            success: false,
            error: 'Something went wrong',
            message: error.message
        });
    }
};

// Get one trip
const getTripById = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await Trip.findById(id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        res.json({
            success: true,
            data: trip
        });

    } catch (error) {
        console.error('Error getting trip:', error);
        res.status(500).json({
            success: false,
            error: 'Something went wrong',
            message: error.message
        });
    }
};

// Add new trip
const createTrip = async (req, res) => {
    try {
        const trip = await Trip.create(req.body);

        res.status(201).json({
            success: true,
            data: trip,
            message: 'Trip created'
        });

    } catch (error) {
        console.error('Error creating trip:', error);
        res.status(500).json({
            success: false,
            error: 'Something went wrong',
            message: error.message
        });
    }
};

// Update trip
const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await Trip.updateById(id, req.body);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        res.json({
            success: true,
            data: trip,
            message: 'Trip updated'
        });

    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).json({
            success: false,
            error: 'Something went wrong',
            message: error.message
        });
    }
};

// Delete trip
const deleteTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Trip.deleteById(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        res.json({
            success: true,
            message: 'Trip deleted'
        });

    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).json({
            success: false,
            error: 'Something went wrong',
            message: error.message
        });
    }
};

// Add many trips at once
const bulkCreateTrips = async (req, res) => {
    try {
        const { trips } = req.body;

        if (!trips || !Array.isArray(trips)) {
            return res.status(400).json({
                success: false,
                error: 'Need array of trips'
            });
        }

        const result = await Trip.bulkCreate(trips);

        res.status(201).json({
            success: true,
            data: result,
            message: `Created ${result.inserted} trips`
        });

    } catch (error) {
        console.error('Error bulk creating trips:', error);
        res.status(500).json({
            success: false,
            error: 'Something went wrong',
            message: error.message
        });
    }
};

module.exports = {
    getTrips,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip,
    bulkCreateTrips
};