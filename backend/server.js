const express = require('express');
const cors = require('cors');

// Routes
const tripRoutes = require('./routes/tripRoutes');
const insightRoutes = require('./routes/insightRoutes');
const locationRoutes = require('./routes/locationRoutes');
const anomalyRoutes = require('./routes/anomalyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/trips', tripRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/anomalies', anomalyRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'NYC Taxi Data API',
        version: 'v1',
        endpoints: {
            trips: '/api/trips',
            insights: '/api/insights',
            locations: '/api/locations',
            anomalies: '/api/anomalies'
        }
    });
});

// Handling errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 request handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});

module.exports = app;