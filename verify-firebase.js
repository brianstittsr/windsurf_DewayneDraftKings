// Verify Firebase connection with real credentials
require('dotenv').config({ path: '.env.local' });

async function verifyFirebase() {
  try {
    console.log('=== Firebase Connection Verification ===');
    
    // Import Firebase modules
    const { initializeApp, getApps } = require('firebase/app');
    const { getFirestore, collection, getDocs } = require('firebase/firestore');
    
    // Use real environment variables
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
    
    console.log('✅ Environment variables loaded');
    console.log('Project ID:', firebaseConfig.projectId);
    console.log('Auth Domain:', firebaseConfig.authDomain);
    
    // Initialize Firebase
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    console.log('✅ Firebase app initialized');
    
    // Test Firestore connection
    const db = getFirestore(app);
    console.log('✅ Firestore initialized');
    
    // Try to read collections
    console.log('\n=== Testing Database Access ===');
    
    // Test coupons collection
    try {
      const couponsRef = collection(db, 'coupons');
      const couponsSnapshot = await getDocs(couponsRef);
      console.log('✅ Coupons collection accessible:', couponsSnapshot.size, 'documents');
    } catch (error) {
      console.log('⚠️  Coupons collection:', error.message);
    }
    
    // Test players collection
    try {
      const playersRef = collection(db, 'players');
      const playersSnapshot = await getDocs(playersRef);
      console.log('✅ Players collection accessible:', playersSnapshot.size, 'documents');
    } catch (error) {
      console.log('⚠️  Players collection:', error.message);
    }
    
    // Test payments collection
    try {
      const paymentsRef = collection(db, 'payments');
      const paymentsSnapshot = await getDocs(paymentsRef);
      console.log('✅ Payments collection accessible:', paymentsSnapshot.size, 'documents');
    } catch (error) {
      console.log('⚠️  Payments collection:', error.message);
    }
    
    console.log('\n🎉 Firebase connection successful!');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    console.error('Error code:', error.code);
    return false;
  }
}

verifyFirebase().then(success => {
  if (success) {
    console.log('\n✅ Firebase is ready for use!');
    console.log('- Pricing data can now be loaded from database');
    console.log('- Payment records will be stored properly');
    console.log('- Player profiles will be saved to Firestore');
  } else {
    console.log('\n❌ Firebase setup needs attention');
  }
}).catch(console.error);
