// Direct API test using fetch
const fetch = require('node-fetch');

async function testCouponAPI() {
  try {
    console.log('Testing coupon API...');
    
    // Test GET endpoint
    console.log('\n=== Testing GET /api/coupons ===');
    const getResponse = await fetch('http://localhost:3000/api/coupons');
    console.log('GET Status:', getResponse.status);
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET Success:', JSON.stringify(getData, null, 2));
    } else {
      const errorText = await getResponse.text();
      console.log('❌ GET Error:', errorText);
    }
    
    // Test POST endpoint - Create TEST100 coupon
    console.log('\n=== Testing POST /api/coupons (Create TEST100) ===');
    const couponData = {
      code: 'TEST100',
      discountType: 'set_price',
      discountValue: '1.00',
      description: 'Test coupon - sets registration to $1',
      expirationDate: '2024-12-31',
      maxUses: '100',
      isActive: true,
      applicableItems: {
        playerRegistration: true,
        coachRegistration: true,
        jamboreeOnly: true,
        completeSeason: true,
        jamboreeAndSeason: true
      }
    };
    
    const postResponse = await fetch('http://localhost:3000/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(couponData)
    });
    
    console.log('POST Status:', postResponse.status);
    
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ POST Success:', JSON.stringify(postData, null, 2));
    } else {
      const errorText = await postResponse.text();
      console.log('❌ POST Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testCouponAPI();
