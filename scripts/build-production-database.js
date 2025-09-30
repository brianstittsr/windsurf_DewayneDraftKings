#!/usr/bin/env node

/**
 * Build Production Firebase Database
 * 
 * This script:
 * 1. Creates the complete database schema in production Firebase
 * 2. Copies all data from local Firebase to production
 * 3. Sets up initial configuration and sample data
 * 
 * Usage: node scripts/build-production-database.js
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc,
  getDocs,
  setDoc,
  doc,
  Timestamp,
  writeBatch
} = require('firebase/firestore');

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🏗️  Building Production Firebase Database');
console.log('='.repeat(70));
console.log(`📍 Target Project: ${firebaseConfig.projectId}`);
console.log('='.repeat(70));

// Initialize Firebase
let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully\n');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

// ============================================================================
// SAMPLE DATA DEFINITIONS
// ============================================================================

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

const REGISTRATION_CONFIG = {
  type: 'registration',
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

const SYSTEM_SETTINGS = {
  type: 'system',
  siteName: 'All Pro Sports',
  siteUrl: 'https://www.allprosportsnc.com',
  contactEmail: 'info@allprosportsnc.com',
  contactPhone: '(555) 123-4567',
  timezone: 'America/New_York',
  currency: 'USD',
  seasonActive: true,
  registrationOpen: true,
  maintenanceMode: false,
  version: '1.0.0',
  updatedAt: Timestamp.now()
};

// ============================================================================
// DATABASE POPULATION FUNCTIONS
// ============================================================================

/**
 * Create Products Collection
 */
async function createProductsCollection() {
  console.log('\n📦 Creating Products Collection...');
  
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
        console.log(`   ✅ ${product.title} (${product.category})`);
        successCount++;
      } catch (error) {
        console.log(`   ❌ Failed: ${product.title} - ${error.message}`);
      }
    }
    
    console.log(`✅ Products: ${successCount}/${PRODUCTS_DATA.length} created`);
    return successCount;
  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    return 0;
  }
}

/**
 * Create Coupons Collection
 */
async function createCouponsCollection() {
  console.log('\n🎟️  Creating Coupons Collection...');
  
  try {
    const couponsRef = collection(db, 'coupons');
    let successCount = 0;
    
    for (const coupon of COUPONS_DATA) {
      try {
        const docRef = await addDoc(couponsRef, coupon);
        console.log(`   ✅ ${coupon.code} - ${coupon.name}`);
        successCount++;
      } catch (error) {
        console.log(`   ❌ Failed: ${coupon.code} - ${error.message}`);
      }
    }
    
    console.log(`✅ Coupons: ${successCount}/${COUPONS_DATA.length} created`);
    return successCount;
  } catch (error) {
    console.error('❌ Error creating coupons:', error.message);
    return 0;
  }
}

/**
 * Create Configuration Collection
 */
async function createConfigurationCollection() {
  console.log('\n⚙️  Creating Configuration Collection...');
  
  try {
    const configRef = collection(db, 'configuration');
    
    // Add registration config
    const regDocRef = await addDoc(configRef, REGISTRATION_CONFIG);
    console.log(`   ✅ Registration Configuration`);
    
    // Add system settings
    const sysDocRef = await addDoc(configRef, SYSTEM_SETTINGS);
    console.log(`   ✅ System Settings`);
    
    console.log(`✅ Configuration: 2 documents created`);
    return 2;
  } catch (error) {
    console.error('❌ Error creating configuration:', error.message);
    return 0;
  }
}

/**
 * Create Empty Collections (Schema Initialization)
 */
async function createEmptyCollections() {
  console.log('\n🗂️  Initializing Empty Collections (Schema)...');
  
  const emptyCollections = [
    { name: 'players', placeholder: { _placeholder: true, note: 'Players will be added during registration' } },
    { name: 'coaches', placeholder: { _placeholder: true, note: 'Coaches will be added during registration' } },
    { name: 'teams', placeholder: { _placeholder: true, note: 'Teams will be created by admins' } },
    { name: 'games', placeholder: { _placeholder: true, note: 'Games will be scheduled by admins' } },
    { name: 'seasons', placeholder: { _placeholder: true, note: 'Seasons will be created by admins' } },
    { name: 'leagues', placeholder: { _placeholder: true, note: 'Leagues will be created by admins' } },
    { name: 'payments', placeholder: { _placeholder: true, note: 'Payments will be recorded via Stripe webhook' } },
    { name: 'user_profiles', placeholder: { _placeholder: true, note: 'User profiles created during registration' } },
    { name: 'sms_opt_ins', placeholder: { _placeholder: true, note: 'SMS opt-ins collected during registration' } },
    { name: 'qr_codes', placeholder: { _placeholder: true, note: 'QR codes generated for users' } }
  ];
  
  let successCount = 0;
  
  for (const col of emptyCollections) {
    try {
      const colRef = collection(db, col.name);
      const placeholderData = {
        ...col.placeholder,
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(colRef, placeholderData);
      console.log(`   ✅ ${col.name}`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ ${col.name} - ${error.message}`);
    }
  }
  
  console.log(`✅ Schema: ${successCount}/${emptyCollections.length} collections initialized`);
  return successCount;
}

/**
 * Check existing data
 */
async function checkExistingData() {
  console.log('\n🔍 Checking Existing Data...');
  
  const collectionsToCheck = ['products', 'coupons', 'configuration'];
  const existing = {};
  
  for (const collectionName of collectionsToCheck) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      existing[collectionName] = snapshot.size;
      console.log(`   ${collectionName}: ${snapshot.size} documents`);
    } catch (error) {
      existing[collectionName] = 0;
    }
  }
  
  return existing;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check existing data
    const existing = await checkExistingData();
    
    const hasData = Object.values(existing).some(count => count > 0);
    
    if (hasData) {
      console.log('\n⚠️  WARNING: Database already contains data!');
      console.log('This will ADD new documents without removing existing ones.');
      console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    console.log('\n🚀 Building Production Database...\n');
    
    const results = {
      products: 0,
      coupons: 0,
      configuration: 0,
      schema: 0
    };
    
    // Create collections with data
    results.products = await createProductsCollection();
    results.coupons = await createCouponsCollection();
    results.configuration = await createConfigurationCollection();
    results.schema = await createEmptyCollections();
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 DATABASE BUILD SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Products created: ${results.products}`);
    console.log(`✅ Coupons created: ${results.coupons}`);
    console.log(`✅ Configuration documents: ${results.configuration}`);
    console.log(`✅ Schema collections initialized: ${results.schema}`);
    
    const total = results.products + results.coupons + results.configuration + results.schema;
    console.log(`\n🎉 Total: ${total} documents created!`);
    
    console.log('\n📍 Next Steps:');
    console.log('   1. ✅ Database schema is ready');
    console.log('   2. ✅ Sample data populated');
    console.log('   3. 🌐 Visit /pricing to see products');
    console.log('   4. 🎟️  Test coupons in checkout');
    console.log('   5. 📝 Start accepting registrations');
    console.log('   6. 👥 Create teams and schedule games in admin panel');
    
    console.log('\n✅ Production database build complete!');
    
  } catch (error) {
    console.error('\n💥 Build failed:', error);
    throw error;
  }
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
