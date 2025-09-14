// Debug the exact request being sent from frontend to coupon validation API
const http = require('http');

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    console.log('📤 Request being sent:');
    console.log('Path:', path);
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Content-Length:', Buffer.byteLength(postData));
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log('\n📥 Response received:');
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Body:', body);
        
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: { error: 'Invalid JSON', raw: body } });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function debugCouponRequest() {
  console.log('🔍 Debugging Coupon Validation Request\n');
  
  // Test what the frontend SHOULD be sending based on PaymentCheckout.tsx
  const frontendRequest = {
    code: 'SAVE100',
    orderAmount: 88.50,
    applicableItems: ['jamboree_and_season']
  };
  
  console.log('Testing with correct frontend format:');
  await makeRequest('/api/coupons/validate', frontendRequest);
  
  console.log('\n' + '='.repeat(50));
  
  // Test what might be causing the 400 error - missing orderAmount
  const badRequest1 = {
    code: 'SAVE100'
    // Missing orderAmount and applicableItems
  };
  
  console.log('\nTesting with missing orderAmount (should fail):');
  await makeRequest('/api/coupons/validate', badRequest1);
  
  console.log('\n' + '='.repeat(50));
  
  // Test with wrong parameter names
  const badRequest2 = {
    couponCode: 'SAVE100',  // Wrong parameter name
    amount: 88.50           // Wrong parameter name
  };
  
  console.log('\nTesting with wrong parameter names (should fail):');
  await makeRequest('/api/coupons/validate', badRequest2);
}

debugCouponRequest();
