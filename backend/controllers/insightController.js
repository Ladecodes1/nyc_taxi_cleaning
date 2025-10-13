const Trip = require('../models/Trip');

class InsightController {
    async getInsights(req, res) {
        try {
            // Fetch all stats in parallel
            const [stats, hourly, daily, vendors, passengers] = await Promise.all([
                Trip.getStats(),
                Trip.getHourlyStats(),
                Trip.getDailyStats(),
                Trip.getVendorStats(),
                Trip.getPassengerStats()
            ]);

            // Format hourly data
            const hourlyData = {};
            hourly.forEach(stat => {
                hourlyData[stat.pickup_hour] = {
                    count: stat.count,
                    avgSpeed: parseFloat(stat.avg_speed || 0).toFixed(2),
                    avgDistance: parseFloat(stat.avg_distance || 0).toFixed(2),
                    avgDuration: parseFloat(stat.avg_duration || 0).toFixed(2)
                };
            });

            // Format daily data
            const dailyData = {};
            daily.forEach(stat => {
                dailyData[stat.pickup_day_name] = {
                    count: stat.count,
                    avgSpeed: parseFloat(stat.avg_speed || 0).toFixed(2),
                    avgDistance: parseFloat(stat.avg_distance || 0).toFixed(2),
                    avgDuration: parseFloat(stat.avg_duration || 0).toFixed(2)
                };
            });

            // Format vendor data
            const vendorData = {};
            vendors.forEach(stat => {
                vendorData[stat.vendor_id] = {
                    count: stat.count,
                    avgDistance: parseFloat(stat.avg_distance || 0).toFixed(2),
                    avgDuration: parseFloat(stat.avg_duration || 0).toFixed(2)
                };
            });

            // Format passenger data
            const passengerData = {};
            passengers.forEach(stat => {
                passengerData[stat.passenger_count] = {
                    count: stat.count,
                    avgDistance: parseFloat(stat.avg_distance || 0).toFixed(2)
                };
            });

            const insights = {
                totalTrips: parseInt(stats.total_trips || 0),
                avgSpeed: parseFloat(stats.avg_speed || 0).toFixed(2),
                avgDistance: parseFloat(stats.avg_distance || 0).toFixed(2),
                avgDuration: parseFloat(stats.avg_duration || 0).toFixed(2),
                busiestHour: this.findBusiestHour(hourly),
                busiestDay: this.findBusiestDay(daily),
                speedDist: this.calcSpeedDist(stats),
                distanceDist: this.calcDistanceDist(stats),
                hourlyStats: hourlyData,
                dailyStats: dailyData,
                vendorStats: vendorData,
                passengerStats: passengerData,
                dateRange: {
                    earliest: stats.earliest_trip,
                    latest: stats.latest_trip
                }
            };

            res.json({
                success: true,
                data: insights
            });

        } catch (error) {
            console.error('Error getting insights:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    async getHourlyStats(req, res) {
        try {
            const hourly = await Trip.getHourlyStats();
            res.json({ success: true, data: hourly });
        } catch (error) {
            console.error('Error getting hourly stats:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    async getDailyStats(req, res) {
        try {
            const daily = await Trip.getDailyStats();
            res.json({ success: true, data: daily });
        } catch (error) {
            console.error('Error getting daily stats:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    async getVendorStats(req, res) {
        try {
            const vendors = await Trip.getVendorStats();
            res.json({ success: true, data: vendors });
        } catch (error) {
            console.error('Error getting vendor stats:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    async getPassengerStats(req, res) {
        try {
            const passengers = await Trip.getPassengerStats();
            res.json({ success: true, data: passengers });
        } catch (error) {
            console.error('Error getting passenger stats:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    findBusiestHour(hourly) {
        if (!hourly || hourly.length === 0) {
            return { hour: 0, count: 0, percentage: '0.00' };
        }

        const busiest = hourly.reduce((max, curr) => 
            curr.count > max.count ? curr : max
        );

        const total = hourly.reduce((sum, stat) => sum + stat.count, 0);
        const pct = total > 0 ? ((busiest.count / total) * 100).toFixed(2) : '0.00';

        return {
            hour: busiest.pickup_hour,
            count: busiest.count,
            percentage: pct
        };
    }

    findBusiestDay(daily) {
        if (!daily || daily.length === 0) {
            return { day: 'Monday', count: 0, percentage: '0.00' };
        }

        const busiest = daily.reduce((max, curr) => 
            curr.count > max.count ? curr : max
        );

        const total = daily.reduce((sum, stat) => sum + stat.count, 0);
        const pct = total > 0 ? ((busiest.count / total) * 100).toFixed(2) : '0.00';

        return {
            day: busiest.pickup_day_name,
            count: busiest.count,
            percentage: pct
        };
    }

    // TODO: Add proper min/max queries for full distribution
    calcSpeedDist(stats) {
        return {
            average: parseFloat(stats.avg_speed || 0).toFixed(2)
        };
    }

    calcDistanceDist(stats) {
        return {
            average: parseFloat(stats.avg_distance || 0).toFixed(2)
        };
    }
}

module.exports = new InsightController();