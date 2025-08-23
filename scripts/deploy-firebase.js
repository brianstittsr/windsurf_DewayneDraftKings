const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Firebase deployment...');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.log('❌ Firebase CLI not found. Installing...');
  execSync('npm install -g firebase-tools', { stdio: 'inherit' });
}

// Check if Firebase project is initialized
const firebaseConfigPath = path.join(__dirname, '..', 'firebase.json');
if (!fs.existsSync(firebaseConfigPath)) {
  console.log('❌ Firebase project not initialized');
  console.log('Please run: firebase init');
  process.exit(1);
}

try {
  // Deploy Firestore rules
  console.log('📋 Deploying Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  
  // Deploy Firestore indexes
  console.log('📊 Deploying Firestore indexes...');
  execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
  
  // Deploy Storage rules
  console.log('🗄️ Deploying Storage rules...');
  execSync('firebase deploy --only storage', { stdio: 'inherit' });
  
  console.log('✅ Firebase deployment completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update your .env.local file with your Firebase configuration');
  console.log('2. Run the application: npm run dev');
  console.log('3. Test the Firebase integration');
  
} catch (error) {
  console.error('❌ Firebase deployment failed:', error.message);
  process.exit(1);
}
