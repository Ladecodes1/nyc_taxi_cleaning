const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

/**
 * Location Routes
 * All routes related to location analysis
 */

// GET /api/locations - Get location summaries
router.get('/', locationController.getLocations);

// GET /api/locations/pickup - Get pickup locations
router.get('/pickup', locationController.getPickupLocations);

// GET /api/locations/dropoff - Get dropoff locations
router.get('/dropoff', locationController.getDropoffLocations);

// GET /api/locations/stats - Get location statistics within bounds
router.get('/stats', locationController.getLocationStats);

module.exports = router;
