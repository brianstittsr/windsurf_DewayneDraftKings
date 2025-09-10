# Stripe Payment Integration - Deployment Setup Guide

## Overview
This guide covers the complete setup process for deploying the All Pro Sports application with Stripe payment integration.

## Required Environment Variables

### Stripe Configuration
You need to obtain these values from your Stripe Dashboard (https://dashboard.stripe.com):

```bash
# Stripe Keys (Required)
STRIPE_SECRET_KEY="sk_test_..." # or sk_live_... for production
STRIPE_PUBLISHABLE_KEY="pk_test_..." # or pk_live_... for production
STRIPE_WEBHOOK_SECRET="whsec_..." # Generated when creating webhook endpoint
```

### How to Get Stripe Keys

#### 1. Secret and Publishable Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy the **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Click "Reveal test key" to copy the **Secret key** (starts with `sk_test_` or `sk_live_`)

#### 2. Webhook Secret
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `https://your-domain.com/api/payments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

## Deployment Steps

### 1. Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all required Stripe variables
   - Set for Production, Preview, and Development environments

### 2. Local Development Setup
1. Copy `.env.local.example` to `.env.local`
2. Fill in your Stripe test keys:
```bash
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

### 3. Testing the Integration

#### Test Payment Flow
1. Start development server: `npm run dev`
2. Navigate to registration page: `http://localhost:3000/register`
3. Fill out registration form
4. Complete payment with Stripe test card: `4242 4242 4242 4242`
5. Verify success page displays payment confirmation

#### Test Webhook (Local Development)
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/payments/webhook`
4. Copy the webhook signing secret from CLI output
5. Update `.env.local` with the webhook secret

## Payment Flow Architecture

### 1. Registration → Payment
- User fills registration form (`/register`)
- Form data encoded and passed to payment page (`/payment/[playerId]`)
- Payment page creates Stripe checkout session
- User redirected to Stripe-hosted checkout

### 2. Payment Processing
- Stripe processes payment
- Webhook receives `checkout.session.completed` event
- Payment success triggers user redirect to `/payment/success`
- Success page verifies session and displays confirmation

### 3. API Endpoints
- `POST /api/payments/create-checkout` - Creates Stripe checkout session
- `POST /api/payments/webhook` - Handles Stripe webhook events
- `GET /api/payments/verify-session` - Verifies payment session status

## Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use different keys for test/production environments
- Rotate webhook secrets periodically

### Webhook Security
- Webhook endpoint verifies Stripe signature
- Only processes events from verified sources
- Logs all webhook events for audit trail

## Troubleshooting

### Common Issues

#### 1. "No such checkout session"
- Verify `STRIPE_SECRET_KEY` is correct
- Check session ID format in URL parameters

#### 2. "Invalid webhook signature"
- Verify `STRIPE_WEBHOOK_SECRET` matches endpoint
- Check webhook endpoint URL is correct

#### 3. "Payment processing failed"
- Check Stripe dashboard for error details
- Verify all required environment variables are set

### Debug Steps
1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Check Stripe dashboard for webhook delivery status
4. Verify environment variables are loaded correctly

## Production Checklist

- [ ] Stripe live keys configured in production environment
- [ ] Webhook endpoint created with production URL
- [ ] SSL certificate installed (required for webhooks)
- [ ] Error monitoring configured
- [ ] Payment success/failure email notifications set up
- [ ] Database integration for storing payment records
- [ ] Backup webhook endpoint configured

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For application issues:
- Check server logs and browser console
- Verify environment variable configuration
- Test with Stripe test cards before going live
