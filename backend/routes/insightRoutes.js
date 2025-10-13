const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');

/**
 * Insight Routes
 * All routes related to analytics and statistics
 */

// GET /api/insights - Get comprehensive insights
router.get('/', insightController.getInsights);

// GET /api/insights/hourly - Get hourly statistics
router.get('/hourly', insightController.getHourlyStats);

// GET /api/insights/daily - Get daily statistics
router.get('/daily', insightController.getDailyStats);

// GET /api/insights/vendors - Get vendor statistics
router.get('/vendors', insightController.getVendorStats);

// GET /api/insights/passengers - Get passenger statistics
router.get('/passengers', insightController.getPassengerStats);

module.exports = router;
