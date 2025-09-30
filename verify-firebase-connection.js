#!/usr/bin/env node

/**
 * Verify Firebase Connection
 * Confirms that the application is connecting to production Firebase
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verifying Firebase Connection Configuration\n');
console.log('='.repeat(70));

// Check environment variables
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  useEmulator: process.env.USE_FIREBASE_EMULATOR
};

console.log('📋 Environment Configuration:');
console.log('─'.repeat(70));
console.log(`✅ Project ID: ${config.projectId || '❌ NOT SET'}`);
console.log(`✅ Auth Domain: ${config.authDomain || '❌ NOT SET'}`);
console.log(`✅ Storage Bucket: ${config.storageBucket || '❌ NOT SET'}`);
console.log(`✅ API Key: ${config.apiKey ? '***' + config.apiKey.slice(-4) : '❌ NOT SET'}`);
console.log(`✅ App ID: ${config.appId ? '***' + config.appId.slice(-8) : '❌ NOT SET'}`);
console.log(`✅ Messaging Sender ID: ${config.messagingSenderId || '❌ NOT SET'}`);

console.log('\n🔌 Connection Mode:');
console.log('─'.repeat(70));

if (config.useEmulator === 'true') {
  console.log('⚠️  EMULATOR MODE ENABLED');
  console.log('   Your app will connect to LOCAL Firebase emulators');
  console.log('   Set USE_FIREBASE_EMULATOR=false or remove it from .env.local');
} else {
  console.log('✅ PRODUCTION MODE');
  console.log('   Your app will connect to PRODUCTION Firebase');
  console.log(`   Project: ${config.projectId}`);
}

console.log('\n📊 Configuration Status:');
console.log('─'.repeat(70));

const allSet = config.apiKey && config.authDomain && config.projectId && 
               config.storageBucket && config.messagingSenderId && config.appId;

if (allSet) {
  console.log('✅ All Firebase credentials are configured');
  console.log('✅ Application will connect to production Firebase');
} else {
  console.log('❌ Some Firebase credentials are missing');
  console.log('⚠️  Check your .env.local file');
}

// Test actual connection
console.log('\n🧪 Testing Connection to Production Firebase...');
console.log('─'.repeat(70));

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

try {
  const app = initializeApp(config);
  const db = getFirestore(app);
  
  console.log('✅ Firebase initialized successfully');
  
  // Try to read from products collection
  getDocs(query(collection(db, 'products'), limit(1)))
    .then(snapshot => {
      console.log(`✅ Successfully connected to production database`);
      console.log(`✅ Products collection accessible (${snapshot.size} documents tested)`);
      console.log('\n🎉 CONFIRMATION: Your local app is connected to PRODUCTION Firebase!');
      console.log(`📍 Production Project: ${config.projectId}`);
      process.exit(0);
    })
    .catch(error => {
      console.log('❌ Error reading from database:', error.message);
      console.log('⚠️  Check your Firebase security rules');
      process.exit(1);
    });
    
} catch (error) {
  console.log('❌ Error initializing Firebase:', error.message);
  process.exit(1);
}
