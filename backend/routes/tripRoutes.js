const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

/**
 * Trip Routes
 * All routes related to trip operations
 */

// GET /api/trips - Get trips with filters
router.get('/', tripController.getTrips);

// GET /api/trips/:id - Get trip by ID
router.get('/:id', tripController.getTripById);

// POST /api/trips - Create new trip
router.post('/', tripController.createTrip);

// PUT /api/trips/:id - Update trip by ID
router.put('/:id', tripController.updateTrip);

// DELETE /api/trips/:id - Delete trip by ID
router.delete('/:id', tripController.deleteTrip);

// POST /api/trips/bulk - Bulk create trips
router.post('/bulk', tripController.bulkCreateTrips);

module.exports = router;
