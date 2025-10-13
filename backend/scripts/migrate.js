const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Database Migration Script
 * Creates the database and tables for NYC Taxi Data API
 */

async function runMigration() {
    let connection;
    
    try {
        console.log('🔄 Starting database migration...');
        
        // Connect to MySQL server (without specific database)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to MySQL server');

        // Create database if it doesn't exist
        const dbName = process.env.DB_NAME || 'nyc_taxi';
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Database '${dbName}' created/verified`);

        // Use the database
        await connection.execute(`USE \`${dbName}\``);

        // Create trips table
        const createTripsTable = `
            CREATE TABLE IF NOT EXISTS trips (
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
                INDEX idx_passenger_count (passenger_count),
                INDEX idx_trip_duration (trip_duration),
                INDEX idx_trip_speed (trip_speed_kmh),
                INDEX idx_pickup_hour (pickup_hour),
                INDEX idx_pickup_day (pickup_day)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        await connection.execute(createTripsTable);
        console.log('✅ Trips table created/verified');

        // Create indexes for better performance
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_pickup_lat_lon ON trips (pickup_latitude, pickup_longitude)',
            'CREATE INDEX IF NOT EXISTS idx_dropoff_lat_lon ON trips (dropoff_latitude, dropoff_longitude)',
            'CREATE INDEX IF NOT EXISTS idx_trip_distance ON trips (trip_distance_km)',
            'CREATE INDEX IF NOT EXISTS idx_created_at ON trips (created_at)'
        ];

        for (const indexQuery of indexes) {
            try {
                await connection.execute(indexQuery);
            } catch (error) {
                // Index might already exist, which is fine
                if (!error.message.includes('Duplicate key name')) {
                    console.warn(`⚠️ Index creation warning: ${error.message}`);
                }
            }
        }

        console.log('✅ Database indexes created/verified');

        // Check table structure
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Available tables:', tables.map(t => Object.values(t)[0]));

        const [columns] = await connection.execute('DESCRIBE trips');
        console.log('📊 Trips table structure:');
        columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });

        console.log('🎉 Database migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    runMigration()
        .then(() => {
            console.log('✅ Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Migration failed:', error.message);
            process.exit(1);
        });
}

module.exports = { runMigration };
