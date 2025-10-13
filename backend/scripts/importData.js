const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../config/database');
const Trip = require('../models/Trip');
const dataLoader = require('../utils/dataLoader');

/**
 * Data Import Script
 * Imports taxi data from CSV files into MySQL database
 */

async function importData() {
    try {
        console.log('🔄 Starting data import...');
        
        // Initialize database connection
        const dbConnected = await db.initialize();
        if (!dbConnected) {
            throw new Error('Failed to connect to database');
        }

        // Create tables
        await Trip.createTable();
        console.log('✅ Database tables ready');

        // Load data from CSV
        console.log('📁 Loading data from CSV files...');
        const taxiData = await dataLoader.loadTaxiData();
        console.log(`📊 Loaded ${taxiData.length} records from CSV`);

        if (taxiData.length === 0) {
            console.log('⚠️ No data to import');
            return;
        }

        // Import data in batches
        const batchSize = 1000;
        const totalBatches = Math.ceil(taxiData.length / batchSize);
        let importedCount = 0;

        console.log(`📦 Importing data in ${totalBatches} batches of ${batchSize} records each...`);

        for (let i = 0; i < totalBatches; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, taxiData.length);
            const batch = taxiData.slice(start, end);

            try {
                const result = await Trip.bulkCreate(batch);
                importedCount += result.inserted;
                
                console.log(`✅ Batch ${i + 1}/${totalBatches}: ${result.inserted} records imported`);
            } catch (error) {
                console.error(`❌ Error importing batch ${i + 1}:`, error.message);
                // Continue with next batch
            }
        }

        console.log(`🎉 Data import completed! ${importedCount} records imported successfully`);

        // Get final statistics
        const stats = await Trip.getStats();
        console.log('📊 Final database statistics:');
        console.log(`  - Total trips: ${stats.total_trips}`);
        console.log(`  - Average speed: ${parseFloat(stats.avg_speed || 0).toFixed(2)} km/h`);
        console.log(`  - Average distance: ${parseFloat(stats.avg_distance || 0).toFixed(2)} km`);
        console.log(`  - Average duration: ${parseFloat(stats.avg_duration || 0).toFixed(2)} seconds`);

    } catch (error) {
        console.error('❌ Data import failed:', error.message);
        throw error;
    } finally {
        await db.close();
    }
}

// Run import if this script is executed directly
if (require.main === module) {
    importData()
        .then(() => {
            console.log('✅ Data import completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Data import failed:', error.message);
            process.exit(1);
        });
}

module.exports = { importData };
