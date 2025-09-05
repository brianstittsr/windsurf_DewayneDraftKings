# Firebase Configuration Guide for DraftKings SMS System

## Required Environment Variables

Your `.env.local` file should contain the following Firebase configuration variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyC..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="draftkings-sms.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="draftkings-sms"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="draftkings-sms.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:abc123def456"

# Optional: Firebase Emulator for Development
USE_FIREBASE_EMULATOR=false
```

## How to Get Firebase Configuration Values

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `draftkings-sms`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Get Configuration Values
1. In Firebase Console, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app icon (`</>`)
4. Enter app nickname: `DraftKings SMS App`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the configuration object values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",           // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "project.firebaseapp.com",  // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "project-id",        // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "project.appspot.com",   // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789", // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc123"      // → NEXT_PUBLIC_FIREBASE_APP_ID
};
```

### 3. Enable Required Services

#### Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select location (us-central1 recommended)
5. Click "Done"

#### Authentication (Optional for Phase 1)
1. Go to "Authentication" → "Sign-in method"
2. Enable desired providers (Email/Password, Google, etc.)

#### Storage (Optional for Phase 1)
1. Go to "Storage" → "Get started"
2. Choose "Start in test mode"
3. Select same location as Firestore

## Environment Variable Reference

Based on your `.env.local.example` file, here's the complete configuration:

```bash
# Firebase Configuration (REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Twilio SMS (REQUIRED for SMS functionality)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# NextAuth.js (Optional for Phase 1)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Development Options
USE_FIREBASE_EMULATOR=false
NODE_ENV=development
```

## Firebase Security Rules

### Firestore Rules (Development)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to SMS collections for development
    match /sms_subscribers/{document} {
      allow read, write: if true;
    }
    match /sms_messages/{document} {
      allow read, write: if true;
    }
    match /sms_journeys/{document} {
      allow read, write: if true;
    }
    match /sms_analytics/{document} {
      allow read, write: if true;
    }
  }
}
```

### Storage Rules (Development)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## Testing Firebase Connection

### 1. Check Configuration
```bash
npm run dev
```
Look for console messages:
- ✅ "Firebase initialized successfully"
- ❌ "Missing Firebase environment variables: [...]"

### 2. Test Firestore Connection
Create a test API endpoint:

```typescript
// app/api/test-firebase/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }
    
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Firebase connection successful',
      timestamp: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      docId: testDoc.id,
      message: 'Firebase connected successfully'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Firebase connection failed',
      details: error.message 
    }, { status: 500 });
  }
}
```

Visit: `http://localhost:3000/api/test-firebase`

## Common Issues and Solutions

### Issue 1: "Firebase configuration incomplete"
**Solution**: Check that all environment variables are set in `.env` file

### Issue 2: "Permission denied" errors
**Solution**: Update Firestore security rules to allow read/write access

### Issue 3: "Project not found"
**Solution**: Verify `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches your Firebase project ID

### Issue 4: Undici module errors
**Solution**: Already fixed in `next.config.js` with webpack configuration

## Production Considerations

### Security Rules
Update Firestore rules for production:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sms_subscribers/{document} {
      allow read, write: if request.auth != null;
    }
    // Add specific rules for each collection
  }
}
```

### Environment Variables
- Use Firebase project secrets for production
- Set up separate Firebase projects for dev/staging/production
- Never commit `.env` files to version control

## Next Steps

1. Create Firebase project
2. Copy configuration values to `.env`
3. Create your `.env.local` file with actual values:
```bash
# Copy from .env.local.example and replace with real values
cp .env.local.example .env.local
```
4. Test connection with `/api/test-firebase`
5. Enable Firestore and set security rules
6. Test SMS registration functionality
