const express = require('express');
const router = express.Router();
const anomalyController = require('../controllers/anomalyController');

// All the endpoints
router.get('/', anomalyController.detectAnomalies);

router.get('/summary', anomalyController.getAnomalySummary);

router.get('/speed', anomalyController.getSpeedAnomalies);

router.get('/distance', anomalyController.getDistanceAnomalies);

router.get('/duration', anomalyController.getDurationAnomalies);

router.get('/geographic', anomalyController.getGeographicAnomalies);

module.exports = router;
