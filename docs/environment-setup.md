# Environment Setup Guide

## Required Environment Variables for Payment Processing

To fix the "Stripe Configuration Missing" error, you need to add the following environment variables:

### 1. Create .env.local file

Create a `.env.local` file in the root directory with the following variables:

```bash
# Stripe Configuration (Required for payments)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"

# Firebase Configuration (Required for data storage)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

### 2. Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers > API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### 3. For Production (Vercel)

Add the same environment variables to your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add each variable with the same names and values

### 4. Restart Development Server

After adding environment variables:

```bash
npm run dev
```

## Testing Payment Flow

1. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Declined**: `4000 0000 0000 0002`
   - **Requires Authentication**: `4000 0025 0000 3155`

2. Use any future expiry date (e.g., 12/34)
3. Use any 3-digit CVC (e.g., 123)
4. Use any ZIP code (e.g., 12345)

## Common Issues

### "Stripe Configuration Missing"
- Make sure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set (note the `NEXT_PUBLIC_` prefix)
- Restart your development server after adding variables

### "Payment processing unavailable"
- Make sure `STRIPE_SECRET_KEY` is set in your environment
- Check that the key starts with `sk_test_` for test mode

### Firebase Errors
- Ensure all Firebase environment variables are set
- Check that your Firebase project is properly configured
