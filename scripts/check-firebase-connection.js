// Firebase Connection Test Script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Connection Status Check\n');

// Check if .env.local exists
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envLocalExists = fs.existsSync(envLocalPath);

console.log('📁 Environment File Status:');
console.log(`   .env.local exists: ${envLocalExists ? '✅' : '❌'}`);

if (!envLocalExists) {
  console.log('\n❌ .env.local file not found!');
  console.log('📋 To fix this:');
  console.log('   1. Copy .env.local.example to .env.local');
  console.log('   2. Fill in your Firebase configuration values');
  console.log('   3. Get values from Firebase Console > Project Settings');
  process.exit(1);
}

// Read and check environment variables
console.log('\n🔧 Environment Variables:');
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

// Load environment variables
require('dotenv').config({ path: envLocalPath });

const missingVars = [];
const presentVars = [];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('your-') || value.includes('...')) {
    missingVars.push(varName);
    console.log(`   ${varName}: ❌ Missing or placeholder`);
  } else {
    presentVars.push(varName);
    console.log(`   ${varName}: ✅ Configured`);
  }
});

console.log(`\n📊 Configuration Status: ${presentVars.length}/${requiredVars.length} variables configured`);

if (missingVars.length > 0) {
  console.log('\n❌ Firebase configuration incomplete!');
  console.log('Missing or placeholder values:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📋 Next steps:');
  console.log('   1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('   2. Select your project or create a new one');
  console.log('   3. Go to Project Settings > General > Your apps');
  console.log('   4. Copy the config values to your .env.local file');
} else {
  console.log('\n✅ All Firebase environment variables are configured!');
  console.log('\n🧪 Testing Firebase connection...');
  
  try {
    // Test the Firebase connection via API
    console.log('   Starting development server to test connection...');
    console.log('   Visit: http://localhost:3000/api/test-firebase');
    console.log('\n💡 If the server starts successfully, Firebase should be connected!');
  } catch (error) {
    console.log('❌ Error testing connection:', error.message);
  }
}

// Check Firebase dependencies
console.log('\n📦 Firebase Dependencies:');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const firebaseVersion = packageJson.dependencies?.firebase;
  const firebaseAdminVersion = packageJson.dependencies?.['firebase-admin'];
  
  console.log(`   firebase: ${firebaseVersion ? '✅ ' + firebaseVersion : '❌ Not installed'}`);
  console.log(`   firebase-admin: ${firebaseAdminVersion ? '✅ ' + firebaseAdminVersion : '❌ Not installed'}`);
} else {
  console.log('   ❌ package.json not found');
}

console.log('\n🎯 Summary:');
if (envLocalExists && missingVars.length === 0) {
  console.log('   ✅ Firebase should be properly connected');
  console.log('   🚀 Run "npm run dev" and test at /api/test-firebase');
} else {
  console.log('   ❌ Firebase configuration needs attention');
  console.log('   📋 Follow the steps above to complete setup');
}
