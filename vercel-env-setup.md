# 🚀 URGENT: Fix Vercel Pricing Plans Issue

## ❌ Current Problem
Your pricing plans load perfectly on localhost but show "How to add pricing plans" message on Vercel because **Firebase environment variables are missing**.

## ✅ Quick Fix (5 minutes)

### Step 1: Get Your Firebase Config
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **dewaynedraftkings**
3. Click Settings (⚙️) → Project Settings
4. Scroll to "Your apps" → Click your web app
5. Copy the config values from `firebaseConfig`

### Step 2: Add to Vercel
Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add these **EXACT** variables:

```bash
# Firebase Configuration (REQUIRED - Copy from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your_actual_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dewaynedraftkings.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dewaynedraftkings
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dewaynedraftkings.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Stripe Configuration (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Admin Authentication (REQUIRED)
JWT_SECRET=your_secure_random_string_here
```

### Step 3: Redeploy
After adding variables, **redeploy** your Vercel app (it will auto-deploy when you push to GitHub).

## 🔧 Alternative: Use Setup Script

Run this in your project directory:
```bash
node scripts/setup-vercel-env.js
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
