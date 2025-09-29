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
      return adminApp;
    }

    // For Vercel deployment, we can use the client SDK config
    // since we're allowing public read access in Firestore rules
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('Firebase Project ID not found');
    }

    // Initialize with minimal config for server-side operations
    adminApp = initializeApp({
      projectId: projectId,
    }, 'admin');

    console.log('Firebase Admin initialized successfully');
    return adminApp;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
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
