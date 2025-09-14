// Test coupon validation API directly
const http = require('http');

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/coupons/validate',
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
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          reject(new Error('Invalid JSON response'));
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

async function testCouponValidation() {
  const testData = {
    code: 'SAVE100',
    orderAmount: 88.50,
    applicableItems: ['jamboree_and_season']
  };

  console.log('Testing coupon validation with data:', testData);
  
  try {
    const { status, data } = await makeRequest(testData);
    
    console.log('Response status:', status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ Coupon validation successful!');
      console.log(`Original amount: $${data.orderAmount}`);
      console.log(`Discount: $${data.discount}`);
      console.log(`Final amount: $${data.finalAmount}`);
    } else {
      console.log('\n❌ Coupon validation failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error testing coupon validation:', error.message);
  }
}

testCouponValidation();
