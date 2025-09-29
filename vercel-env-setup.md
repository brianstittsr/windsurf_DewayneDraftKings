# Vercel Environment Variables Setup

## Required Firebase Environment Variables

Add these to your Vercel project settings:

```bash
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration (Required for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# JWT Secret (Required for admin auth)
JWT_SECRET=your_jwt_secret_key
```

## How to Add Environment Variables to Vercel:

1. Go to your Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable above
5. Redeploy your application

## How to Get Firebase Config Values:

1. Go to Firebase Console (https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on your web app
6. Copy the config values from the firebaseConfig object

## Debug URLs:

After setting up, test these URLs:

- Environment check: `https://your-app.vercel.app/api/debug/env`
- Products API: `https://your-app.vercel.app/api/products`
- Admin panel: `https://your-app.vercel.app/admin`

## Common Issues:

1. **Products not loading**: Missing Firebase environment variables
2. **Payment errors**: Missing Stripe keys
3. **Admin login fails**: Missing JWT_SECRET
4. **Build fails**: Check that all NEXT_PUBLIC_ variables are set
