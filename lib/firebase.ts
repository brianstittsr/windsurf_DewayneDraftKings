import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummy",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dewaynedraftkings.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dewaynedraftkings",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dewaynedraftkings.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:dummy",
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  
  if (missingKeys.length > 0) {
    console.warn('Missing Firebase environment variables:', missingKeys);
    // For development, allow minimal config with just project ID
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.log('Using minimal Firebase config for development');
      return true;
    }
    return false;
  }
  
  return true;
};

// Initialize Firebase app (prevent multiple initialization)
let app;

// Initialize Firebase app
try {
  if (!getApps().length) {
    if (validateFirebaseConfig()) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    } else {
      console.error('Firebase configuration incomplete');
      throw new Error('Firebase configuration incomplete');
    }
  } else {
    app = getApps()[0];
  }
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  app = null;
}

// Initialize Firebase services with error handling
let db, auth, storage;

if (app) {
  try {
    // Initialize Firestore
    db = getFirestore(app);
    
    // Initialize Auth
    auth = getAuth(app);
    
    // Initialize Storage
    storage = getStorage(app);
    
    // Connect to emulators in development if configured
    if (process.env.NODE_ENV === 'development' && process.env.USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('Connected to Firebase emulators');
      } catch (error) {
        console.log('Firebase emulators not available or already connected');
      }
    }
    
    console.log('Firebase services initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
    db = null;
    auth = null;
    storage = null;
  }
} else {
  console.error('Firebase app not available - services will be null');
  db = null;
  auth = null;
  storage = null;
}

// Export services
export { db, auth, storage };
export default app;
