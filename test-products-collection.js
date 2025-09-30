require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('Connecting to Firebase project:', config.projectId);

const app = initializeApp(config);
const db = getFirestore(app);

async function checkProducts() {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log('\n✅ Products collection exists!');
    console.log(`📦 Documents found: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('\n📋 Products:');
      snapshot.docs.forEach((doc, i) => {
        const data = doc.data();
        console.log(`${i + 1}. ${data.title || 'Untitled'} - $${data.price || 0} (${data.category || 'N/A'})`);
      });
    } else {
      console.log('\n⚠️  Collection exists but is EMPTY');
      console.log('Run: node scripts/populate-production-firebase.js');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

checkProducts().then(() => process.exit(0));
