# NYC Taxi Backend - Setup Guide

## Overview
This guide will help you set up the NYC Taxi Data Backend with MySQL database using the MVC architecture.

## Prerequisites

### Required Software
- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher)
- **npm** or **yarn**

### System Requirements
- Minimum 2GB RAM
- 1GB free disk space
- MySQL server running

## Installation Steps

### 1. Clone and Navigate to Backend
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Option A: Using MySQL Command Line
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE nyc_taxi;
CREATE USER 'taxi_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON nyc_taxi.* TO 'taxi_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Create new connection
3. Create database: `nyc_taxi`
4. Create user with full privileges

### 4. Environment Configuration

Create a `.env` file in the backend directory:
```bash
cp env.example .env
```

Edit `.env` file with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nyc_taxi
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000
```

### 5. Database Migration
```bash
npm run migrate
```

This will:
- Create the database if it doesn't exist
- Create all necessary tables
- Set up indexes for optimal performance

### 6. Import Data (Optional)
```bash
npm run import
```

This will import data from CSV files into the MySQL database.

### 7. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Project Structure

```
backend/
├── app.js                 # Main application entry point
├── config/
│   └── database.js        # Database configuration
├── controllers/            # Business logic controllers
│   ├── tripController.js
│   ├── insightController.js
│   ├── locationController.js
│   └── anomalyController.js
├── models/                # Data models
│   └── Trip.js
├── routes/                # API route definitions
│   ├── tripRoutes.js
│   ├── insightRoutes.js
│   ├── locationRoutes.js
│   └── anomalyRoutes.js
├── utils/                 # Utility functions
│   ├── dataLoader.js
│   ├── anomalyDetector.js
│   └── customSorter.js
├── scripts/               # Database scripts
│   ├── migrate.js
│   └── importData.js
└── test-api.js           # API testing script
```

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Available Endpoints

#### Health & Info
- `GET /health` - Server health check
- `GET /` - API information

#### Trips
- `GET /api/trips` - Get trips with filters
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/bulk` - Bulk create trips

#### Insights
- `GET /api/insights` - Comprehensive statistics
- `GET /api/insights/hourly` - Hourly statistics
- `GET /api/insights/daily` - Daily statistics
- `GET /api/insights/vendors` - Vendor statistics
- `GET /api/insights/passengers` - Passenger statistics

#### Locations
- `GET /api/locations` - Location summaries
- `GET /api/locations/pickup` - Pickup locations
- `GET /api/locations/dropoff` - Dropoff locations
- `GET /api/locations/stats` - Location statistics

#### Anomalies
- `GET /api/anomalies` - Detect anomalies
- `GET /api/anomalies/summary` - Anomaly summary
- `GET /api/anomalies/speed` - Speed anomalies
- `GET /api/anomalies/distance` - Distance anomalies
- `GET /api/anomalies/duration` - Duration anomalies
- `GET /api/anomalies/geographic` - Geographic anomalies

## Testing

### Run API Tests
```bash
npm test
```

### Manual Testing
```bash
# Health check
curl http://localhost:3000/health

# Get trips
curl "http://localhost:3000/api/trips?limit=5"

# Get insights
curl http://localhost:3000/api/insights

# Detect anomalies
curl "http://localhost:3000/api/anomalies?threshold=0.1"
```

## Database Schema

### Trips Table
```sql
CREATE TABLE trips (
    id VARCHAR(50) PRIMARY KEY,
    vendor_id INT NOT NULL,
    pickup_datetime DATETIME NOT NULL,
    dropoff_datetime DATETIME NOT NULL,
    passenger_count INT DEFAULT 0,
    pickup_longitude DECIMAL(10, 8) NOT NULL,
    pickup_latitude DECIMAL(10, 8) NOT NULL,
    dropoff_longitude DECIMAL(10, 8) NOT NULL,
    dropoff_latitude DECIMAL(10, 8) NOT NULL,
    store_and_fwd_flag CHAR(1) DEFAULT 'N',
    trip_duration DECIMAL(10, 2),
    trip_duration_min DECIMAL(10, 2),
    trip_distance_km DECIMAL(10, 4),
    trip_speed_kmh DECIMAL(10, 2),
    distance_per_passenger DECIMAL(10, 4),
    pickup_hour INT,
    pickup_day INT,
    pickup_day_name VARCHAR(20),
    pickup_month INT,
    pickup_month_name VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: connect ECONNREFUSED
```
**Solution:**
- Ensure MySQL server is running
- Check database credentials in `.env`
- Verify database exists

#### 2. Permission Denied
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solution:**
- Check username and password
- Ensure user has proper privileges
- Grant necessary permissions

#### 3. Table Already Exists
```
Error: Table 'trips' already exists
```
**Solution:**
- This is normal for subsequent runs
- Tables are created with `IF NOT EXISTS`

#### 4. Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution:**
- Change PORT in `.env` file
- Kill process using port 3000
- Use different port

### Performance Optimization

#### Database Indexes
The migration script creates optimized indexes:
- `idx_pickup_datetime` - For date filtering
- `idx_vendor_id` - For vendor filtering
- `idx_trip_speed` - For speed filtering
- `idx_pickup_hour` - For hourly analysis
- `idx_pickup_lat_lon` - For location queries

#### Connection Pooling
- Default: 10 connections
- Configurable in `config/database.js`
- Automatic reconnection enabled

## Development

### Adding New Features

#### 1. New Controller
```javascript
// controllers/newController.js
class NewController {
    async getData(req, res) {
        // Implementation
    }
}
module.exports = new NewController();
```

#### 2. New Routes
```javascript
// routes/newRoutes.js
const express = require('express');
const router = express.Router();
const newController = require('../controllers/newController');

router.get('/', newController.getData);
module.exports = router;
```

#### 3. Register Routes
```javascript
// app.js
const newRoutes = require('./routes/newRoutes');
app.use('/api/new', newRoutes);
```

### Database Operations

#### Using the Trip Model
```javascript
const Trip = require('./models/Trip');

// Create trip
const trip = await Trip.create(tripData);

// Find trips with filters
const trips = await Trip.findWithFilters(filters, pagination, sorting);

// Get statistics
const stats = await Trip.getStats();
```

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
DB_HOST=your_production_host
DB_USER=your_production_user
DB_PASSWORD=your_secure_password
DB_NAME=nyc_taxi_prod
PORT=3000
```

### Security Considerations
- Use strong database passwords
- Enable SSL for database connections
- Set up proper CORS origins
- Use environment variables for secrets
- Enable database connection encryption

### Monitoring
- Health check endpoint: `/health`
- Database connection monitoring
- Error logging and tracking
- Performance metrics

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review error logs
3. Test database connectivity
4. Verify environment configuration

## License

MIT License - See LICENSE file for details
