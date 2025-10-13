const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/', locationController.getLocations);

router.get('/pickup', locationController.getPickupLocations);

router.get('/dropoff', locationController.getDropoffLocations);

router.get('/stats', locationController.getLocationStats);

module.exports = router;
