const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

async function createTestCoupon() {
  try {
    console.log('Creating TEST100 coupon...');
    
    const now = admin.firestore.Timestamp.now();
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Expires in 1 year
    
    const couponData = {
      code: 'TEST100',
      description: 'Test coupon - reduces any registration to $1',
      discountType: 'set_price',
      discountValue: 1.00, // Set price to $1
      isActive: true,
      expirationDate: admin.firestore.Timestamp.fromDate(expirationDate),
      usageLimit: null, // Unlimited usage
      usageCount: 0,
      minimumOrderAmount: 0,
      applicableItems: ['jamboree', 'complete_season', 'jamboree_and_season', 'coach_registration'],
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      notes: 'Test coupon for development and testing purposes'
    };

    const docRef = await db.collection('coupons').add(couponData);
    
    console.log('✅ TEST100 coupon created successfully!');
    console.log('Document ID:', docRef.id);
    console.log('Coupon Details:');
    console.log('- Code: TEST100');
    console.log('- Type: Set Price');
    console.log('- Value: $1.00');
    console.log('- Applicable to: All registration types');
    console.log('- Usage: Unlimited');
    console.log('- Expires:', expirationDate.toLocaleDateString());
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating coupon:', error);
    process.exit(1);
  }
}

createTestCoupon();
