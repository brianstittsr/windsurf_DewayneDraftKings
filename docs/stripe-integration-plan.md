# Stripe Payment Integration Plan

## Overview
Integration of Stripe payment processing with the DraftKings League system to handle all payment plans, subscriptions, and user billing.

## Payment Plans Structure

### 1. Meal Plans
- **Product**: Meal Plan Subscription
- **Setup Fee**: $25 (one-time)
- **Recurring**: $10/month
- **Stripe Implementation**: Product with setup fee + recurring subscription

### 2. Fitness Classes
- **Yoga**: 
  - Daily: $10 per session (one-time payment)
  - Monthly: $20/month (recurring subscription)
- **Zumba**: 
  - Daily: $10 per session (one-time payment)  
  - Monthly: $20/month (recurring subscription)
- **Stripe Implementation**: Separate products for daily vs monthly options

### 3. Sports Leagues
- **Flag Football**:
  - Jersey Fee: $25 (one-time)
  - Registration Fee: $59 (one-time)
  - Setup Fee: $3 (one-time)
  - **Total**: $87 (combined one-time payment)
- **Stripe Implementation**: Single product with combined pricing

### 4. Group Personal Training (7-15 people)
- **1 Session/Week**: $25 setup + $109/month (3-6 month commitment)
- **2 Sessions/Week**: $25 setup + $209/month (3-6 month commitment)
- **3 Sessions/Week**: $25 setup + $359/month (3-6 month commitment)
- **Stripe Implementation**: Products with setup fees + recurring subscriptions with minimum commitment periods

### 5. Semi-Private Personal Training (4-6 people)
- **1 Session/Week**: $180/month ($45/session × 4)
- **2 Sessions/Week**: $320/month ($40/session × 8)
- **3 Sessions/Week**: $420/month ($35/session × 12)
- **Stripe Implementation**: Monthly subscription products with different pricing tiers

## Technical Architecture

### Database Schema Extensions

```typescript
// User Payment Information
interface UserPayment {
  id: string;
  userId: string;
  stripeCustomerId: string;
  paymentMethods: PaymentMethod[];
  subscriptions: Subscription[];
  oneTimePayments: OneTimePayment[];
  createdAt: Date;
  updatedAt: Date;
}

interface Subscription {
  id: string;
  stripeSubscriptionId: string;
  productType: 'meal_plan' | 'yoga_monthly' | 'zumba_monthly' | 'group_training' | 'semi_private';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  setupFeeId?: string; // Reference to one-time setup payment
  commitmentEndDate?: Date; // For training programs with minimum commitment
  metadata: Record<string, any>;
}

interface OneTimePayment {
  id: string;
  stripePaymentIntentId: string;
  productType: 'yoga_daily' | 'zumba_daily' | 'flag_football' | 'setup_fee';
  amount: number;
  status: 'succeeded' | 'failed' | 'pending';
  paidAt?: Date;
  metadata: Record<string, any>;
}
```

### Stripe Product Configuration

```typescript
// Stripe Products Setup
const STRIPE_PRODUCTS = {
  // Meal Plans
  meal_plan: {
    name: 'Meal Plan Subscription',
    setupFee: 2500, // $25.00 in cents
    recurringPrice: 1000, // $10.00 in cents
    interval: 'month'
  },
  
  // Fitness Classes
  yoga_daily: {
    name: 'Yoga - Single Session',
    price: 1000 // $10.00 in cents
  },
  yoga_monthly: {
    name: 'Yoga - Monthly Unlimited',
    price: 2000, // $20.00 in cents
    interval: 'month'
  },
  
  // Sports Leagues
  flag_football: {
    name: 'Flag Football Registration',
    price: 8700 // $87.00 total (25+59+3)
  },
  
  // Group Training
  group_training_1x: {
    name: 'Group Personal Training - 1x/week',
    setupFee: 2500,
    recurringPrice: 10900,
    interval: 'month',
    minimumCommitment: 3
  },
  
  // Semi-Private Training
  semi_private_1x: {
    name: 'Semi-Private Training - 1x/week',
    price: 18000, // $180.00
    interval: 'month',
    minimumCommitment: 3
  }
};
```

## API Endpoints

### Payment Processing
```typescript
// POST /api/payments/create-subscription
// POST /api/payments/create-one-time
// POST /api/payments/cancel-subscription
// GET /api/payments/user-subscriptions
// POST /api/payments/update-payment-method
```

### Webhook Handling
```typescript
// POST /api/webhooks/stripe
// Handle: subscription updates, payment failures, cancellations
```

## User Interface Components

### Payment Plan Selection
- Grid layout showing all available plans
- Clear pricing display with setup fees
- Subscription vs one-time payment indicators
- Commitment period warnings for training programs

### Checkout Flow
1. Plan selection
2. Payment method entry (Stripe Elements)
3. Setup fee + recurring billing confirmation
4. Success/failure handling
5. Email confirmation

### User Dashboard
- Active subscriptions overview
- Payment history
- Upcoming charges
- Cancellation options
- Payment method management

## SMS Integration Triggers

### Payment-Based SMS Journeys
- **Welcome after payment**: Trigger welcome sequence after successful payment
- **Payment failure**: Send payment retry reminders
- **Subscription ending**: Renewal reminders before commitment ends
- **Upsell opportunities**: Suggest additional services based on current subscriptions

### Implementation
```typescript
// Trigger SMS journeys based on payment events
const paymentTriggers = {
  'payment.succeeded': 'welcome_sequence',
  'payment.failed': 'payment_retry',
  'subscription.ending': 'renewal_reminder',
  'subscription.canceled': 'win_back_campaign'
};
```

## Admin Dashboard Features

### Payment Management
- Revenue tracking by product type
- Subscription analytics
- Failed payment monitoring
- Refund processing
- Customer payment history

### Reporting
- Monthly recurring revenue (MRR)
- Customer lifetime value (CLV)
- Churn rate by product
- Setup fee vs recurring revenue breakdown

## Implementation Phases

### Phase 2A: Basic Stripe Integration
- [ ] Stripe account setup and API keys
- [ ] Basic product configuration
- [ ] Simple one-time payment flow
- [ ] User payment method storage

### Phase 2B: Subscription Management
- [ ] Recurring subscription handling
- [ ] Setup fee + subscription combinations
- [ ] Webhook processing
- [ ] Payment failure handling

### Phase 2C: Advanced Features
- [ ] Commitment period enforcement
- [ ] Proration handling
- [ ] Advanced reporting
- [ ] SMS payment triggers

### Phase 2D: Admin Tools
- [ ] Payment management dashboard
- [ ] Revenue analytics
- [ ] Customer support tools
- [ ] Refund processing

## Security Considerations

### PCI Compliance
- Use Stripe Elements for card data collection
- Never store card information directly
- Implement proper webhook signature verification
- Secure API key management

### User Data Protection
- Encrypt sensitive payment metadata
- Implement proper access controls
- Regular security audits
- GDPR compliance for payment data

## Testing Strategy

### Test Scenarios
- Successful payments and subscriptions
- Failed payment handling
- Webhook delivery and processing
- Subscription lifecycle management
- Refund and cancellation flows

### Test Data
- Use Stripe test mode
- Test cards for different scenarios
- Webhook testing with Stripe CLI
- Load testing for high-volume periods

## Go-Live Checklist

### Pre-Launch
- [ ] Stripe account verification
- [ ] Production API keys configured
- [ ] Webhook endpoints tested
- [ ] Payment flows thoroughly tested
- [ ] Admin training completed

### Launch
- [ ] Monitor payment success rates
- [ ] Track webhook delivery
- [ ] Customer support readiness
- [ ] Rollback plan prepared

### Post-Launch
- [ ] Performance monitoring
- [ ] Customer feedback collection
- [ ] Revenue tracking validation
- [ ] Optimization opportunities identification

## Cost Analysis

### Stripe Fees
- 2.9% + 30¢ per successful card charge
- Additional fees for international cards
- Subscription management included
- Webhook delivery included

### Estimated Monthly Processing
- Based on projected user volume and average transaction values
- Factor in setup fees vs recurring charges
- Consider seasonal variations (sports leagues)

## Integration with Existing Systems

### Firebase/Firestore
- Store Stripe customer IDs with user records
- Sync subscription status with user permissions
- Track payment history in Firestore

### SMS System
- Trigger automated journeys based on payment events
- Include payment reminders in existing flows
- Upsell messaging based on current subscriptions

### Admin Dashboard
- Integrate payment metrics with existing analytics
- Add payment management to current admin tools
- Revenue reporting alongside SMS metrics
