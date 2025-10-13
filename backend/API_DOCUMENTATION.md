# NYC Taxi Data Backend API Documentation

## Overview
This Node.js backend provides a comprehensive API for analyzing NYC taxi trip data using MySQL database with MVC architecture. The API includes endpoints for querying trips, generating insights, analyzing locations, and detecting anomalies using custom algorithms.

## Architecture
- **MVC Pattern**: Models, Controllers, and Routes separated
- **MySQL Database**: Persistent data storage with optimized queries
- **RESTful API**: Standard HTTP methods and status codes
- **Custom Algorithms**: Manual implementation without external AI libraries

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, no authentication is required. All endpoints are publicly accessible.

## Database Schema
The API uses a MySQL database with the following main table:

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

## API Endpoints

### Health & Information

#### 1. Health Check
**GET** `/health`

Check the server status and database connection.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": {
    "connected": true,
    "activeConnections": 2,
    "uptime": 3600
  },
  "version": "v1"
}
```

#### 2. API Information
**GET** `/`

Get API information and available endpoints.

**Response:**
```json
{
  "message": "NYC Taxi Data API",
  "version": "v1",
  "endpoints": {
    "health": "/health",
    "trips": "/api/trips",
    "insights": "/api/insights",
    "locations": "/api/locations",
    "anomalies": "/api/anomalies"
  },
  "documentation": "/api/docs"
}
```

### Trip Management

#### 3. Query Trips
**GET** `/api/trips`

Query taxi trips with various filters and sorting options.

**Query Parameters:**
- `startDate` (string): Filter trips from this date (YYYY-MM-DD)
- `endDate` (string): Filter trips until this date (YYYY-MM-DD)
- `minDuration` (number): Minimum trip duration in seconds
- `maxDuration` (number): Maximum trip duration in seconds
- `minDistance` (number): Minimum trip distance in kilometers
- `maxDistance` (number): Maximum trip distance in kilometers
- `minSpeed` (number): Minimum average speed in km/h
- `maxSpeed` (number): Maximum average speed in km/h
- `passengerCount` (number): Exact passenger count
- `vendorId` (number): Vendor ID (1 or 2)
- `sortBy` (string): Field to sort by (default: 'pickup_datetime')
- `sortOrder` (string): Sort order - 'asc' or 'desc' (default: 'desc')
- `limit` (number): Number of records to return (default: 100)
- `offset` (number): Number of records to skip (default: 0)

**Example Request:**
```
GET /api/trips?startDate=2016-01-01&endDate=2016-01-31&minSpeed=10&maxSpeed=80&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "id123456",
      "vendor_id": 1,
      "pickup_datetime": "2016-01-15T08:30:00.000Z",
      "dropoff_datetime": "2016-01-15T08:45:00.000Z",
      "passenger_count": 2,
      "pickup_longitude": -73.9857,
      "pickup_latitude": 40.7484,
      "dropoff_longitude": -73.9776,
      "dropoff_latitude": 40.7505,
      "trip_duration": 900,
      "trip_duration_min": 15,
      "trip_distance_km": 2.5,
      "trip_speed_kmh": 10.0,
      "distance_per_passenger": 1.25,
      "pickup_hour": 8,
      "pickup_day": 5,
      "pickup_day_name": "Friday",
      "pickup_month": 1,
      "pickup_month_name": "January",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  },
  "filters": {
    "startDate": "2016-01-01",
    "endDate": "2016-01-31",
    "minSpeed": "10",
    "maxSpeed": "80",
    "limit": "50"
  }
}
```

#### 4. Get Trip by ID
**GET** `/api/trips/:id`

Get a specific trip by its ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "id123456",
    "vendor_id": 1,
    "pickup_datetime": "2016-01-15T08:30:00.000Z",
    "dropoff_datetime": "2016-01-15T08:45:00.000Z",
    "passenger_count": 2,
    "pickup_longitude": -73.9857,
    "pickup_latitude": 40.7484,
    "dropoff_longitude": -73.9776,
    "dropoff_latitude": 40.7505,
    "trip_duration": 900,
    "trip_duration_min": 15,
    "trip_distance_km": 2.5,
    "trip_speed_kmh": 10.0,
    "distance_per_passenger": 1.25,
    "pickup_hour": 8,
    "pickup_day": 5,
    "pickup_day_name": "Friday",
    "pickup_month": 1,
    "pickup_month_name": "January",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 5. Create Trip
**POST** `/api/trips`

Create a new trip record.

**Request Body:**
```json
{
  "id": "id123456",
  "vendor_id": 1,
  "pickup_datetime": "2016-01-15T08:30:00.000Z",
  "dropoff_datetime": "2016-01-15T08:45:00.000Z",
  "passenger_count": 2,
  "pickup_longitude": -73.9857,
  "pickup_latitude": 40.7484,
  "dropoff_longitude": -73.9776,
  "dropoff_latitude": 40.7505,
  "store_and_fwd_flag": "N",
  "trip_duration": 900,
  "trip_duration_min": 15,
  "trip_distance_km": 2.5,
  "trip_speed_kmh": 10.0,
  "distance_per_passenger": 1.25,
  "pickup_hour": 8,
  "pickup_day": 5,
  "pickup_day_name": "Friday",
  "pickup_month": 1,
  "pickup_month_name": "January"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "id123456",
    "vendor_id": 1,
    "pickup_datetime": "2016-01-15T08:30:00.000Z",
    "dropoff_datetime": "2016-01-15T08:45:00.000Z",
    "passenger_count": 2,
    "pickup_longitude": -73.9857,
    "pickup_latitude": 40.7484,
    "dropoff_longitude": -73.9776,
    "dropoff_latitude": 40.7505,
    "trip_duration": 900,
    "trip_duration_min": 15,
    "trip_distance_km": 2.5,
    "trip_speed_kmh": 10.0,
    "distance_per_passenger": 1.25,
    "pickup_hour": 8,
    "pickup_day": 5,
    "pickup_day_name": "Friday",
    "pickup_month": 1,
    "pickup_month_name": "January",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Trip created successfully"
}
```

#### 6. Update Trip
**PUT** `/api/trips/:id`

Update an existing trip record.

**Request Body:**
```json
{
  "passenger_count": 3,
  "trip_duration": 950,
  "trip_duration_min": 15.83
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "id123456",
    "vendor_id": 1,
    "pickup_datetime": "2016-01-15T08:30:00.000Z",
    "dropoff_datetime": "2016-01-15T08:45:00.000Z",
    "passenger_count": 3,
    "pickup_longitude": -73.9857,
    "pickup_latitude": 40.7484,
    "dropoff_longitude": -73.9776,
    "dropoff_latitude": 40.7505,
    "trip_duration": 950,
    "trip_duration_min": 15.83,
    "trip_distance_km": 2.5,
    "trip_speed_kmh": 9.47,
    "distance_per_passenger": 0.83,
    "pickup_hour": 8,
    "pickup_day": 5,
    "pickup_day_name": "Friday",
    "pickup_month": 1,
    "pickup_month_name": "January",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z"
  },
  "message": "Trip updated successfully"
}
```

#### 7. Delete Trip
**DELETE** `/api/trips/:id`

Delete a trip record.

**Response:**
```json
{
  "success": true,
  "message": "Trip deleted successfully"
}
```

#### 8. Bulk Create Trips
**POST** `/api/trips/bulk`

Create multiple trip records at once.

**Request Body:**
```json
{
  "trips": [
    {
      "id": "id123456",
      "vendor_id": 1,
      "pickup_datetime": "2016-01-15T08:30:00.000Z",
      "dropoff_datetime": "2016-01-15T08:45:00.000Z",
      "passenger_count": 2,
      "pickup_longitude": -73.9857,
      "pickup_latitude": 40.7484,
      "dropoff_longitude": -73.9776,
      "dropoff_latitude": 40.7505,
      "trip_duration": 900,
      "trip_duration_min": 15,
      "trip_distance_km": 2.5,
      "trip_speed_kmh": 10.0,
      "distance_per_passenger": 1.25,
      "pickup_hour": 8,
      "pickup_day": 5,
      "pickup_day_name": "Friday",
      "pickup_month": 1,
      "pickup_month_name": "January"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inserted": 1,
    "errors": []
  },
  "message": "1 trips created successfully"
}
```

### Analytics & Insights

#### 9. Comprehensive Insights
**GET** `/api/insights`

Get aggregate statistics and insights about the taxi data.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTrips": 1000,
    "averageSpeed": "25.5",
    "averageDistance": "3.2",
    "averageDuration": "900",
    "busiestHour": {
      "hour": 17,
      "count": 150,
      "percentage": "15.00"
    },
    "busiestDay": {
      "day": "Friday",
      "count": 200,
      "percentage": "20.00"
    },
    "speedDistribution": {
      "average": "25.5"
    },
    "distanceDistribution": {
      "average": "3.2"
    },
    "hourlyStats": {
      "0": {
        "count": 20,
        "averageSpeed": "30.2",
        "averageDistance": "4.1",
        "averageDuration": "1200"
      }
    },
    "dailyStats": {
      "Sunday": {
        "count": 120,
        "averageSpeed": "28.5",
        "averageDistance": "3.8",
        "averageDuration": "1100"
      }
    },
    "vendorStats": {
      "1": {
        "count": 600,
        "averageDistance": "3.1",
        "averageDuration": "850"
      },
      "2": {
        "count": 400,
        "averageDistance": "3.4",
        "averageDuration": "950"
      }
    },
    "passengerStats": {
      "1": {
        "count": 800,
        "averageDistance": "3.0"
      },
      "2": {
        "count": 150,
        "averageDistance": "3.5"
      }
    },
    "dateRange": {
      "earliest": "2016-01-01T00:00:00.000Z",
      "latest": "2016-12-31T23:59:59.000Z"
    }
  }
}
```

#### 10. Hourly Statistics
**GET** `/api/insights/hourly`

Get hourly statistics for all 24 hours.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "pickup_hour": 0,
      "count": 20,
      "avg_speed": "30.2",
      "avg_distance": "4.1",
      "avg_duration": "1200"
    },
    {
      "pickup_hour": 1,
      "count": 15,
      "avg_speed": "28.5",
      "avg_distance": "3.8",
      "avg_duration": "1100"
    }
  ]
}
```

#### 11. Daily Statistics
**GET** `/api/insights/daily`

Get daily statistics for all days of the week.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "pickup_day": 0,
      "pickup_day_name": "Sunday",
      "count": 120,
      "avg_speed": "28.5",
      "avg_distance": "3.8",
      "avg_duration": "1100"
    },
    {
      "pickup_day": 1,
      "pickup_day_name": "Monday",
      "count": 150,
      "avg_speed": "25.2",
      "avg_distance": "3.2",
      "avg_duration": "950"
    }
  ]
}
```

#### 12. Vendor Statistics
**GET** `/api/insights/vendors`

Get statistics by vendor.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "vendor_id": 1,
      "count": 600,
      "avg_distance": "3.1",
      "avg_duration": "850"
    },
    {
      "vendor_id": 2,
      "count": 400,
      "avg_distance": "3.4",
      "avg_duration": "950"
    }
  ]
}
```

#### 13. Passenger Statistics
**GET** `/api/insights/passengers`

Get statistics by passenger count.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "passenger_count": 1,
      "count": 800,
      "avg_distance": "3.0"
    },
    {
      "passenger_count": 2,
      "count": 150,
      "avg_distance": "3.5"
    }
  ]
}
```

### Location Analysis

#### 14. Location Summaries
**GET** `/api/locations`

Get pickup and dropoff location summaries.

**Query Parameters:**
- `type` (string): 'pickup', 'dropoff', or 'both' (default: 'both')
- `limit` (number): Number of locations to return (default: 50)

**Example Request:**
```
GET /api/locations?type=pickup&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pickup": [
      {
        "latitude": 40.75,
        "longitude": -73.98,
        "count": 45,
        "averageDistance": "2.8",
        "averageSpeed": "25.3"
      }
    ],
    "dropoff": [
      {
        "latitude": 40.76,
        "longitude": -73.97,
        "count": 38,
        "averageDistance": "3.1",
        "averageSpeed": "24.8"
      }
    ]
  }
}
```

#### 15. Pickup Locations
**GET** `/api/locations/pickup`

Get pickup location summaries only.

**Query Parameters:**
- `limit` (number): Number of locations to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "latitude": 40.75,
      "longitude": -73.98,
      "count": 45,
      "averageDistance": "2.8",
      "averageSpeed": "25.3"
    }
  ]
}
```

#### 16. Dropoff Locations
**GET** `/api/locations/dropoff`

Get dropoff location summaries only.

**Query Parameters:**
- `limit` (number): Number of locations to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "latitude": 40.76,
      "longitude": -73.97,
      "count": 38,
      "averageDistance": "3.1",
      "averageSpeed": "24.8"
    }
  ]
}
```

#### 17. Location Statistics
**GET** `/api/locations/stats`

Get location statistics within a bounding box.

**Query Parameters:**
- `minLat` (number): Minimum latitude
- `maxLat` (number): Maximum latitude
- `minLon` (number): Minimum longitude
- `maxLon` (number): Maximum longitude
- `type` (string): 'pickup', 'dropoff', or 'both' (default: 'both')
- `limit` (number): Number of results to return (default: 100)

**Example Request:**
```
GET /api/locations/stats?minLat=40.7&maxLat=40.8&minLon=-74.0&maxLon=-73.9&type=pickup&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Location stats within bounding box - requires custom implementation",
    "bounds": {
      "minLat": 40.7,
      "maxLat": 40.8,
      "minLon": -74.0,
      "maxLon": -73.9
    }
  }
}
```

### Anomaly Detection

#### 18. Detect Anomalies
**GET** `/api/anomalies`

Detect anomalous trips using custom algorithms.

**Query Parameters:**
- `threshold` (number): Anomaly detection threshold (0-1, default: 0.1)

**Example Request:**
```
GET /api/anomalies?threshold=0.2
```

**Response:**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "id123456",
        "vendor_id": 1,
        "pickup_datetime": "2016-01-15T08:30:00.000Z",
        "trip_speed_kmh": 150.5,
        "trip_distance_km": 0.001,
        "trip_duration": 30,
        "anomalyScore": "0.8500",
        "anomalyReasons": [
          "Unrealistic speed: 150.50 km/h",
          "Too short distance: 0.0010 km",
          "Too short duration: 30 seconds"
        ],
        "recordIndex": 123
      }
    ],
    "totalAnomalies": 25,
    "anomalyRate": "2.50%",
    "threshold": 0.2
  }
}
```

#### 19. Anomaly Summary
**GET** `/api/anomalies/summary`

Get summary statistics about anomalies.

**Query Parameters:**
- `threshold` (number): Anomaly detection threshold (0-1, default: 0.1)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAnomalies": 25,
    "totalTrips": 1000,
    "anomalyRate": "2.50",
    "anomalyTypes": {
      "speed": 15,
      "distance": 8,
      "duration": 12
    },
    "mostCommonType": "speed",
    "threshold": 0.1
  }
}
```

#### 20. Speed Anomalies
**GET** `/api/anomalies/speed`

Get trips with unrealistic speeds.

**Query Parameters:**
- `minSpeed` (number): Minimum speed threshold (default: 120 km/h)

**Response:**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "id123456",
        "trip_speed_kmh": 150.5,
        "pickup_datetime": "2016-01-15T08:30:00.000Z",
        "trip_distance_km": 2.5,
        "trip_duration": 60
      }
    ],
    "totalSpeedAnomalies": 15,
    "minSpeedThreshold": 120
  }
}
```

#### 21. Distance Anomalies
**GET** `/api/anomalies/distance`

Get trips with unrealistic distances.

**Query Parameters:**
- `maxDistance` (number): Maximum distance threshold (default: 50 km)
- `minDistance` (number): Minimum distance threshold (default: 0.001 km)

**Response:**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "id123456",
        "trip_distance_km": 0.001,
        "pickup_datetime": "2016-01-15T08:30:00.000Z",
        "trip_speed_kmh": 0.36,
        "trip_duration": 10
      }
    ],
    "totalDistanceAnomalies": 8,
    "distanceThresholds": {
      "min": 0.001,
      "max": 50
    }
  }
}
```

#### 22. Duration Anomalies
**GET** `/api/anomalies/duration`

Get trips with unrealistic durations.

**Query Parameters:**
- `maxDuration` (number): Maximum duration threshold (default: 7200 seconds)
- `minDuration` (number): Minimum duration threshold (default: 60 seconds)

**Response:**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "id123456",
        "trip_duration": 30,
        "pickup_datetime": "2016-01-15T08:30:00.000Z",
        "trip_speed_kmh": 300.0,
        "trip_distance_km": 2.5
      }
    ],
    "totalDurationAnomalies": 12,
    "durationThresholds": {
      "min": 60,
      "max": 7200
    }
  }
}
```

#### 23. Geographic Anomalies
**GET** `/api/anomalies/geographic`

Get trips with coordinates outside NYC bounds.

**Response:**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "id123456",
        "pickup_latitude": 40.3,
        "pickup_longitude": -74.5,
        "dropoff_latitude": 40.2,
        "dropoff_longitude": -74.6,
        "pickup_datetime": "2016-01-15T08:30:00.000Z"
      }
    ],
    "totalGeographicAnomalies": 5,
    "nycBounds": {
      "latitude": { "min": 40.4774, "max": 40.9176 },
      "longitude": { "min": -74.2591, "max": -73.7004 }
    }
  }
}
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Custom Algorithms

### Anomaly Detection Algorithm
The system implements a custom anomaly detection algorithm that identifies unrealistic trips based on:

1. **Speed Anomalies**: Trips with speeds > 120 km/h
2. **Distance Anomalies**: Trips with extremely short (< 0.001 km) or long distances
3. **Duration Anomalies**: Trips with unrealistic durations (< 60s or > 2 hours)
4. **Geographic Anomalies**: Trips outside NYC bounds
5. **Data Consistency**: Speed vs distance vs duration consistency checks
6. **Temporal Anomalies**: Future dates or very old dates

### Custom Sorting Algorithms
The system implements multiple sorting algorithms:

1. **Quick Sort**: Default algorithm for most use cases
2. **Merge Sort**: Stable sorting for complex data
3. **Bubble Sort**: Simple algorithm for small datasets
4. **Selection Sort**: In-place sorting
5. **Insertion Sort**: Efficient for nearly sorted data

### Multi-Criteria Sorting
Supports sorting by multiple fields with different orders:
```javascript
// Example: Sort by date (desc) then by speed (asc)
const criteria = [
  { field: 'pickup_datetime', order: 'desc' },
  { field: 'trip_speed_kmh', order: 'asc' }
];
```

## Error Handling

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Database connection issues

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid request parameters"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Trip not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Database query failed"
}
```

**503 Service Unavailable:**
```json
{
  "success": false,
  "error": "Database connection failed",
  "message": "Unable to connect to the database"
}
```

## Data Fields

### Trip Record Structure
- `id`: Unique trip identifier
- `vendor_id`: Taxi vendor (1 or 2)
- `pickup_datetime`: Trip start time
- `dropoff_datetime`: Trip end time
- `passenger_count`: Number of passengers
- `pickup_longitude`: Pickup longitude
- `pickup_latitude`: Pickup latitude
- `dropoff_longitude`: Dropoff longitude
- `dropoff_latitude`: Dropoff latitude
- `store_and_fwd_flag`: Store and forward flag
- `trip_duration`: Duration in seconds
- `trip_duration_min`: Duration in minutes
- `trip_distance_km`: Distance in kilometers
- `trip_speed_kmh`: Average speed in km/h
- `distance_per_passenger`: Distance per passenger
- `pickup_hour`: Hour of pickup (0-23)
- `pickup_day`: Day of week (0-6)
- `pickup_day_name`: Day name
- `pickup_month`: Month (1-12)
- `pickup_month_name`: Month name
- `created_at`: Record creation timestamp
- `updated_at`: Record last update timestamp

## Database Performance

### Indexes
The database includes optimized indexes for:
- `pickup_datetime`: Date/time filtering
- `vendor_id`: Vendor filtering
- `passenger_count`: Passenger filtering
- `trip_duration`: Duration filtering
- `trip_speed_kmh`: Speed filtering
- `pickup_hour`: Hourly analysis
- `pickup_day`: Daily analysis
- `pickup_latitude, pickup_longitude`: Geographic queries
- `dropoff_latitude, dropoff_longitude`: Geographic queries

### Query Optimization
- Connection pooling for better performance
- Prepared statements for security and performance
- Batch operations for bulk data processing
- Efficient SQL queries with proper joins

## Performance Considerations

- Default limit is 100 records per request
- Use pagination for large datasets
- Database indexes optimize query performance
- Connection pooling improves concurrent access
- Batch operations for bulk data processing

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp env.example .env
# Edit .env with your database credentials
```

3. **Setup database:**
```bash
npm run migrate
```

4. **Import data (optional):**
```bash
npm run import
```

5. **Start server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Testing
```bash
# Run API tests
npm test

# Test specific endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/trips?limit=5
```

## API Versioning

Current API version: **v1**

All endpoints are prefixed with `/api/` for the main API routes.

## Rate Limiting

Currently no rate limiting is implemented. For production use, consider implementing:
- Request rate limiting
- Database connection limits
- Query timeout limits

## Security Considerations

- Input validation on all endpoints
- SQL injection prevention with prepared statements
- CORS configuration for cross-origin requests
- Environment variable protection for sensitive data

## Monitoring and Logging

- Health check endpoint: `/health`
- Request logging with timestamps
- Error logging with stack traces
- Database connection monitoring
- Performance metrics tracking

## Support and Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL server is running
   - Verify credentials in `.env` file
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill process using port 3000

3. **Memory Issues**
   - Increase Node.js memory limit
   - Optimize database queries
   - Use pagination for large datasets

### Getting Help

- Check server logs for error details
- Verify database connectivity
- Test individual endpoints
- Review environment configuration
