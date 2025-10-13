const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// Get trips with filters
router.get('/', tripController.getTrips);

router.get('/:id', tripController.getTripById);

router.post('/', tripController.createTrip);

router.delete('/:id', tripController.deleteTrip);

router.post('/bulk', tripController.bulkCreateTrips);

module.exports = router;
