const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // For local development, you can use a service account key
  // In production, use environment variables or default credentials
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dewaynedraftkings'
    });
  } catch (error) {
    console.log('Using default Firebase configuration...');
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function addTestCoupon() {
  try {
    const couponData = {
      code: 'TEST',
      discountType: 'set_price',
      discountValue: 1, // Set price to $1
      description: 'Test coupon - reduces any plan to $1',
      isActive: true,
      usageLimit: null, // Unlimited usage
      usedCount: 0,
      expiryDate: null, // No expiry
      minimumOrderValue: 0,
      applicableItems: [], // Applies to all items
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Check if TEST coupon already exists
    const existingCoupon = await db.collection('coupons').where('code', '==', 'TEST').get();
    
    if (!existingCoupon.empty) {
      console.log('TEST coupon already exists. Updating...');
      const docId = existingCoupon.docs[0].id;
      await db.collection('coupons').doc(docId).update({
        ...couponData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ TEST coupon updated successfully!');
    } else {
      // Add new coupon
      const docRef = await db.collection('coupons').add(couponData);
      console.log('✅ TEST coupon created successfully with ID:', docRef.id);
    }

    console.log('\nCoupon Details:');
    console.log('- Code: TEST');
    console.log('- Type: Set Price');
    console.log('- Price: $1.00');
    console.log('- Usage: Unlimited');
    console.log('- Expiry: Never');
    console.log('- Applies to: All plans');

  } catch (error) {
    console.error('❌ Error adding TEST coupon:', error);
  }
}

// Run the script
addTestCoupon().then(() => {
  console.log('\n🎉 Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
