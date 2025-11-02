import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK for server-side operations
let adminApp: any = null;
let adminDb: any = null;

export function getAdminApp() {
  if (adminApp) {
    return adminApp;
  }

  try {
    // Check if already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0];
      console.log('Using existing Firebase Admin app');
      return adminApp;
    }

    // For Vercel deployment, we can use the client SDK config
    // since we're allowing public read access in Firestore rules
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      console.error('NEXT_PUBLIC_FIREBASE_PROJECT_ID not found in environment');
      throw new Error('Firebase Project ID not found');
    }

    console.log('Initializing Firebase Admin with projectId:', projectId);

    // Initialize with minimal config for server-side operations
    // Don't use a name to avoid conflicts
    adminApp = initializeApp({
      projectId: projectId,
    });

    console.log('Firebase Admin initialized successfully');
    return adminApp;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return null;
  }
}

export function getAdminDb() {
  if (adminDb) {
    return adminDb;
  }

  try {
    const app = getAdminApp();
    if (!app) {
      return null;
    }

    adminDb = getFirestore(app);
    console.log('Firebase Admin Firestore initialized');
    return adminDb;
  } catch (error) {
    console.error('Error initializing Admin Firestore:', error);
    return null;
  }
}

export { adminApp, adminDb };
