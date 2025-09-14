# Vercel Deployment Guide

## Environment Variables Setup

To fix the 500 error on coupon validation, you need to configure Firebase environment variables in your Vercel project.

### Required Environment Variables

Add these environment variables in your Vercel project dashboard:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dewaynedraftkings.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dewaynedraftkings
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dewaynedraftkings.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Base URL (set to your Vercel domain)
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with the appropriate value
5. Make sure to set them for **Production**, **Preview**, and **Development** environments
6. Redeploy your application after adding the variables

### Firebase Configuration Values

You can find these values in your Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`dewaynedraftkings`)
3. Go to **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Click on the web app to see the config object

### Stripe Configuration Values

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Developers** → **API keys**
3. Copy the **Publishable key** and **Secret key**
4. Use **test keys** for development/staging, **live keys** for production

### Troubleshooting

If you still get 500 errors after setting environment variables:

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on the failing function to see detailed logs

2. **Verify Environment Variables:**
   - In Vercel Dashboard → Settings → Environment Variables
   - Make sure all required variables are set and have correct values

3. **Redeploy:**
   - After adding environment variables, trigger a new deployment
   - Environment variables only take effect after redeployment

### Testing the Fix

After deployment, test the coupon validation:

1. Go to your Vercel-deployed site
2. Navigate to checkout with a plan selected
3. Enter coupon code `SAVE100`
4. Click "APPLY"
5. Should see discount applied without 500 error

### Common Issues

- **Missing Firebase Project ID**: Most critical - without this, Firebase won't initialize
- **Wrong Stripe Keys**: Make sure you're using the correct environment (test vs live)
- **CORS Issues**: Ensure `NEXT_PUBLIC_BASE_URL` matches your actual domain
- **Case Sensitivity**: Environment variable names are case-sensitive

### Environment Variable Template

Copy this template and fill in your actual values:

```bash
# Copy these to Vercel Environment Variables
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dewaynedraftkings.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dewaynedraftkings
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dewaynedraftkings.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```
