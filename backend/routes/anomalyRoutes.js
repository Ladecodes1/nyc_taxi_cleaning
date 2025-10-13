const express = require('express');
const router = express.Router();
const anomalyController = require('../controllers/anomalyController');

/**
 * Anomaly Routes
 * All routes related to anomaly detection and analysis
 */

// GET /api/anomalies - Detect anomalies
router.get('/', anomalyController.detectAnomalies);

// GET /api/anomalies/summary - Get anomaly summary
router.get('/summary', anomalyController.getAnomalySummary);

// GET /api/anomalies/speed - Get speed anomalies
router.get('/speed', anomalyController.getSpeedAnomalies);

// GET /api/anomalies/distance - Get distance anomalies
router.get('/distance', anomalyController.getDistanceAnomalies);

// GET /api/anomalies/duration - Get duration anomalies
router.get('/duration', anomalyController.getDurationAnomalies);

// GET /api/anomalies/geographic - Get geographic anomalies
router.get('/geographic', anomalyController.getGeographicAnomalies);

module.exports = router;
