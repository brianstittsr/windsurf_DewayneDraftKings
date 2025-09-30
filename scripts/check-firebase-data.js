#!/usr/bin/env node

/**
 * Check Firebase Data
 * Verifies what data exists in Firebase collections
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔍 Checking Firebase Data');
console.log('='.repeat(60));
console.log(`📍 Project: ${firebaseConfig.projectId}`);
console.log('='.repeat(60));

// Initialize Firebase
let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase connected successfully\n');
} catch (error) {
  console.error('❌ Firebase connection failed:', error.message);
  process.exit(1);
}

async function checkCollection(collectionName) {
  try {
    console.log(`\n📦 Checking collection: "${collectionName}"`);
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    console.log(`   Documents found: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('   Sample documents:');
      snapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ID: ${doc.id}`);
        if (data.title) console.log(`      Title: ${data.title}`);
        if (data.name) console.log(`      Name: ${data.name}`);
        if (data.code) console.log(`      Code: ${data.code}`);
        if (data.category) console.log(`      Category: ${data.category}`);
        if (data.price !== undefined) console.log(`      Price: $${data.price}`);
      });
    } else {
      console.log('   ⚠️  Collection is empty');
    }
    
    return snapshot.size;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return 0;
  }
}

async function main() {
  const collections = [
    'products',
    'pricing',
    'coupons',
    'configuration',
    'players',
    'coaches',
    'teams',
    'user_profiles'
  ];
  
  const results = {};
  
  for (const collectionName of collections) {
    results[collectionName] = await checkCollection(collectionName);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([name, count]) => {
    const status = count > 0 ? '✅' : '⚠️ ';
    console.log(`${status} ${name.padEnd(20)}: ${count} documents`);
  });
  
  const totalDocs = Object.values(results).reduce((sum, count) => sum + count, 0);
  console.log(`\n📈 Total documents: ${totalDocs}`);
  
  if (results.products === 0 && results.pricing === 0) {
    console.log('\n⚠️  No pricing data found in either "products" or "pricing" collection');
    console.log('💡 Run: node scripts/populate-production-firebase.js');
  } else if (results.products > 0) {
    console.log('\n✅ Products collection has data - pricing page should work!');
  } else if (results.pricing > 0) {
    console.log('\n⚠️  Data is in "pricing" collection but API expects "products"');
    console.log('💡 Need to either:');
    console.log('   1. Update API to use "pricing" collection, OR');
    console.log('   2. Copy data from "pricing" to "products"');
  }
}

main()
  .then(() => {
    console.log('\n🏁 Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });
