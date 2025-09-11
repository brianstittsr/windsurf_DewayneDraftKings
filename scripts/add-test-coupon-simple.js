// Simple script to add TEST coupon to Firebase
// This uses the Firebase client SDK instead of admin SDK

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration (using environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dewaynedraftkings',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestCoupon() {
  try {
    console.log('Adding TEST coupon to Firebase...');

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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Check if TEST coupon already exists
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('code', '==', 'TEST'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log('TEST coupon already exists. Updating...');
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        ...couponData,
        updatedAt: serverTimestamp()
      });
      console.log('✅ TEST coupon updated successfully!');
    } else {
      // Add new coupon
      const docRef = await addDoc(couponsRef, couponData);
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
    console.log('\nNote: Make sure your Firebase configuration is set up correctly.');
    console.log('You can also add this coupon manually through the admin dashboard.');
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
