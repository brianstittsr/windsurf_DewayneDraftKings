// Debug coupon creation API
const fetch = require('node-fetch');

async function testCouponAPI() {
  try {
    console.log('Testing coupon API...');
    
    const testData = {
      code: 'TEST100',
      displayName: 'Test Coupon',
      description: 'Test coupon for $1',
      discountType: 'set_price',
      discountValue: '1.00',
      isActive: true,
      startDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      maxTotalUses: '',
      maxUsesPerCustomer: '1',
      minimumOrderAmount: '0',
      applicableItems: {
        playerRegistration: true,
        coachRegistration: true,
        jamboreeOnly: true,
        completeSeason: true,
        jamboreeAndSeason: true
      }
    };

    console.log('Sending data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3000/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Coupon created successfully!');
    } else {
      console.log('❌ Failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testCouponAPI();
