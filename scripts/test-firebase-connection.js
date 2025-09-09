const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  console.log('Config:', {
    apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
    authDomain: firebaseConfig.authDomain ? 'Set' : 'Missing',
    projectId: firebaseConfig.projectId ? 'Set' : 'Missing',
    storageBucket: firebaseConfig.storageBucket ? 'Set' : 'Missing',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'Set' : 'Missing',
    appId: firebaseConfig.appId ? 'Set' : 'Missing'
  });

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('Firebase initialized successfully');
    
    // Test creating a simple document
    const testData = {
      code: 'TEST100',
      discountType: 'set_price',
      discountValue: 1.00,
      isActive: true,
      createdAt: new Date()
    };
    
    console.log('Attempting to create test coupon...');
    const docRef = await addDoc(collection(db, 'coupons'), testData);
    console.log('✅ Test coupon created with ID:', docRef.id);
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testFirebaseConnection();
