// Script to create test coupons for validation testing
// Run this with: node setup-test-coupons.js

const createTestCoupons = async () => {
  console.log('🎫 Creating Test Coupons for Validation...\n');

  const baseUrl = 'http://localhost:3001';
  
  // Test coupons to create
  const testCoupons = [
    {
      code: 'SAVE20',
      name: '20% Off Discount',
      description: 'Get 20% off your registration',
      discountType: 'percentage',
      discountValue: 20,
      startDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
      applicableItems: {
        playerRegistration: true,
        coachRegistration: true,
        jamboreeOnly: true,
        completeSeason: true,
        jamboreeAndSeason: true
      },
      isActive: true
    },
    {
      code: 'SAVE15',
      name: '$15 Off Discount',
      description: 'Get $15 off your registration',
      discountType: 'fixed_amount',
      discountValue: 15,
      startDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      applicableItems: {
        playerRegistration: true,
        coachRegistration: true,
        jamboreeOnly: true,
        completeSeason: true,
        jamboreeAndSeason: true
      },
      isActive: true
    },
    {
      code: 'SPECIAL50',
      name: 'Special $50 Price',
      description: 'Pay only $50 regardless of original price',
      discountType: 'set_price',
      discountValue: 50,
      startDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      applicableItems: {
        playerRegistration: true,
        coachRegistration: true,
        jamboreeOnly: true,
        completeSeason: true,
        jamboreeAndSeason: true
      },
      isActive: true
    },
    {
      code: 'SAVE10',
      name: '10% Off Discount',
      description: 'Get 10% off your registration',
      discountType: 'percentage',
      discountValue: 10,
      startDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      applicableItems: {
        playerRegistration: true,
        coachRegistration: true,
        jamboreeOnly: true,
        completeSeason: true,
        jamboreeAndSeason: true
      },
      isActive: true
    }
  ];

  console.log('Creating test coupons...\n');

  for (const coupon of testCoupons) {
    try {
      console.log(`Creating coupon: ${coupon.code} (${coupon.discountType})`);
      
      const response = await fetch(`${baseUrl}/api/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(coupon)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`  ✅ ${coupon.code} created successfully (ID: ${result.couponId})`);
        
        // Test the coupon immediately
        const testResponse = await fetch(`${baseUrl}/api/coupons/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: coupon.code,
            orderAmount: 100,
            applicableItems: ['player-registration']
          })
        });

        const testResult = await testResponse.json();
        if (testResult.success) {
          console.log(`  ✅ Validation test passed - Discount: $${testResult.discount}, Final: $${testResult.finalAmount}`);
        } else {
          console.log(`  ❌ Validation test failed: ${testResult.error}`);
        }
      } else {
        console.log(`  ❌ Failed to create ${coupon.code}: ${result.error}`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`  ❌ Error creating ${coupon.code}: ${error.message}\n`);
    }
  }

  console.log('🎉 Test Coupon Creation Complete!\n');

  console.log('📋 Created Coupons:');
  console.log('   - SAVE20: 20% off any registration');
  console.log('   - SAVE15: $15 off any registration');
  console.log('   - SPECIAL50: Set price to $50');
  console.log('   - SAVE10: 10% off any registration');

  console.log('\n🧪 Next Steps:');
  console.log('   1. Go to /test/coupon-validation and run the tests again');
  console.log('   2. All test cases should now pass');
  console.log('   3. Try using these coupons in the actual checkout');
  console.log('   4. Check the admin panel to see the created coupons');
};

// Run the script
createTestCoupons().catch(console.error);
