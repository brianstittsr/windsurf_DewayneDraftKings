// Simple test script to create TEST100 coupon
const testCouponData = {
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

async function createTestCoupon() {
  try {
    console.log('Creating TEST100 coupon with data:', JSON.stringify(testCouponData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCouponData)
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ TEST100 coupon created successfully!');
      console.log('Coupon ID:', result.id);
    } else {
      console.log('❌ Failed to create coupon:', result.error);
    }
  } catch (error) {
    console.error('❌ Error creating coupon:', error.message);
  }
}

// Test Firebase connection first
async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    const response = await fetch('http://localhost:3000/api/coupons');
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Firebase connection working');
      console.log('Existing coupons:', result.coupons?.length || 0);
      return true;
    } else {
      console.log('❌ Firebase connection failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase connection error:', error.message);
    return false;
  }
}

async function main() {
  console.log('=== Coupon Creation Test ===');
  
  // Test connection first
  const connectionWorking = await testFirebaseConnection();
  
  if (connectionWorking) {
    console.log('\n=== Creating TEST100 Coupon ===');
    await createTestCoupon();
  } else {
    console.log('\n❌ Skipping coupon creation due to connection issues');
    console.log('Please check:');
    console.log('1. Next.js dev server is running (npm run dev)');
    console.log('2. Firebase environment variables are set in .env.local');
    console.log('3. Firestore API is enabled in Google Cloud Console');
  }
}

// Run if called directly
if (typeof window === 'undefined') {
  main();
}
