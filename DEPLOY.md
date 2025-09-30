# Deployment Instructions

## Fix Vercel Build Issues

If you encounter "Unexpected identifier" errors on Vercel, follow these steps:

### 1. Clear Vercel Cache
```bash
# In Vercel dashboard:
# Settings → General → Clear Cache
```

### 2. Redeploy
```bash
git add .
git commit -m "Fix Vercel build configuration"
git push origin main
```

### 3. Force Clean Build
In Vercel dashboard, go to your deployment and click "Redeploy" with the option to clear build cache.

## Changes Made to Fix Build Issues

1. **Enabled SWC Minify** - Changed `swcMinify: false` to `swcMinify: true`
2. **Added Standalone Output** - Optimizes production builds
3. **Disabled Source Maps** - Reduces build size and prevents corruption
4. **Created .vercelignore** - Excludes test scripts from deployment

## Environment Variables Required on Vercel

Make sure these are set in Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
EMAIL_HOST
EMAIL_PORT
EMAIL_SECURE
EMAIL_USER
EMAIL_PASS
EMAIL_FROM
NEXT_PUBLIC_BASE_URL
```

## Troubleshooting

### Build Still Failing?

1. **Check Vercel Logs** - Look for the exact error in build logs
2. **Verify Environment Variables** - All Firebase vars must be set
3. **Try Manual Redeploy** - Sometimes Vercel needs a fresh build
4. **Check Node Version** - Ensure Vercel is using Node 18+

### API Routes Returning 500?

1. **Check Firebase Connection** - Verify credentials in Vercel env vars
2. **Check Firestore Rules** - Ensure rules allow read/write
3. **Check API Logs** - View function logs in Vercel dashboard
