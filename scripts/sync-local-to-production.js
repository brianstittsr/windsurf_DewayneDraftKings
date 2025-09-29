#!/usr/bin/env node

/**
 * Sync Local Firebase Data to Production Server
 * This script copies all data from local Firebase to production via API endpoints
 */

const https = require('https');
const http = require('http');

// Configuration
const LOCAL_BASE_URL = 'http://localhost:3000'; // Your local development server
const PRODUCTION_BASE_URL = 'https://www.allprosportsnc.com'; // Your production server

// Collections to sync
const COLLECTIONS_TO_SYNC = [
  'products',
  'coupons',
  'players',
  'coaches',
  'teams',
  'games',
  'seasons',
  'leagues',
  'payments',
  'user_profiles',
  'meal_plans'
];

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
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

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * Fetch data from local API
 */
async function fetchLocalData(endpoint) {
  try {
    console.log(`📥 Fetching local data from: ${endpoint}`);
    const response = await makeRequest(`${LOCAL_BASE_URL}/api/${endpoint}`);
    
    if (response.status === 200) {
      console.log(`✅ Successfully fetched local ${endpoint} data`);
      return response.data;
    } else {
      console.log(`⚠️  Local ${endpoint} returned status ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error fetching local ${endpoint}:`, error.message);
    return null;
  }
}

/**
 * Send data to production API
 */
async function sendToProduction(endpoint, data, method = 'POST') {
  try {
    console.log(`📤 Sending data to production: ${endpoint}`);
    const response = await makeRequest(`${PRODUCTION_BASE_URL}/api/${endpoint}`, {
      method: method,
      body: data
    });
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ Successfully sent ${endpoint} data to production`);
      return { success: true, data: response.data };
    } else {
      console.log(`⚠️  Production ${endpoint} returned status ${response.status}`);
      console.log('Response:', response.data);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`❌ Error sending to production ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sync products data
 */
async function syncProducts() {
  console.log('\n🔄 Syncing Products...');
  
  const localProducts = await fetchLocalData('products');
  if (!localProducts || !localProducts.products || localProducts.products.length === 0) {
    console.log('⚠️  No local products found, using populate-products endpoint');
    const result = await sendToProduction('populate-products', {});
    return result.success;
  }

  // Send each product individually
  let successCount = 0;
  for (const product of localProducts.products) {
    const result = await sendToProduction('products', product);
    if (result.success) successCount++;
  }
  
  console.log(`✅ Synced ${successCount}/${localProducts.products.length} products`);
  return successCount > 0;
}

/**
 * Sync coupons data
 */
async function syncCoupons() {
  console.log('\n🔄 Syncing Coupons...');
  
  const localCoupons = await fetchLocalData('coupons');
  if (!localCoupons || !localCoupons.coupons || localCoupons.coupons.length === 0) {
    console.log('⚠️  No local coupons found');
    return false;
  }

  let successCount = 0;
  for (const coupon of localCoupons.coupons) {
    const result = await sendToProduction('coupons', coupon);
    if (result.success) successCount++;
  }
  
  console.log(`✅ Synced ${successCount}/${localCoupons.coupons.length} coupons`);
  return successCount > 0;
}

/**
 * Sync user profiles (players and coaches)
 */
async function syncUserProfiles() {
  console.log('\n🔄 Syncing User Profiles...');
  
  const localProfiles = await fetchLocalData('user-profiles');
  if (!localProfiles || !localProfiles.profiles || localProfiles.profiles.length === 0) {
    console.log('⚠️  No local user profiles found');
    return false;
  }

  let successCount = 0;
  for (const profile of localProfiles.profiles) {
    const result = await sendToProduction('user-profiles', profile);
    if (result.success) successCount++;
  }
  
  console.log(`✅ Synced ${successCount}/${localProfiles.profiles.length} user profiles`);
  return successCount > 0;
}

/**
 * Sync teams data
 */
async function syncTeams() {
  console.log('\n🔄 Syncing Teams...');
  
  const localTeams = await fetchLocalData('teams');
  if (!localTeams || !localTeams.teams || localTeams.teams.length === 0) {
    console.log('⚠️  No local teams found');
    return false;
  }

  let successCount = 0;
  for (const team of localTeams.teams) {
    const result = await sendToProduction('teams', team);
    if (result.success) successCount++;
  }
  
  console.log(`✅ Synced ${successCount}/${localTeams.teams.length} teams`);
  return successCount > 0;
}

/**
 * Main sync function
 */
async function syncAllData() {
  console.log('🚀 Starting Local to Production Data Sync\n');
  console.log(`📍 Local Server: ${LOCAL_BASE_URL}`);
  console.log(`📍 Production Server: ${PRODUCTION_BASE_URL}\n`);

  const results = {
    products: false,
    coupons: false,
    userProfiles: false,
    teams: false
  };

  // Check if local server is running
  try {
    const healthCheck = await makeRequest(`${LOCAL_BASE_URL}/api/products`);
    if (healthCheck.status !== 200 && healthCheck.status !== 500) {
      console.log('❌ Local server not accessible. Please start your development server first.');
      console.log('Run: npm run dev');
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to local server. Please start your development server first.');
    console.log('Run: npm run dev');
    return;
  }

  // Check if production server is accessible
  try {
    const prodHealthCheck = await makeRequest(`${PRODUCTION_BASE_URL}/api/firebase-test`);
    if (prodHealthCheck.status !== 200 && prodHealthCheck.status !== 500) {
      console.log('❌ Production server not accessible.');
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to production server.');
    return;
  }

  // Sync each data type
  results.products = await syncProducts();
  results.coupons = await syncCoupons();
  results.userProfiles = await syncUserProfiles();
  results.teams = await syncTeams();

  // Summary
  console.log('\n📊 Sync Summary:');
  console.log('================');
  Object.entries(results).forEach(([key, success]) => {
    const status = success ? '✅ Success' : '❌ Failed/No Data';
    console.log(`${key.padEnd(15)}: ${status}`);
  });

  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  console.log(`\n🎯 Overall: ${successCount}/${totalCount} data types synced successfully`);

  if (successCount > 0) {
    console.log('\n🎉 Data sync completed! Your production server should now have the same data as local.');
    console.log('\n🔍 Verify by checking:');
    console.log(`   • Products: ${PRODUCTION_BASE_URL}/api/products`);
    console.log(`   • Pricing Page: ${PRODUCTION_BASE_URL}/pricing`);
    console.log(`   • Database Status: ${PRODUCTION_BASE_URL}/api/database-status`);
  } else {
    console.log('\n⚠️  No data was synced. Check your local development server and data.');
  }
}

// Run the sync
if (require.main === module) {
  syncAllData().catch(console.error);
}

module.exports = { syncAllData, syncProducts, syncCoupons, syncUserProfiles, syncTeams };
