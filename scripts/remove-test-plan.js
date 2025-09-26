const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, query, where } = require('firebase/firestore');

// Firebase configuration - use environment variables if available
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBmkYRJwn7_jxEWLGzxZqLNJGzxZqLNJGz",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "allprosports-dewayne.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "allprosports-dewayne",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "allprosports-dewayne.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456789012345678"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function removeTestPlan() {
  try {
    console.log('🔍 Searching for test plans...');
    
    // Query for plans with "Test Plan" title
    const pricingRef = collection(db, 'pricing');
    const q = query(pricingRef, where('title', '==', 'Test Plan'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('✅ No test plans found in database.');
      return;
    }
    
    console.log(`📋 Found ${snapshot.size} test plan(s) to remove:`);
    
    // Delete each test plan found
    const deletePromises = snapshot.docs.map(async (docSnapshot) => {
      const planData = docSnapshot.data();
      console.log(`   - Removing: "${planData.title}" (${planData.subtitle}) - $${planData.price}`);
      
      await deleteDoc(doc(db, 'pricing', docSnapshot.id));
      console.log(`   ✅ Deleted plan with ID: ${docSnapshot.id}`);
    });
    
    await Promise.all(deletePromises);
    
    console.log('🎉 All test plans have been successfully removed from the database!');
    
  } catch (error) {
    console.error('❌ Error removing test plans:', error);
    process.exit(1);
  }
}

// Run the removal function
removeTestPlan()
  .then(() => {
    console.log('✨ Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
