const axios = require('axios');

async function createTestCoupon() {
  try {
    console.log('Creating TEST100 coupon via API...');
    
    const couponData = {
      code: 'TEST100',
      description: 'Test coupon - reduces any registration to $1',
      discountType: 'set_price',
      discountValue: 1.00,
      isActive: true,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      usageLimit: null,
      minimumOrderAmount: 0,
      applicableItems: ['jamboree', 'complete_season', 'jamboree_and_season', 'coach_registration'],
      notes: 'Test coupon for development and testing purposes'
    };

    const response = await axios.post('http://localhost:3000/api/coupons', couponData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ TEST100 coupon created successfully!');
      console.log('Coupon ID:', response.data.id);
      console.log('Coupon Details:');
      console.log('- Code: TEST100');
      console.log('- Type: Set Price');
      console.log('- Value: $1.00');
      console.log('- Applicable to: All registration types');
      console.log('- Usage: Unlimited');
      console.log('- Expires in: 1 year');
    } else {
      console.error('❌ Failed to create coupon:', response.data.error);
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

createTestCoupon();
