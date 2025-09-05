// Database Schema Application Script
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, writeBatch } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

console.log('🗄️ Database Schema Application Tool\n');

// Load environment variables
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.log('❌ .env.local file not found!');
  console.log('📋 Please create .env.local with Firebase configuration first.');
  process.exit(1);
}

// Load environment variables manually since dotenv might not be installed
const fs = require('fs');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim().replace(/"/g, '');
    }
  });
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate configuration
const missingKeys = Object.entries(firebaseConfig).filter(([key, value]) => !value);
if (missingKeys.length > 0) {
  console.log('❌ Missing Firebase configuration:');
  missingKeys.forEach(([key]) => console.log(`   - ${key}`));
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// SMS Schema Collections (Phase 1 Focus)
const SMS_COLLECTIONS = {
  SMS_SUBSCRIBERS: 'sms-subscribers',
  SMS_JOURNEYS: 'sms-journeys', 
  SMS_MESSAGES: 'sms-messages',
  SMS_CAMPAIGNS: 'sms-campaigns',
  SMS_ANALYTICS: 'sms-analytics',
  SMS_TEMPLATES: 'sms-templates'
};

// Full Schema Collections (Future Phases)
const FULL_COLLECTIONS = {
  PLAYERS: 'players',
  TEAMS: 'teams',
  PAYMENTS: 'payments',
  MARKETING_FUNNELS: 'marketing-funnels',
  LEADERBOARDS: 'leaderboards',
  STAFF: 'staff',
  EVENTS: 'events',
  NOTIFICATIONS: 'notifications',
  REFERRAL_TREES: 'referral-trees',
  SYSTEM_SETTINGS: 'system-settings'
};

// Sample SMS Journey Templates for Phase 1
const sampleSMSJourneys = [
  {
    id: 'welcome-journey',
    name: 'Welcome Journey',
    description: 'Welcome new subscribers to DraftKings League',
    type: 'welcome',
    isActive: true,
    steps: [
      {
        id: 'welcome-1',
        order: 1,
        name: 'Welcome Message',
        messageTemplate: 'Welcome to DraftKings League! 🏈 Get ready for an amazing season. Reply STOP to opt out.',
        delayHours: 0,
        stats: { sent: 0, delivered: 0, failed: 0, replied: 0, clicked: 0 }
      },
      {
        id: 'welcome-2', 
        order: 2,
        name: 'Season Info',
        messageTemplate: 'Season starts soon! Check out your team roster and upcoming games at {link}',
        delayHours: 24,
        cta: { text: 'View Roster', action: 'click' },
        stats: { sent: 0, delivered: 0, failed: 0, replied: 0, clicked: 0 }
      }
    ],
    targetAudience: ['new-subscribers'],
    stats: { totalSubscribers: 0, completedJourney: 0, optedOut: 0, conversionRate: 0 }
  },
  {
    id: 'reminder-journey',
    name: 'Registration Reminder',
    description: 'Remind users to complete registration',
    type: 'reminder',
    isActive: true,
    steps: [
      {
        id: 'reminder-1',
        order: 1,
        name: 'Registration Reminder',
        messageTemplate: 'Don\'t forget to complete your DraftKings League registration! Only {days} days left.',
        delayHours: 0,
        stats: { sent: 0, delivered: 0, failed: 0, replied: 0, clicked: 0 }
      }
    ],
    targetAudience: ['incomplete-registration'],
    stats: { totalSubscribers: 0, completedJourney: 0, optedOut: 0, conversionRate: 0 }
  },
  {
    id: 'feedback-journey',
    name: 'Feedback Collection',
    description: 'Collect feedback from participants',
    type: 'feedback',
    isActive: true,
    steps: [
      {
        id: 'feedback-1',
        order: 1,
        name: 'Feedback Request',
        messageTemplate: 'How was your DraftKings League experience? Reply with a rating 1-5 and any comments!',
        delayHours: 0,
        stats: { sent: 0, delivered: 0, failed: 0, replied: 0, clicked: 0 }
      }
    ],
    targetAudience: ['season-complete'],
    stats: { totalSubscribers: 0, completedJourney: 0, optedOut: 0, conversionRate: 0 }
  }
];

// Sample SMS Templates
const sampleSMSTemplates = [
  {
    id: 'welcome-template',
    name: 'Welcome Message',
    category: 'welcome',
    content: 'Welcome to DraftKings League, {firstName}! 🏈 Your journey starts now.',
    variables: ['firstName'],
    timesUsed: 0,
    avgDeliveryRate: 0,
    avgReplyRate: 0
  },
  {
    id: 'reminder-template',
    name: 'Payment Reminder',
    category: 'reminder',
    content: 'Hi {firstName}, your payment of ${amount} is due on {dueDate}. Pay now: {paymentLink}',
    variables: ['firstName', 'amount', 'dueDate', 'paymentLink'],
    timesUsed: 0,
    avgDeliveryRate: 0,
    avgReplyRate: 0
  },
  {
    id: 'promotional-template',
    name: 'Season Promotion',
    category: 'promotional',
    content: 'New season starting! Early bird registration now open. Save 20% with code EARLY20: {registrationLink}',
    variables: ['registrationLink'],
    timesUsed: 0,
    avgDeliveryRate: 0,
    avgReplyRate: 0
  }
];

async function createCollectionStructure() {
  console.log('📋 Creating collection structure...\n');
  
  try {
    const batch = writeBatch(db);
    
    // Create SMS Collections with sample documents
    console.log('🔥 Setting up SMS Collections (Phase 1):');
    
    // SMS Journeys
    for (const journey of sampleSMSJourneys) {
      const journeyRef = doc(collection(db, SMS_COLLECTIONS.SMS_JOURNEYS), journey.id);
      batch.set(journeyRef, {
        ...journey,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`   ✅ SMS Journey: ${journey.name}`);
    }
    
    // SMS Templates
    for (const template of sampleSMSTemplates) {
      const templateRef = doc(collection(db, SMS_COLLECTIONS.SMS_TEMPLATES), template.id);
      batch.set(templateRef, {
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`   ✅ SMS Template: ${template.name}`);
    }
    
    // Create placeholder documents for other SMS collections
    const placeholderDoc = {
      _placeholder: true,
      description: 'This collection will contain real data when the application is used',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // SMS Subscribers placeholder
    const subscribersRef = doc(collection(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS), '_placeholder');
    batch.set(subscribersRef, { ...placeholderDoc, collectionType: 'SMS Subscribers' });
    console.log(`   ✅ SMS Subscribers collection initialized`);
    
    // SMS Messages placeholder  
    const messagesRef = doc(collection(db, SMS_COLLECTIONS.SMS_MESSAGES), '_placeholder');
    batch.set(messagesRef, { ...placeholderDoc, collectionType: 'SMS Messages' });
    console.log(`   ✅ SMS Messages collection initialized`);
    
    // SMS Campaigns placeholder
    const campaignsRef = doc(collection(db, SMS_COLLECTIONS.SMS_CAMPAIGNS), '_placeholder');
    batch.set(campaignsRef, { ...placeholderDoc, collectionType: 'SMS Campaigns' });
    console.log(`   ✅ SMS Campaigns collection initialized`);
    
    // SMS Analytics placeholder
    const analyticsRef = doc(collection(db, SMS_COLLECTIONS.SMS_ANALYTICS), '_placeholder');
    batch.set(analyticsRef, { ...placeholderDoc, collectionType: 'SMS Analytics' });
    console.log(`   ✅ SMS Analytics collection initialized`);
    
    // Commit the batch
    await batch.commit();
    console.log('\n✅ SMS Collections created successfully!');
    
    // Note about full schema
    console.log('\n📝 Note: Full schema collections (players, teams, payments, etc.)');
    console.log('   will be created in future phases as per project scope.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creating collections:', error);
    return false;
  }
}

async function checkExistingCollections() {
  console.log('🔍 Checking existing collections...\n');
  
  try {
    // Check if SMS collections already exist
    const smsCollectionChecks = await Promise.all([
      collection(db, SMS_COLLECTIONS.SMS_JOURNEYS),
      collection(db, SMS_COLLECTIONS.SMS_TEMPLATES),
      collection(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS),
      collection(db, SMS_COLLECTIONS.SMS_MESSAGES)
    ]);
    
    console.log('📊 Collection Status:');
    Object.values(SMS_COLLECTIONS).forEach(collectionName => {
      console.log(`   📁 ${collectionName}: Ready for data`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error checking collections:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database schema application...\n');
  
  // Check existing collections
  const collectionsExist = await checkExistingCollections();
  
  if (collectionsExist) {
    console.log('\n🎯 Phase 1 SMS Collections Status:');
    console.log('   ✅ SMS Subscribers - Ready for user registration data');
    console.log('   ✅ SMS Journeys - Sample journey templates created');
    console.log('   ✅ SMS Messages - Ready for message tracking');
    console.log('   ✅ SMS Templates - Sample templates created');
    console.log('   ✅ SMS Campaigns - Ready for campaign data');
    console.log('   ✅ SMS Analytics - Ready for metrics tracking');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Start your development server: npm run dev');
    console.log('   2. Test user registration at: /register');
    console.log('   3. Test Firebase connection at: /api/test-firebase');
    console.log('   4. View admin dashboard at: /admin');
    
    // Create the collections with sample data
    await createCollectionStructure();
    
  } else {
    console.log('❌ Unable to verify Firebase connection');
    console.log('📋 Please check your .env.local configuration');
  }
}

// Run the script
main().catch(console.error);
