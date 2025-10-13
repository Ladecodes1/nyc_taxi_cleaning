const db = require('../config/database');

const tableName = 'trips';

// Create table
const createTable = async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
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
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_pickup_datetime (pickup_datetime),
            INDEX idx_vendor_id (vendor_id),
            INDEX idx_passenger_count (passenger_count)
        )
    `;

    try {
        await db.query(sql);
        console.log('Table created');
    } catch (error) {
        console.error('Error creating table:', error.message);
        throw error;
    }
};

// Add one trip
const create = async (trip) => {
    const sql = `
        INSERT INTO ${tableName} (
            id, vendor_id, pickup_datetime, dropoff_datetime, passenger_count,
            pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude,
            store_and_fwd_flag, trip_duration, trip_duration_min, trip_distance_km,
            trip_speed_kmh, distance_per_passenger, pickup_hour, pickup_day,
            pickup_day_name, pickup_month, pickup_month_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const vals = [
        trip.id, trip.vendor_id, trip.pickup_datetime, trip.dropoff_datetime,
        trip.passenger_count, trip.pickup_longitude, trip.pickup_latitude,
        trip.dropoff_longitude, trip.dropoff_latitude, trip.store_and_fwd_flag,
        trip.trip_duration, trip.trip_duration_min, trip.trip_distance_km,
        trip.trip_speed_kmh, trip.distance_per_passenger, trip.pickup_hour,
        trip.pickup_day, trip.pickup_day_name, trip.pickup_month, trip.pickup_month_name
    ];

    try {
        await db.query(sql, vals);
        return await findById(trip.id);
    } catch (error) {
        console.error('Error creating trip:', error.message);
        throw error;
    }
};

// Add many trips at once
const bulkCreate = async (trips) => {
    if (!trips || trips.length === 0) {
        return { inserted: 0 };
    }

    const sql = `
        INSERT INTO ${tableName} (
            id, vendor_id, pickup_datetime, dropoff_datetime, passenger_count,
            pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude,
            store_and_fwd_flag, trip_duration, trip_duration_min, trip_distance_km,
            trip_speed_kmh, distance_per_passenger, pickup_hour, pickup_day,
            pickup_day_name, pickup_month, pickup_month_name
        ) VALUES ?
    `;

    const vals = trips.map(t => [
        t.id, t.vendor_id, t.pickup_datetime, t.dropoff_datetime,
        t.passenger_count, t.pickup_longitude, t.pickup_latitude,
        t.dropoff_longitude, t.dropoff_latitude, t.store_and_fwd_flag,
        t.trip_duration, t.trip_duration_min, t.trip_distance_km,
        t.trip_speed_kmh, t.distance_per_passenger, t.pickup_hour,
        t.pickup_day, t.pickup_day_name, t.pickup_month, t.pickup_month_name
    ]);

    try {
        const result = await db.query(sql, [vals]);
        return { inserted: result.affectedRows };
    } catch (error) {
        console.error('Error bulk insert:', error.message);
        throw error;
    }
};

// Find trip by id
const findById = async (id) => {
    const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
    try {
        const results = await db.query(sql, [id]);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error('Error finding trip:', error.message);
        throw error;
    }
};

// Get trips with filters
const findWithFilters = async (filters = {}, options = {}) => {
    const { limit = 100, offset = 0, sortBy = 'pickup_datetime', sortOrder = 'DESC' } = options;

    let where = [];
    let params = [];

    if (filters.startDate) {
        where.push('pickup_datetime >= ?');
        params.push(filters.startDate);
    }

    if (filters.endDate) {
        where.push('pickup_datetime <= ?');
        params.push(filters.endDate);
    }

    if (filters.minDuration) {
        where.push('trip_duration >= ?');
        params.push(filters.minDuration);
    }

    if (filters.maxDuration) {
        where.push('trip_duration <= ?');
        params.push(filters.maxDuration);
    }

    if (filters.minDistance) {
        where.push('trip_distance_km >= ?');
        params.push(filters.minDistance);
    }

    if (filters.maxDistance) {
        where.push('trip_distance_km <= ?');
        params.push(filters.maxDistance);
    }

    if (filters.minSpeed) {
        where.push('trip_speed_kmh >= ?');
        params.push(filters.minSpeed);
    }

    if (filters.maxSpeed) {
        where.push('trip_speed_kmh <= ?');
        params.push(filters.maxSpeed);
    }

    if (filters.passengerCount) {
        where.push('passenger_count = ?');
        params.push(filters.passengerCount);
    }

    if (filters.vendorId) {
        where.push('vendor_id = ?');
        params.push(filters.vendorId);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    // Count total
    const countSql = `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`;
    const countResult = await db.query(countSql, params);
    const total = countResult[0].total;

    // Get data
    const dataSql = `
        SELECT * FROM ${tableName} 
        ${whereClause} 
        ORDER BY ${sortBy} ${sortOrder} 
        LIMIT ? OFFSET ?
    `;

    const data = await db.query(dataSql, [...params, limit, offset]);

    return {
        data,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
    };
};

// Get basic stats
const getStats = async () => {
    const sql = `
        SELECT 
            COUNT(*) as total_trips,
            AVG(trip_speed_kmh) as avg_speed,
            AVG(trip_distance_km) as avg_distance,
            AVG(trip_duration) as avg_duration,
            MIN(pickup_datetime) as earliest_trip,
            MAX(pickup_datetime) as latest_trip
        FROM ${tableName}
    `;

    try {
        const results = await db.query(sql);
        return results[0];
    } catch (error) {
        console.error('Error getting stats:', error.message);
        throw error;
    }
};

// Stats by hour
const getHourlyStats = async () => {
    const sql = `
        SELECT 
            pickup_hour,
            COUNT(*) as count,
            AVG(trip_speed_kmh) as avg_speed,
            AVG(trip_distance_km) as avg_distance,
            AVG(trip_duration) as avg_duration
        FROM ${tableName}
        GROUP BY pickup_hour
        ORDER BY pickup_hour
    `;

    try {
        return await db.query(sql);
    } catch (error) {
        console.error('Error getting hourly stats:', error.message);
        throw error;
    }
};

// Stats by day
const getDailyStats = async () => {
    const sql = `
        SELECT 
            pickup_day,
            pickup_day_name,
            COUNT(*) as count,
            AVG(trip_speed_kmh) as avg_speed,
            AVG(trip_distance_km) as avg_distance,
            AVG(trip_duration) as avg_duration
        FROM ${tableName}
        GROUP BY pickup_day, pickup_day_name
        ORDER BY pickup_day
    `;

    try {
        return await db.query(sql);
    } catch (error) {
        console.error('Error getting daily stats:', error.message);
        throw error;
    }
};

// Stats by vendor
const getVendorStats = async () => {
    const sql = `
        SELECT 
            vendor_id,
            COUNT(*) as count,
            AVG(trip_distance_km) as avg_distance,
            AVG(trip_duration) as avg_duration
        FROM ${tableName}
        GROUP BY vendor_id
        ORDER BY vendor_id
    `;

    try {
        return await db.query(sql);
    } catch (error) {
        console.error('Error getting vendor stats:', error.message);
        throw error;
    }
};

// Stats by passenger count
const getPassengerStats = async () => {
    const sql = `
        SELECT 
            passenger_count,
            COUNT(*) as count,
            AVG(trip_distance_km) as avg_distance
        FROM ${tableName}
        GROUP BY passenger_count
        ORDER BY passenger_count
    `;

    try {
        return await db.query(sql);
    } catch (error) {
        console.error('Error getting passenger stats:', error.message);
        throw error;
    }
};

// Get popular locations
const getLocationSummary = async (type, limit = 50) => {
    const latField = type === 'pickup' ? 'pickup_latitude' : 'dropoff_latitude';
    const lonField = type === 'pickup' ? 'pickup_longitude' : 'dropoff_longitude';

    const sql = `
        SELECT 
            ROUND(${latField}, 2) as latitude,
            ROUND(${lonField}, 2) as longitude,
            COUNT(*) as count,
            AVG(trip_distance_km) as avg_distance,
            AVG(trip_speed_kmh) as avg_speed
        FROM ${tableName}
        GROUP BY ROUND(${latField}, 2), ROUND(${lonField}, 2)
        ORDER BY count DESC
        LIMIT ?
    `;

    try {
        return await db.query(sql, [limit]);
    } catch (error) {
        console.error('Error getting locations:', error.message);
        throw error;
    }
};

// Find weird trips
const findAnomalies = async () => {
    const sql = `
        SELECT *,
            CASE WHEN trip_speed_kmh > 120 THEN 1 ELSE 0 END as speed_anomaly,
            CASE WHEN trip_distance_km < 0.001 OR trip_distance_km > 50 THEN 1 ELSE 0 END as distance_anomaly,
            CASE WHEN trip_duration < 60 OR trip_duration > 7200 THEN 1 ELSE 0 END as duration_anomaly
        FROM ${tableName}
        WHERE 
            trip_speed_kmh > 120 
            OR trip_distance_km < 0.001 
            OR trip_distance_km > 50
            OR trip_duration < 60 
            OR trip_duration > 7200
            OR pickup_latitude < 40.4774 
            OR pickup_latitude > 40.9176
            OR pickup_longitude < -74.2591 
            OR pickup_longitude > -73.7004
            OR dropoff_latitude < 40.4774 
            OR dropoff_latitude > 40.9176
            OR dropoff_longitude < -74.2591 
            OR dropoff_longitude > -73.7004
        ORDER BY pickup_datetime DESC
    `;

    try {
        const trips = await db.query(sql);
        return trips.map(t => ({
            ...t,
            reasons: getReasons(t)
        }));
    } catch (error) {
        console.error('Error finding anomalies:', error.message);
        throw error;
    }
};

// Helper: get why trip is weird
const getReasons = (trip) => {
    const reasons = [];

    if (trip.speed_anomaly) {
        reasons.push(`Speed too high: ${trip.trip_speed_kmh}km/h`);
    }

    if (trip.distance_anomaly) {
        reasons.push(`Distance weird: ${trip.trip_distance_km}km`);
    }

    if (trip.duration_anomaly) {
        reasons.push(`Duration weird: ${trip.trip_duration}s`);
    }

    return reasons;
};

// Delete trip
const deleteById = async (id) => {
    const sql = `DELETE FROM ${tableName} WHERE id = ?`;
    try {
        const result = await db.query(sql, [id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting trip:', error.message);
        throw error;
    }
};

// Update trip
const updateById = async (id, data) => {
    const allowed = [
        'vendor_id', 'pickup_datetime', 'dropoff_datetime', 'passenger_count',
        'pickup_longitude', 'pickup_latitude', 'dropoff_longitude', 'dropoff_latitude',
        'store_and_fwd_flag', 'trip_duration', 'trip_duration_min', 'trip_distance_km',
        'trip_speed_kmh', 'distance_per_passenger', 'pickup_hour', 'pickup_day',
        'pickup_day_name', 'pickup_month', 'pickup_month_name'
    ];

    const fields = Object.keys(data).filter(f => allowed.includes(f));
    if (fields.length === 0) {
        throw new Error('Nothing to update');
    }

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const vals = fields.map(f => data[f]);

    const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
    
    try {
        const result = await db.query(sql, [...vals, id]);
        if (result.affectedRows > 0) {
            return await findById(id);
        }
        return null;
    } catch (error) {
        console.error('Error updating trip:', error.message);
        throw error;
    }
};

module.exports = {
    createTable,
    create,
    bulkCreate,
    findById,
    findWithFilters,
    getStats,
    getHourlyStats,
    getDailyStats,
    getVendorStats,
    getPassengerStats,
    getLocationSummary,
    findAnomalies,
    deleteById,
    updateById
};