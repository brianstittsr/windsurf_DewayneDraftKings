#!/usr/bin/env node

/**
 * Populate Production Firebase Database
 * 
 * This script populates the production Firebase database directly
 * with all necessary data for the All Pro Sports system.
 * 
 * Usage: node scripts/populate-production-firebase.js
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  Timestamp,
  query,
  where
} = require('firebase/firestore');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
  console.log(`📍 Project: ${firebaseConfig.projectId}`);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

// Products Data
const PRODUCTS_DATA = [
  {
    title: 'Player Registration',
    subtitle: 'Individual Player',
    description: 'Complete player registration for the full season with all benefits included',
    price: 150.00,
    serviceFee: 15.00,
    totalPrice: 165.00,
    features: [
      'Full season participation (12+ games)',
      'Official team jersey included',
      'Professional coaching and training',
      'Individual statistics tracking',
      'End of season awards ceremony',
      'Team photos and media coverage',
      'Access to league facilities',
      'Insurance coverage during games'
    ],
    itemType: 'season',
    category: 'player',
    popular: true,
    buttonText: 'Register Now',
    buttonClass: 'btn-primary',
    displayOrder: 1,
    isActive: true,
    isVisible: true,
    maxCapacity: 100,
    currentRegistrations: 0,
    tags: ['season', 'player', 'individual', 'popular']
  },
  {
    title: 'Jamboree Tournament Entry',
    subtitle: 'Single Event',
    description: 'Entry for weekend jamboree tournament - perfect for trying out the league',
    price: 75.00,
    serviceFee: 7.50,
    totalPrice: 82.50,
    features: [
      'Weekend tournament entry',
      'Minimum 3 games guaranteed',
      'Refreshments and snacks included',
      'Awards ceremony participation',
      'Professional photo opportunities',
      'Team placement for future seasons',
      'Meet coaches and other players',
      'Equipment trial opportunities'
    ],
    itemType: 'jamboree',
    category: 'player',
    popular: false,
    buttonText: 'Enter Tournament',
    buttonClass: 'btn-success',
    displayOrder: 2,
    isActive: true,
    isVisible: true,
    maxCapacity: 50,
    currentRegistrations: 0,
    tags: ['tournament', 'jamboree', 'weekend', 'trial']
  },
  {
    title: 'Season + Jamboree Bundle',
    subtitle: 'Best Value Package',
    description: 'Complete package including full season plus all jamboree tournaments',
    price: 200.00,
    serviceFee: 20.00,
    totalPrice: 220.00,
    features: [
      'Full season participation',
      'All jamboree tournaments included',
      'Premium team jersey and gear package',
      'Priority team placement',
      'Exclusive training sessions',
      'End of season championship banquet',
      'Advanced statistics and video analysis',
      'Priority registration for next season'
    ],
    itemType: 'bundle',
    category: 'player',
    popular: false,
    buttonText: 'Get Best Value',
    buttonClass: 'btn-warning',
    displayOrder: 3,
    isActive: true,
    isVisible: true,
    maxCapacity: 75,
    currentRegistrations: 0,
    tags: ['bundle', 'season', 'jamboree', 'value', 'premium']
  },
  {
    title: 'Head Coach Registration',
    subtitle: 'Team Leadership',
    description: 'Complete head coach registration with full team management responsibilities',
    price: 150.00,
    serviceFee: 15.00,
    totalPrice: 165.00,
    features: [
      'Advanced coaching certification',
      'Complete coaching materials package',
      'Background check processing',
      'Premium coach gear package',
      'Team management system access',
      'League leadership opportunities',
      'Coaching clinic attendance',
      'End of season coach recognition'
    ],
    itemType: 'head_coach',
    category: 'coach',
    popular: true,
    buttonText: 'Lead a Team',
    buttonClass: 'btn-primary',
    displayOrder: 4,
    isActive: true,
    isVisible: true,
    maxCapacity: 10,
    currentRegistrations: 0,
    tags: ['coach', 'head', 'leadership', 'certification']
  },
  {
    title: 'Assistant Coach Registration',
    subtitle: 'Coaching Support Staff',
    description: 'Assistant coach registration and certification for supporting team operations',
    price: 100.00,
    serviceFee: 10.00,
    totalPrice: 110.00,
    features: [
      'Basic coaching certification',
      'Essential training materials',
      'Background check included',
      'Coach polo shirt and cap',
      'Season-long team commitment',
      'Coaching development workshops',
      'Team communication access',
      'Volunteer appreciation events'
    ],
    itemType: 'assistant_coach',
    category: 'coach',
    popular: false,
    buttonText: 'Support a Team',
    buttonClass: 'btn-info',
    displayOrder: 5,
    isActive: true,
    isVisible: true,
    maxCapacity: 20,
    currentRegistrations: 0,
    tags: ['coach', 'assistant', 'support', 'volunteer']
  }
];

// Sample Coupons Data
const COUPONS_DATA = [
  {
    code: 'WELCOME25',
    name: 'Welcome Discount',
    description: '25% off first registration',
    discountType: 'percentage',
    discountValue: 25,
    isActive: true,
    startDate: Timestamp.now(),
    expirationDate: Timestamp.fromDate(new Date('2025-12-31')),
    maxUses: 100,
    usedCount: 0,
    applicableItems: ['season', 'jamboree', 'bundle'],
    minimumOrderAmount: 50,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    code: 'EARLYBIRD',
    name: 'Early Bird Special',
    description: '$30 off season registration',
    discountType: 'fixed_amount',
    discountValue: 30,
    isActive: true,
    startDate: Timestamp.now(),
    expirationDate: Timestamp.fromDate(new Date('2025-06-30')),
    maxUses: 50,
    usedCount: 0,
    applicableItems: ['season', 'bundle'],
    minimumOrderAmount: 100,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    code: 'TRYOUT50',
    name: 'Jamboree Special',
    description: 'Jamboree entry for $50',
    discountType: 'set_price',
    discountValue: 50,
    isActive: true,
    startDate: Timestamp.now(),
    expirationDate: Timestamp.fromDate(new Date('2025-12-31')),
    maxUses: 200,
    usedCount: 0,
    applicableItems: ['jamboree'],
    minimumOrderAmount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Registration Configuration Data
const REGISTRATION_CONFIG = {
  jerseySizes: [
    { value: 'YS', label: 'Youth Small (6-8)' },
    { value: 'YM', label: 'Youth Medium (10-12)' },
    { value: 'YL', label: 'Youth Large (14-16)' },
    { value: 'S', label: 'Adult Small' },
    { value: 'M', label: 'Adult Medium' },
    { value: 'L', label: 'Adult Large' },
    { value: 'XL', label: 'Adult X-Large' },
    { value: '2XL', label: 'Adult 2X-Large' },
    { value: '3XL', label: 'Adult 3X-Large' }
  ],
  positions: [
    { value: 'QB', label: 'Quarterback' },
    { value: 'RB', label: 'Running Back' },
    { value: 'WR', label: 'Wide Receiver' },
    { value: 'TE', label: 'Tight End' },
    { value: 'OL', label: 'Offensive Line' },
    { value: 'DL', label: 'Defensive Line' },
    { value: 'LB', label: 'Linebacker' },
    { value: 'CB', label: 'Cornerback' },
    { value: 'S', label: 'Safety' },
    { value: 'K', label: 'Kicker' },
    { value: 'P', label: 'Punter' },
    { value: 'FLEX', label: 'Flexible/Multiple Positions' }
  ],
  emergencyContactRelationships: [
    { value: 'parent', label: 'Parent' },
    { value: 'guardian', label: 'Legal Guardian' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'other_relative', label: 'Other Relative' },
    { value: 'friend', label: 'Friend' }
  ],
  communicationPreferences: [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'Text Message (SMS)' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'app', label: 'Mobile App Notifications' },
    { value: 'all', label: 'All Methods' }
  ],
  version: '1.0',
  updatedAt: Timestamp.now()
};

/**
 * Populate Products Collection
 */
async function populateProducts() {
  console.log('\n📦 Populating Products Collection...');
  
  try {
    const productsRef = collection(db, 'products');
    let successCount = 0;
    
    for (const product of PRODUCTS_DATA) {
      try {
        const productData = {
          ...product,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        const docRef = await addDoc(productsRef, productData);
        console.log(`   ✅ Added: ${product.title} (ID: ${docRef.id})`);
        successCount++;
      } catch (error) {
        console.log(`   ❌ Failed: ${product.title} - ${error.message}`);
      }
    }
    
    console.log(`✅ Products: ${successCount}/${PRODUCTS_DATA.length} added successfully`);
    return successCount;
  } catch (error) {
    console.error('❌ Error populating products:', error.message);
    return 0;
  }
}

/**
 * Populate Coupons Collection
 */
async function populateCoupons() {
  console.log('\n🎟️  Populating Coupons Collection...');
  
  try {
    const couponsRef = collection(db, 'coupons');
    let successCount = 0;
    
    for (const coupon of COUPONS_DATA) {
      try {
        const docRef = await addDoc(couponsRef, coupon);
        console.log(`   ✅ Added: ${coupon.code} - ${coupon.name} (ID: ${docRef.id})`);
        successCount++;
      } catch (error) {
        console.log(`   ❌ Failed: ${coupon.code} - ${error.message}`);
      }
    }
    
    console.log(`✅ Coupons: ${successCount}/${COUPONS_DATA.length} added successfully`);
    return successCount;
  } catch (error) {
    console.error('❌ Error populating coupons:', error.message);
    return 0;
  }
}

/**
 * Populate Registration Configuration
 */
async function populateRegistrationConfig() {
  console.log('\n⚙️  Populating Registration Configuration...');
  
  try {
    const configRef = collection(db, 'configuration');
    const docRef = await addDoc(configRef, {
      type: 'registration',
      ...REGISTRATION_CONFIG
    });
    
    console.log(`   ✅ Added registration configuration (ID: ${docRef.id})`);
    console.log(`      - ${REGISTRATION_CONFIG.jerseySizes.length} jersey sizes`);
    console.log(`      - ${REGISTRATION_CONFIG.positions.length} positions`);
    console.log(`      - ${REGISTRATION_CONFIG.emergencyContactRelationships.length} relationship types`);
    console.log(`      - ${REGISTRATION_CONFIG.communicationPreferences.length} communication preferences`);
    
    return 1;
  } catch (error) {
    console.error('❌ Error populating configuration:', error.message);
    return 0;
  }
}

/**
 * Check if collections already have data
 */
async function checkExistingData() {
  console.log('\n🔍 Checking for existing data...');
  
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const couponsSnapshot = await getDocs(collection(db, 'coupons'));
    const configSnapshot = await getDocs(collection(db, 'configuration'));
    
    console.log(`   Products: ${productsSnapshot.size} existing documents`);
    console.log(`   Coupons: ${couponsSnapshot.size} existing documents`);
    console.log(`   Configuration: ${configSnapshot.size} existing documents`);
    
    return {
      products: productsSnapshot.size,
      coupons: couponsSnapshot.size,
      configuration: configSnapshot.size
    };
  } catch (error) {
    console.error('❌ Error checking existing data:', error.message);
    return null;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🏆 All Pro Sports - Production Firebase Population');
  console.log('='.repeat(60));
  console.log(`📍 Target: ${firebaseConfig.projectId}`);
  console.log('='.repeat(60));
  
  // Check existing data
  const existingData = await checkExistingData();
  
  if (existingData && (existingData.products > 0 || existingData.coupons > 0)) {
    console.log('\n⚠️  WARNING: Database already contains data!');
    console.log('This script will ADD new documents without removing existing ones.');
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('\n🚀 Starting population process...');
  
  const results = {
    products: 0,
    coupons: 0,
    configuration: 0
  };
  
  // Populate each collection
  results.products = await populateProducts();
  results.coupons = await populateCoupons();
  results.configuration = await populateRegistrationConfig();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 POPULATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Products added: ${results.products}`);
  console.log(`✅ Coupons added: ${results.coupons}`);
  console.log(`✅ Configuration added: ${results.configuration}`);
  
  const total = results.products + results.coupons + results.configuration;
  console.log(`\n🎉 Total: ${total} documents added to production Firebase!`);
  
  console.log('\n📍 Next Steps:');
  console.log('   1. Visit your pricing page to see the products');
  console.log('   2. Test coupon codes in the checkout process');
  console.log('   3. Verify registration form has dropdown options');
  console.log('   4. Check admin panel for data management');
  
  console.log('\n✅ Production database population complete!');
}

// Run the script
main()
  .then(() => {
    console.log('\n🏁 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
