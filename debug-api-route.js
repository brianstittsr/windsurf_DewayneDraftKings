// Debug which API route is actually being called
const http = require('http');

function makeRequest(path, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const postData = method === 'POST' ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: method === 'POST' ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      } : {}
    };

    console.log(`\n🔍 Testing ${method} ${path}`);
    if (method === 'POST') {
      console.log('Request data:', JSON.stringify(data, null, 2));
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${body}`);
        
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: { raw: body } });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`Error: ${error.message}`);
      reject(error);
    });

    if (method === 'POST') {
      req.write(postData);
    }
    req.end();
  });
}

async function debugApiRoutes() {
  console.log('🚀 Debugging API Routes\n');
  
  // Test 1: Check if validate route exists
  console.log('=' .repeat(50));
  await makeRequest('/api/coupons/validate', {
    code: 'SAVE100',
    orderAmount: 88.50,
    applicableItems: ['jamboree_and_season']
  });
  
  // Test 2: Check main coupons route
  console.log('\n' + '=' .repeat(50));
  await makeRequest('/api/coupons', {}, 'GET');
  
  // Test 3: Try a simple test to see if server is responding
  console.log('\n' + '=' .repeat(50));
  await makeRequest('/api/test', {}, 'GET');
}

debugApiRoutes();
