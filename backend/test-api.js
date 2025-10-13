/**
 * Simple API Test Script
 * Tests the NYC Taxi Backend API endpoints
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing NYC Taxi Backend API...\n');

    const tests = [
        {
            name: 'Health Check',
            path: '/health',
            expectedStatus: 200
        },
        {
            name: 'API Root',
            path: '/',
            expectedStatus: 200
        },
        {
            name: 'Trips Endpoint (Basic)',
            path: '/api/trips?limit=5',
            expectedStatus: 200
        },
        {
            name: 'Trips Endpoint (Filtered)',
            path: '/api/trips?minSpeed=10&maxSpeed=50&limit=3',
            expectedStatus: 200
        },
        {
            name: 'Insights Endpoint',
            path: '/api/insights',
            expectedStatus: 200
        },
        {
            name: 'Locations Endpoint',
            path: '/api/locations?limit=5',
            expectedStatus: 200
        },
        {
            name: 'Anomalies Endpoint',
            path: '/api/anomalies?threshold=0.1',
            expectedStatus: 200
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            console.log(`Testing: ${test.name}`);
            const result = await makeRequest(test.path);
            
            if (result.status === test.expectedStatus) {
                console.log(`✅ PASS - Status: ${result.status}`);
                if (test.name === 'Health Check' && result.data.dataLoaded) {
                    console.log(`   📊 Data loaded: ${result.data.recordCount} records`);
                }
                if (test.name === 'Insights Endpoint' && result.data.totalTrips) {
                    console.log(`   📈 Total trips: ${result.data.totalTrips}`);
                }
                passed++;
            } else {
                console.log(`❌ FAIL - Expected: ${test.expectedStatus}, Got: ${result.status}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ERROR - ${error.message}`);
            failed++;
        }
        console.log('');
    }

    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! Backend is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Check the server logs for details.');
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests, makeRequest };
