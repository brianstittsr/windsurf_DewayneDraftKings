// Script to seed initial pricing data into Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initial pricing data
const initialPricingData = [
  {
    title: 'Jamboree Game',
    subtitle: 'Single game participation',
    price: 29.50,
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
    category: 'player',
    isActive: true
  },
  {
    title: 'Jamboree + Season',
    subtitle: 'Complete package deal',
    price: 91.50,
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
    category: 'player',
    isActive: true
  },
  {
    title: 'Complete Season',
    subtitle: 'Full season participation',
    price: 62.00,
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
    category: 'player',
    isActive: true
  },
  {
    title: 'Assistant Coach',
    subtitle: 'Support coaching role',
    price: 48.00,
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
    category: 'coach',
    isActive: true
  },
  {
    title: 'Head Coach',
    subtitle: 'Leadership role',
    price: 72.00,
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
    category: 'coach',
    isActive: true
  }
];

async function seedPricingData() {
  try {
    console.log('Seeding pricing data...');
    
    for (const plan of initialPricingData) {
      const docRef = await addDoc(collection(db, 'pricing'), {
        ...plan,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Added pricing plan: ${plan.title} with ID: ${docRef.id}`);
    }
    
    console.log('Pricing data seeding completed!');
  } catch (error) {
    console.error('Error seeding pricing data:', error);
  }
}

// Run the seeding function
seedPricingData();
