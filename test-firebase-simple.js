// Simple Firebase connection test
require('dotenv').config({ path: '.env.local' });

console.log('=== Firebase Environment Check ===');
console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('API_KEY exists:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

// Expected values for dewaynedraftkings project
const expected = {
  projectId: 'dewaynedraftkings',
  authDomain: 'dewaynedraftkings.firebaseapp.com',
  storageBucket: 'dewaynedraftkings.appspot.com'
};

console.log('\n=== Configuration Check ===');
console.log('✅ PROJECT_ID correct:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === expected.projectId);
console.log('✅ AUTH_DOMAIN correct:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN === expected.authDomain);
console.log('✅ STORAGE_BUCKET correct:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET === expected.storageBucket);

if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== expected.projectId) {
  console.log('\n❌ ISSUE FOUND: Wrong project ID');
  console.log('Current:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('Expected:', expected.projectId);
  console.log('\nPlease update your .env.local file with:');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID="dewaynedraftkings"');
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="dewaynedraftkings.firebaseapp.com"');
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="dewaynedraftkings.appspot.com"');
}
