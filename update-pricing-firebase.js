const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Updated pricing data with $3.00 reduction for player plans
const updatedPricingData = [
  {
    id: 'jamboree-game',
    title: 'Jamboree Game',
    subtitle: 'Registration + Jersey',
    price: 23.50, // Reduced from 26.50
    serviceFee: 3.00,
    features: [
      'Single game registration',
      'Official team jersey',
      'Game day participation',
      'Basic stats tracking',
      'Team photo inclusion'
    ],
    popular: false,
    buttonText: 'Register Now',
    buttonClass: 'btn-outline-primary',
    itemType: 'jamboree',
    category: 'player'
  },
  {
    id: 'jamboree-season-bundle',
    title: 'Jamboree + Season',
    subtitle: 'Complete package',
    price: 85.50, // Reduced from 88.50
    serviceFee: 3.00,
    features: [
      'Jamboree game registration',
      'Complete season access',
      'Official team jersey',
      'Priority team placement',
      'All games & playoffs',
      'Premium stats package',
      'Exclusive team events',
      'Season highlight reel'
    ],
    popular: true,
    buttonText: 'Get Started',
    buttonClass: 'btn-primary',
    itemType: 'bundle',
    category: 'player'
  },
  {
    id: 'complete-season',
    title: 'Complete Season',
    subtitle: 'Full season access',
    price: 56.00, // Reduced from 59.00
    serviceFee: 3.00,
    features: [
      'Complete season registration',
      'All regular season games',
      'Playoff eligibility',
      'Official team jersey',
      'Advanced stats tracking',
      'Team events access',
      'Season awards eligibility'
    ],
    popular: false,
    buttonText: 'Join Season',
    buttonClass: 'btn-outline-primary',
    itemType: 'season',
    category: 'player'
  },
  {
    id: 'assistant-coach',
    title: 'Assistant Coach',
    subtitle: 'Support role',
    price: 45.00, // Unchanged
    serviceFee: 3.00,
    features: [
      'Assistant coaching role',
      'Team management access',
      'Player development training',
      'Game day sideline access',
      'Coach certification',
      'Equipment provided'
    ],
    popular: false,
    buttonText: 'Apply Now',
    buttonClass: 'btn-outline-primary',
    itemType: 'assistant_coach',
    category: 'coach'
  },
  {
    id: 'head-coach',
    title: 'Head Coach',
    subtitle: 'Leadership role',
    price: 75.00, // Unchanged
    serviceFee: 3.00,
    features: [
      'Head coaching position',
      'Full team management',
      'Strategic planning authority',
      'Player recruitment rights',
      'Advanced coach training',
      'Leadership certification',
      'Premium equipment package'
    ],
    popular: true,
    buttonText: 'Lead Team',
    buttonClass: 'btn-primary',
    itemType: 'head_coach',
    category: 'coach'
  }
];

async function updatePricingInFirebase() {
  try {
    console.log('🔥 Initializing Firebase...');
    
    // Load environment variables from .env.local
    require('dotenv').config({ path: '.env.local' });
    
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error('Missing Firebase configuration. Please check your .env.local file.');
    }
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log(`📊 Updating pricing data in Firebase project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
    console.log('💰 New pricing (reduced by $3.00 for player plans):');
    
    // Update each pricing plan in Firestore
    for (const plan of updatedPricingData) {
      console.log(`   - ${plan.title}: $${plan.price.toFixed(2)} + $${plan.serviceFee.toFixed(2)} service fee = $${(plan.price + plan.serviceFee).toFixed(2)} total`);
      
      const planRef = doc(db, 'pricing', plan.id);
      await setDoc(planRef, plan, { merge: true });
    }
    
    console.log('✅ Successfully updated all pricing plans in Firebase!');
    console.log('🌐 Changes will be reflected in the live application immediately.');
    
    // Display summary
    console.log('\n📋 PRICING UPDATE SUMMARY:');
    console.log('Player Plans (reduced by $3.00):');
    console.log('  • Jamboree Game: $26.50 → $23.50 (+ $3.00 fee = $26.50 total)');
    console.log('  • Complete Season: $59.00 → $56.00 (+ $3.00 fee = $59.00 total)');
    console.log('  • Jamboree + Season: $88.50 → $85.50 (+ $3.00 fee = $88.50 total)');
    console.log('Coach Plans (unchanged):');
    console.log('  • Assistant Coach: $45.00 (+ $3.00 fee = $48.00 total)');
    console.log('  • Head Coach: $75.00 (+ $3.00 fee = $78.00 total)');
    
  } catch (error) {
    console.error('❌ Error updating pricing in Firebase:', error);
    console.error('💡 Make sure your .env.local file contains valid Firebase credentials.');
    process.exit(1);
  }
}

// Run the update
updatePricingInFirebase();
