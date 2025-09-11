const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } = require('firebase/firestore');

// Load environment variables first
require('dotenv').config({ path: '.env.local' });

// Firebase configuration - update with your actual values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function verifyFirebaseConnection() {
  try {
    console.log('🔥 Initializing Firebase...');
    
    // Check if environment variables are set
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      console.log('Please check your .env.local file');
      return;
    }
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    console.log('🔍 Debug - Raw env var:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
    // Validate project ID is not undefined
    if (!firebaseConfig.projectId || firebaseConfig.projectId === 'undefined') {
      console.error('❌ Project ID is undefined or invalid');
      console.log('Environment variables loaded:');
      console.log('  API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET');
      console.log('  PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET');
      console.log('  AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'NOT SET');
      return;
    }
    
    // Test Firestore connection
    console.log('\n🔍 Testing Firestore connection...');
    const couponsRef = collection(db, 'coupons');
    
    // Try to read existing coupons
    const snapshot = await getDocs(couponsRef);
    console.log(`📋 Found ${snapshot.size} existing coupons in Firebase`);
    
    if (snapshot.size > 0) {
      console.log('\n📝 Existing coupons:');
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.code}: ${data.discountType} (${data.discountValue})`);
      });
    }
    
    // Test write capability
    console.log('\n✍️  Testing write capability...');
    const testCoupon = {
      code: 'FIREBASE_TEST',
      discountType: 'percentage',
      discountValue: 10,
      description: 'Test coupon to verify Firebase connection',
      isActive: true,
      usageLimit: 1,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(couponsRef, testCoupon);
    console.log('✅ Test coupon created with ID:', docRef.id);
    
    // Clean up test coupon
    await deleteDoc(doc(db, 'coupons', docRef.id));
    console.log('🧹 Test coupon cleaned up');
    
    console.log('\n🎉 Firebase connection verified successfully!');
    console.log('Your coupons will be stored in Firebase Firestore.');
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔒 Permission denied. Please check:');
      console.log('  1. Firestore security rules allow read/write');
      console.log('  2. Firebase project is properly configured');
    } else if (error.code === 'unavailable') {
      console.log('\n🌐 Network issue. Please check your internet connection.');
    } else {
      console.log('\n🔧 Please verify your Firebase configuration in .env.local');
    }
  }
}

verifyFirebaseConnection();
