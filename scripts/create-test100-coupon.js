// Create TEST100 coupon via API
const fetch = require('node-fetch');

async function createTEST100Coupon() {
  try {
    const couponData = {
      code: 'TEST100',
      description: 'Test coupon - reduces any registration to $1',
      discountType: 'set_price',
      discountValue: 1.00,
      isActive: true,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: null,
      minimumOrderAmount: 0,
      applicableItems: ['jamboree', 'complete_season', 'jamboree_and_season', 'coach_registration'],
      notes: 'Test coupon for development and testing purposes'
    };

    console.log('Creating TEST100 coupon...');
    console.log('Coupon data:', JSON.stringify(couponData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(couponData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ TEST100 coupon created successfully!');
      console.log('Coupon ID:', result.id);
    } else {
      console.log('❌ Failed to create coupon:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTo create manually:');
    console.log('1. Go to http://localhost:3000/admin');
    console.log('2. Click Coupons tab');
    console.log('3. Add new coupon with code TEST100, set_price type, value 1.00');
  }
}

createTEST100Coupon();
