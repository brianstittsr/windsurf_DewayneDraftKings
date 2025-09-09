// Check if environment variables are being loaded correctly
require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Variables Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('NEXT_PUBLIC_FIREBASE_API_KEY exists:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

// Check if we're getting placeholder values
if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'your-project-id') {
  console.log('\n❌ PROBLEM: Still using placeholder project ID');
  console.log('Your .env.local file needs to have the actual Firebase project ID');
} else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'dewaynedraftkings') {
  console.log('\n✅ Project ID looks correct: dewaynedraftkings');
} else {
  console.log('\n⚠️ Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

// Check if API key exists
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('your-') || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('AIzaSyC')) {
  console.log('\n❌ PROBLEM: Firebase API key is missing or using placeholder');
  console.log('You need to get the real API key from Firebase Console');
} else {
  console.log('\n✅ Firebase API key appears to be set');
}
