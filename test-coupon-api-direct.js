// Test coupon API on port 3002
const http = require('http');

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3002,
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
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${body}`);
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: { raw: body } });
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
  console.log('Testing coupon validation on port 3002...\n');
  
  const testData = {
    code: 'SAVE100',
    orderAmount: 88.50,
    applicableItems: ['jamboree_and_season']
  };
  
  console.log('Request data:', JSON.stringify(testData, null, 2));
  
  try {
    const result = await makeRequest('/api/coupons/validate', testData);
    
    if (result.data.success) {
      console.log('\n✅ SUCCESS!');
      console.log(`Discount: $${result.data.discount}`);
      console.log(`Final Amount: $${result.data.finalAmount}`);
    } else {
      console.log('\n❌ FAILED:', result.data.error);
    }
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
  }
}

testCouponValidation();
