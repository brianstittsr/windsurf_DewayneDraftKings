const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmkYRJwn7_jxEWLGzxZqLNJGzxZqLNJGz",
  authDomain: "allprosports-dewayne.firebaseapp.com",
  projectId: "allprosports-dewayne",
  storageBucket: "allprosports-dewayne.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345678"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Registration configuration data
const registrationConfig = {
  jerseySizes: [
    { value: 'XS', label: 'Extra Small (XS)' },
    { value: 'S', label: 'Small (S)' },
    { value: 'M', label: 'Medium (M)' },
    { value: 'L', label: 'Large (L)' },
    { value: 'XL', label: 'Extra Large (XL)' },
    { value: 'XXL', label: '2X Large (XXL)' },
    { value: 'XXXL', label: '3X Large (XXXL)' }
  ],
  playerPositions: [
    { value: 'flex', label: 'Flexible' },
    { value: 'quarterback', label: 'Quarterback' },
    { value: 'receiver', label: 'Wide Receiver' },
    { value: 'rusher', label: 'Running Back' },
    { value: 'center', label: 'Center' },
    { value: 'offense', label: 'Offensive Line' },
    { value: 'defense', label: 'Defensive Line' },
    { value: 'linebacker', label: 'Linebacker' },
    { value: 'cornerback', label: 'Cornerback' },
    { value: 'safety', label: 'Safety' }
  ],
  emergencyRelations: [
    { value: 'parent', label: 'Parent' },
    { value: 'guardian', label: 'Legal Guardian' },
    { value: 'spouse', label: 'Spouse/Partner' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' }
  ],
  communicationMethods: [
    { value: 'email', label: 'Email Only' },
    { value: 'sms', label: 'SMS/Text Only' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'both', label: 'Email & SMS' },
    { value: 'all', label: 'All Methods' }
  ]
};

async function seedRegistrationConfig() {
  try {
    console.log('🌱 Seeding registration configuration...');
    
    // Save configuration to Firebase
    const configRef = doc(db, 'configuration', 'registration');
    await setDoc(configRef, {
      ...registrationConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    });
    
    console.log('✅ Registration configuration seeded successfully!');
    console.log('📊 Configuration includes:');
    console.log(`   - ${registrationConfig.jerseySizes.length} jersey sizes`);
    console.log(`   - ${registrationConfig.playerPositions.length} player positions`);
    console.log(`   - ${registrationConfig.emergencyRelations.length} emergency contact relations`);
    console.log(`   - ${registrationConfig.communicationMethods.length} communication methods`);
    
  } catch (error) {
    console.error('❌ Error seeding registration configuration:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedRegistrationConfig()
  .then(() => {
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
