#!/usr/bin/env node

/**
 * Debug script to test sync functionality
 */

const http = require('http');

const LOCAL_BASE_URL = 'http://localhost:3000';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
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

async function testEndpoints() {
  console.log('🔍 Testing Local Development Server...\n');
  
  const endpoints = [
    'products',
    'coupons', 
    'user-profiles',
    'teams',
    'pricing'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${LOCAL_BASE_URL}/api/${endpoint}`);
      const response = await makeRequest(`${LOCAL_BASE_URL}/api/${endpoint}`);
      console.log(`Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint} - Working`);
        if (typeof response.data === 'object') {
          const keys = Object.keys(response.data);
          console.log(`   Data keys: ${keys.join(', ')}`);
          
          // Check if there's actual data
          if (keys.length > 0) {
            const firstKey = keys[0];
            const firstValue = response.data[firstKey];
            if (Array.isArray(firstValue)) {
              console.log(`   ${firstKey} count: ${firstValue.length}`);
            }
          }
        }
      } else {
        console.log(`❌ ${endpoint} - Status ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}\n`);
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    console.log('🔍 Checking if local server is running...');
    const response = await makeRequest(`${LOCAL_BASE_URL}/api/firebase-test`);
    console.log(`Server status: ${response.status}\n`);
    
    if (response.status === 200 || response.status === 500) {
      console.log('✅ Local server is running\n');
      await testEndpoints();
    } else {
      console.log('❌ Local server not responding properly');
      console.log('Please start your development server with: npm run dev');
    }
  } catch (error) {
    console.log('❌ Cannot connect to local server');
    console.log('Error:', error.message);
    console.log('\nPlease start your development server with: npm run dev');
  }
}

checkServer().catch(console.error);
