const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

async function createTEST100Coupon() {
  try {
    console.log('Creating TEST100 coupon in Firebase...');
    
    const couponData = {
      code: 'TEST100',
      description: 'Test coupon - reduces any registration to $1',
      discountType: 'set_price',
      discountValue: 1.00,
      isActive: true,
      expirationDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      usageLimit: null,
      usageCount: 0,
      minimumOrderAmount: 0,
      applicableItems: ['jamboree', 'complete_season', 'jamboree_and_season', 'coach_registration'],
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'system',
      notes: 'Test coupon for development and testing purposes'
    };

    const docRef = await db.collection('coupons').add(couponData);
    
    console.log('✅ TEST100 coupon created successfully!');
    console.log('Document ID:', docRef.id);
    console.log('Code: TEST100');
    console.log('Type: Set Price to $1.00');
    console.log('Applicable to: All registration types');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating coupon:', error);
    process.exit(1);
  }
}

createTEST100Coupon();
