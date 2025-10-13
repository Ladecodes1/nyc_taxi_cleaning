const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database
const db = require('./config/database');

// Import routes
const tripRoutes = require('./routes/tripRoutes');
const insightRoutes = require('./routes/insightRoutes');
const locationRoutes = require('./routes/locationRoutes');
const anomalyRoutes = require('./routes/anomalyRoutes');

// Import models to initialize tables
const Trip = require('./models/Trip');

/**
 * Express Application Setup
 */
class App {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * Setup middleware
     */
    setupMiddleware() {
        // CORS
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    /**
     * Setup routes
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', async (req, res) => {
            try {
                const dbStats = await db.getStats();
                res.json({
                    status: 'OK',
                    timestamp: new Date().toISOString(),
                    database: dbStats,
                    version: process.env.API_VERSION || 'v1'
                });
            } catch (error) {
                res.status(503).json({
                    status: 'ERROR',
                    timestamp: new Date().toISOString(),
                    error: 'Database connection failed',
                    message: error.message
                });
            }
        });

        // API routes
        this.app.use('/api/trips', tripRoutes);
        this.app.use('/api/insights', insightRoutes);
        this.app.use('/api/locations', locationRoutes);
        this.app.use('/api/anomalies', anomalyRoutes);

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                message: 'NYC Taxi Data API',
                version: process.env.API_VERSION || 'v1',
                endpoints: {
                    health: '/health',
                    trips: '/api/trips',
                    insights: '/api/insights',
                    locations: '/api/locations',
                    anomalies: '/api/anomalies'
                },
                documentation: '/api/docs'
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint not found',
                message: `The requested endpoint ${req.originalUrl} does not exist`
            });
        });
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // Global error handler
        this.app.use((err, req, res, next) => {
            console.error('Global error handler:', err);
            
            // Database connection errors
            if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
                return res.status(503).json({
                    success: false,
                    error: 'Database connection failed',
                    message: 'Unable to connect to the database'
                });
            }

            // Validation errors
            if (err.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    message: err.message
                });
            }

            // Default error
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
            });
        });
    }

    /**
     * Initialize database and start server
     */
    async start() {
        try {
            console.log('🚀 Starting NYC Taxi Data API...');
            
            // Initialize database
            console.log('📊 Initializing database connection...');
            const dbConnected = await db.initialize();
            
            if (!dbConnected) {
                console.error('❌ Failed to connect to database. Server will start but some features may not work.');
            }

            // Create database tables
            if (dbConnected) {
                console.log('📋 Creating database tables...');
                await Trip.createTable();
            }

            // Start server
            this.app.listen(this.port, () => {
                console.log(`✅ Server running on port ${this.port}`);
                console.log(`🌐 API available at http://localhost:${this.port}`);
                console.log(`📊 Health check: http://localhost:${this.port}/health`);
                console.log(`📚 API Documentation: http://localhost:${this.port}/`);
            });

        } catch (error) {
            console.error('❌ Failed to start server:', error.message);
            process.exit(1);
        }
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        console.log('🛑 Shutting down server...');
        
        try {
            await db.close();
            console.log('✅ Database connections closed');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during shutdown:', error.message);
            process.exit(1);
        }
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    app.shutdown();
});

process.on('SIGINT', () => {
    console.log('SIGINT received');
    app.shutdown();
});

// Create and start the application
const app = new App();
app.start();

module.exports = app;
