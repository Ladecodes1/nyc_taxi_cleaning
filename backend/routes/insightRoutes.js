const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');


router.get('/', insightController.getInsights);

router.get('/hourly', insightController.getHourlyStats);

router.get('/daily', insightController.getDailyStats);

router.get('/vendors', insightController.getVendorStats);

router.get('/passengers', insightController.getPassengerStats);

module.exports = router;
