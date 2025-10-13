# NYC Taxi Data Backend

A Node.js backend API for analyzing NYC taxi trip data with custom algorithms for anomaly detection and data processing.

## Features

- **RESTful API** with Express.js
- **Custom Anomaly Detection** algorithm (no external libraries)
- **Multiple Sorting Algorithms** (Quick Sort, Merge Sort, Bubble Sort, etc.)
- **Advanced Filtering** with multiple criteria
- **Location Analysis** for pickup/dropoff patterns
- **Statistical Insights** and aggregations
- **Comprehensive Documentation**

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Core Endpoints
- `GET /health` - Server health check
- `GET /trips` - Query trips with filters
- `GET /insights` - Aggregate statistics
- `GET /locations` - Location analysis
- `GET /anomalies` - Anomaly detection

### Example Usage

```bash
# Get all trips with speed between 10-50 km/h
curl "http://localhost:3000/trips?minSpeed=10&maxSpeed=50"

# Get insights about the data
curl "http://localhost:3000/insights"

# Detect anomalies with threshold 0.2
curl "http://localhost:3000/anomalies?threshold=0.2"
```

## Custom Algorithms

### 1. Anomaly Detection
Detects unrealistic trips based on:
- Speed anomalies (> 120 km/h)
- Distance anomalies (too short/long)
- Duration anomalies (< 60s or > 2 hours)
- Geographic bounds (outside NYC)
- Data consistency checks

### 2. Sorting Algorithms
Implements multiple sorting algorithms:
- **Quick Sort** (default) - O(n log n) average
- **Merge Sort** - O(n log n) stable
- **Bubble Sort** - O(n²) simple
- **Selection Sort** - O(n²) in-place
- **Insertion Sort** - O(n²) efficient for small data

### 3. Custom Filtering
Advanced filtering with:
- Date ranges
- Numeric ranges
- Multiple value selection
- Geographic bounds
- Time-based filters

## Data Processing

The backend processes taxi trip data and calculates:
- Trip distances using Haversine formula
- Average speeds
- Time-based features (hour, day, month)
- Distance per passenger
- Statistical aggregations

## Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── API_DOCUMENTATION.md   # Complete API docs
├── README.md              # This file
└── utils/
    ├── dataLoader.js      # Data loading utilities
    ├── anomalyDetector.js # Anomaly detection algorithm
    └── customSorter.js    # Custom sorting algorithms
```

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)

### Data Files
The backend expects data files in the following locations:
- `../data/cleaned_taxi_data.csv` - Main dataset (preferred)
- `../logs/removed_records.csv` - Fallback dataset

## Performance

- Optimized for datasets up to 100,000 records
- Pagination support for large datasets
- Efficient sorting algorithms
- Memory-conscious data processing

## Error Handling

The API includes comprehensive error handling:
- Data loading errors
- Invalid parameters
- Server errors
- Graceful degradation

## Development

### Adding New Endpoints
1. Add route in `server.js`
2. Implement business logic
3. Update documentation
4. Test with sample data

### Adding New Algorithms
1. Create new utility file in `utils/`
2. Implement algorithm logic
3. Add to main server
4. Document usage

## Testing

Test the API endpoints using:
- curl commands
- Postman
- Browser (for GET requests)
- Custom test scripts

## Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **csv-parser** - CSV file parsing
- **nodemon** - Development auto-reload

## License

MIT License - See LICENSE file for details

## Author

Sandrine - Backend Engineer for NYC Taxi Data Analysis Project
