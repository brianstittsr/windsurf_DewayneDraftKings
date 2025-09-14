// Test all coupon types to verify calculations
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

async function testCouponType(testName, couponCode, orderAmount, expectedDiscount, expectedFinal) {
  console.log(`\n🧪 Testing ${testName}`);
  console.log(`   Coupon: ${couponCode}`);
  console.log(`   Order Amount: $${orderAmount}`);
  console.log(`   Expected Discount: $${expectedDiscount}`);
  console.log(`   Expected Final: $${expectedFinal}`);
  
  const testData = {
    code: couponCode,
    orderAmount: orderAmount,
    applicableItems: ['jamboree_and_season']
  };

  try {
    const { status, data } = await makeRequest(testData);
    
    if (data.success) {
      const actualDiscount = data.discount;
      const actualFinal = data.finalAmount;
      
      const discountMatch = Math.abs(actualDiscount - expectedDiscount) < 0.01;
      const finalMatch = Math.abs(actualFinal - expectedFinal) < 0.01;
      
      if (discountMatch && finalMatch) {
        console.log(`   ✅ PASS - Discount: $${actualDiscount}, Final: $${actualFinal}`);
        return true;
      } else {
        console.log(`   ❌ FAIL - Got Discount: $${actualDiscount}, Final: $${actualFinal}`);
        return false;
      }
    } else {
      console.log(`   ❌ FAIL - ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Testing All Coupon Types\n');
  console.log('=' .repeat(50));
  
  let passCount = 0;
  let totalTests = 0;
  
  // Test 1: Set Price Coupon (SAVE100 - sets price to $1.00)
  totalTests++;
  if (await testCouponType(
    'Set Price Coupon (SAVE100)',
    'SAVE100',
    88.50,
    87.50,  // discount = 88.50 - 1.00
    1.00    // final = 1.00
  )) passCount++;
  
  // Test 2: Percentage Coupon (need to create one for testing)
  // Let's test with a hypothetical 20% off coupon
  totalTests++;
  if (await testCouponType(
    'Percentage Coupon (20% off)',
    'PERCENT20',
    100.00,
    20.00,  // discount = 100.00 * 0.20
    80.00   // final = 100.00 - 20.00
  )) passCount++;
  
  // Test 3: Fixed Amount Coupon 
  // Let's test with a hypothetical $15 off coupon
  totalTests++;
  if (await testCouponType(
    'Fixed Amount Coupon ($15 off)',
    'FIXED15',
    88.50,
    15.00,  // discount = 15.00
    73.50   // final = 88.50 - 15.00
  )) passCount++;
  
  // Test 4: Edge case - Fixed amount larger than order
  totalTests++;
  if (await testCouponType(
    'Fixed Amount Edge Case (larger than order)',
    'FIXED15',
    10.00,
    10.00,  // discount = min(15.00, 10.00) = 10.00
    0.00    // final = 10.00 - 10.00 = 0.00
  )) passCount++;
  
  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('🎉 All coupon types working correctly!');
  } else {
    console.log('⚠️  Some coupon types need attention');
  }
}

runAllTests();
