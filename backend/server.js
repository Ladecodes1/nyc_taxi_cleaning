const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const dataLoader = require('./utils/dataLoader');
const anomalyDetector = require('./utils/anomalyDetector');
const customSorter = require('./utils/customSorter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let taxiData = [];
let dataLoaded = false;

async function loadData() {
    try {
        console.log('🔄 Loading taxi data...');
        taxiData = await dataLoader.loadTaxiData();
        dataLoaded = true;
        console.log(`✅ Loaded ${taxiData.length} records`);
    } catch (error) {
        console.error('❌ Failed to load data:', error.message);
        console.log('⚠️ Server starting but some endpoints may fail');
    }
}

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        dataLoaded,
        recordCount: taxiData.length,
        timestamp: new Date().toISOString()
    });
});

// Query trips with filters
app.get('/trips', (req, res) => {
    if (!dataLoaded) {
        return res.status(503).json({ 
            error: 'Data not loaded yet. Try again in a moment.' 
        });
    }

    try {
        const {
            startDate, endDate,
            minDuration, maxDuration,
            minDistance, maxDistance,
            minSpeed, maxSpeed,
            passengerCount, vendorId,
            sortBy = 'pickup_datetime',
            sortOrder = 'desc',
            limit = 100,
            offset = 0
        } = req.query;

        let filtered = [...taxiData];

        if (startDate) {
            const start = new Date(startDate);
            filtered = filtered.filter(t => new Date(t.pickup_datetime) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            filtered = filtered.filter(t => new Date(t.pickup_datetime) <= end);
        }

        if (minDuration) {
            filtered = filtered.filter(t => t.trip_duration >= parseFloat(minDuration));
        }

        if (maxDuration) {
            filtered = filtered.filter(t => t.trip_duration <= parseFloat(maxDuration));
        }

        if (minDistance) {
            filtered = filtered.filter(t => t.trip_distance_km >= parseFloat(minDistance));
        }

        if (maxDistance) {
            filtered = filtered.filter(t => t.trip_distance_km <= parseFloat(maxDistance));
        }

        if (minSpeed) {
            filtered = filtered.filter(t => t.trip_speed_kmh >= parseFloat(minSpeed));
        }

        if (maxSpeed) {
            filtered = filtered.filter(t => t.trip_speed_kmh <= parseFloat(maxSpeed));
        }

        if (passengerCount) {
            filtered = filtered.filter(t => t.passenger_count === parseInt(passengerCount));
        }

        if (vendorId) {
            filtered = filtered.filter(t => t.vendor_id === parseInt(vendorId));
        }

        filtered = customSorter.sortData(filtered, sortBy, sortOrder);

        const total = filtered.length;
        const paged = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        res.json({
            data: paged,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + parseInt(limit) < total
            },
            filters: req.query
        });

    } catch (error) {
        console.error('Error in /trips:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Aggregate stats
app.get('/insights', (req, res) => {
    if (!dataLoaded) {
        return res.status(503).json({ 
            error: 'Data not loaded yet. Try again in a moment.' 
        });
    }

    try {
        const insights = {
            totalTrips: taxiData.length,
            avgSpeed: calcAvg(taxiData, 'trip_speed_kmh'),
            avgDistance: calcAvg(taxiData, 'trip_distance_km'),
            avgDuration: calcAvg(taxiData, 'trip_duration'),
            busiestHour: findBusiestHour(taxiData),
            busiestDay: findBusiestDay(taxiData),
            speedDist: getSpeedDist(taxiData),
            distanceDist: getDistanceDist(taxiData),
            hourlyStats: getHourlyStats(taxiData),
            dailyStats: getDailyStats(taxiData),
            vendorStats: getVendorStats(taxiData),
            passengerStats: getPassengerStats(taxiData)
        };

        res.json(insights);

    } catch (error) {
        console.error('Error in /insights:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Pickup/dropoff summaries
app.get('/locations', (req, res) => {
    if (!dataLoaded) {
        return res.status(503).json({ 
            error: 'Data not loaded yet. Try again in a moment.' 
        });
    }

    try {
        const { type = 'both', limit = 50 } = req.query;
        let locations = {};

        if (type === 'pickup' || type === 'both') {
            locations.pickup = getLocationSummary(taxiData, 'pickup');
        }

        if (type === 'dropoff' || type === 'both') {
            locations.dropoff = getLocationSummary(taxiData, 'dropoff');
        }

        if (locations.pickup) {
            locations.pickup = locations.pickup.slice(0, parseInt(limit));
        }
        if (locations.dropoff) {
            locations.dropoff = locations.dropoff.slice(0, parseInt(limit));
        }

        res.json(locations);

    } catch (error) {
        console.error('Error in /locations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Detect anomalies
app.get('/anomalies', (req, res) => {
    if (!dataLoaded) {
        return res.status(503).json({ 
            error: 'Data not loaded yet. Try again in a moment.' 
        });
    }

    try {
        const { threshold = 0.1 } = req.query;
        const anomalies = anomalyDetector.detectAnomalies(taxiData, parseFloat(threshold));
        
        res.json({
            anomalies,
            totalAnomalies: anomalies.length,
            anomalyRate: (anomalies.length / taxiData.length * 100).toFixed(2) + '%'
        });

    } catch (error) {
        console.error('Error in /anomalies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper functions
function calcAvg(data, field) {
    const vals = data.map(item => item[field]).filter(v => !isNaN(v) && v !== null);
    return vals.length > 0 ? (vals.reduce((sum, v) => sum + v, 0) / vals.length).toFixed(2) : 0;
}

function findBusiestHour(data) {
    const counts = {};
    data.forEach(t => {
        const hr = new Date(t.pickup_datetime).getHours();
        counts[hr] = (counts[hr] || 0) + 1;
    });
    
    const busiest = Object.keys(counts).reduce((a, b) => 
        counts[a] > counts[b] ? a : b
    );
    
    return {
        hour: parseInt(busiest),
        count: counts[busiest],
        percentage: ((counts[busiest] / data.length) * 100).toFixed(2)
    };
}

function findBusiestDay(data) {
    const counts = {};
    data.forEach(t => {
        const day = new Date(t.pickup_datetime).getDay();
        counts[day] = (counts[day] || 0) + 1;
    });
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const busiest = Object.keys(counts).reduce((a, b) => 
        counts[a] > counts[b] ? a : b
    );
    
    return {
        day: days[busiest],
        count: counts[busiest],
        percentage: ((counts[busiest] / data.length) * 100).toFixed(2)
    };
}

function getSpeedDist(data) {
    const speeds = data.map(t => t.trip_speed_kmh).filter(s => !isNaN(s));
    return {
        min: Math.min(...speeds).toFixed(2),
        max: Math.max(...speeds).toFixed(2),
        median: calcMedian(speeds).toFixed(2),
        average: calcAvg(data, 'trip_speed_kmh')
    };
}

function getDistanceDist(data) {
    const dists = data.map(t => t.trip_distance_km).filter(d => !isNaN(d));
    return {
        min: Math.min(...dists).toFixed(2),
        max: Math.max(...dists).toFixed(2),
        median: calcMedian(dists).toFixed(2),
        average: calcAvg(data, 'trip_distance_km')
    };
}

function calcMedian(vals) {
    const sorted = vals.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getHourlyStats(data) {
    const stats = {};
    for (let hr = 0; hr < 24; hr++) {
        const hrData = data.filter(t => new Date(t.pickup_datetime).getHours() === hr);
        stats[hr] = {
            count: hrData.length,
            avgSpeed: calcAvg(hrData, 'trip_speed_kmh'),
            avgDistance: calcAvg(hrData, 'trip_distance_km'),
            avgDuration: calcAvg(hrData, 'trip_duration')
        };
    }
    return stats;
}

function getDailyStats(data) {
    const stats = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let d = 0; d < 7; d++) {
        const dayData = data.filter(t => new Date(t.pickup_datetime).getDay() === d);
        stats[days[d]] = {
            count: dayData.length,
            avgSpeed: calcAvg(dayData, 'trip_speed_kmh'),
            avgDistance: calcAvg(dayData, 'trip_distance_km'),
            avgDuration: calcAvg(dayData, 'trip_duration')
        };
    }
    return stats;
}

function getVendorStats(data) {
    const stats = {};
    data.forEach(t => {
        const v = t.vendor_id;
        if (!stats[v]) {
            stats[v] = { count: 0, totalDist: 0, totalDur: 0 };
        }
        stats[v].count++;
        stats[v].totalDist += t.trip_distance_km || 0;
        stats[v].totalDur += t.trip_duration || 0;
    });
    
    Object.keys(stats).forEach(v => {
        const s = stats[v];
        s.avgDistance = (s.totalDist / s.count).toFixed(2);
        s.avgDuration = (s.totalDur / s.count).toFixed(2);
        delete s.totalDist;
        delete s.totalDur;
    });
    
    return stats;
}

function getPassengerStats(data) {
    const stats = {};
    data.forEach(t => {
        const p = t.passenger_count;
        if (!stats[p]) {
            stats[p] = { count: 0, totalDist: 0 };
        }
        stats[p].count++;
        stats[p].totalDist += t.trip_distance_km || 0;
    });
    
    Object.keys(stats).forEach(p => {
        const s = stats[p];
        s.avgDistance = (s.totalDist / s.count).toFixed(2);
        delete s.totalDist;
    });
    
    return stats;
}

function getLocationSummary(data, type) {
    const locMap = new Map();
    
    data.forEach(t => {
        const lat = type === 'pickup' ? t.pickup_latitude : t.dropoff_latitude;
        const lon = type === 'pickup' ? t.pickup_longitude : t.dropoff_longitude;
        
        // Round coords to cluster nearby locations
        const rLat = Math.round(lat * 100) / 100;
        const rLon = Math.round(lon * 100) / 100;
        const key = `${rLat},${rLon}`;
        
        if (!locMap.has(key)) {
            locMap.set(key, {
                latitude: rLat,
                longitude: rLon,
                count: 0,
                totalDist: 0,
                speeds: []
            });
        }
        
        const loc = locMap.get(key);
        loc.count++;
        loc.totalDist += t.trip_distance_km || 0;
        loc.speeds.push(t.trip_speed_kmh || 0);
    });
    
    const locs = Array.from(locMap.values()).map(loc => {
        loc.avgDistance = (loc.totalDist / loc.count).toFixed(2);
        loc.avgSpeed = (loc.speeds.reduce((sum, s) => sum + s, 0) / loc.speeds.length).toFixed(2);
        delete loc.totalDist;
        delete loc.speeds;
        return loc;
    });
    
    return locs.sort((a, b) => b.count - a.count);
}

// Error handlers
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await loadData();
});

module.exports = app;