// Debug Firebase connection and coupon API
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Test Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummy",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dewaynedraftkings.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dewaynedraftkings",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dewaynedraftkings.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:dummy",
};

async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    console.log('Config:', JSON.stringify(firebaseConfig, null, 2));
    
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
    
    // Try to read from coupons collection
    const couponsRef = collection(db, 'coupons');
    const snapshot = await getDocs(couponsRef);
    
    console.log('✅ Firestore connection successful');
    console.log(`Found ${snapshot.size} existing coupons`);
    
    snapshot.forEach(doc => {
      console.log('Coupon:', doc.id, doc.data());
    });
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    return false;
  }
}

async function testCouponAPI() {
  try {
    console.log('\n=== Testing Coupon API ===');
    
    const response = await fetch('http://localhost:3000/api/coupons');
    console.log('API Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API working, response:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ API error:', errorText);
    }
  } catch (error) {
    console.error('❌ API request failed:', error.message);
  }
}

async function main() {
  console.log('=== Firebase & API Debug ===');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  console.log('Environment variables loaded:');
  console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('API_KEY exists:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  
  const firebaseWorking = await testFirebaseConnection();
  
  if (firebaseWorking) {
    await testCouponAPI();
  } else {
    console.log('\n❌ Firebase connection failed - API will not work');
    console.log('Please check:');
    console.log('1. .env.local file has correct Firebase configuration');
    console.log('2. Firestore API is enabled in Google Cloud Console');
    console.log('3. Firebase project "dewaynedraftkings" exists and is accessible');
  }
}

main().catch(console.error);
