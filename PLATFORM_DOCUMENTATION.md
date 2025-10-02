# All Pro Sports NC - Platform Documentation

**Version:** 2.0  
**Last Updated:** October 2, 2025  
**Platform:** Next.js 14 with Firebase & Stripe Integration

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [System Architecture](#system-architecture)
3. [Admin Dashboard](#admin-dashboard)
4. [Payment Processing](#payment-processing)
5. [Coupon System](#coupon-system)
6. [Player Management](#player-management)
7. [GoHighLevel Integration](#gohighlevel-integration)
8. [API Keys Management](#api-keys-management)
9. [Business Operations](#business-operations)
10. [Environment Configuration](#environment-configuration)
11. [Deployment Guide](#deployment-guide)

---

## Platform Overview

All Pro Sports NC is a comprehensive sports league management platform built with modern web technologies. The system handles:

- **Player & Coach Registration** with automated role assignment
- **Payment Processing** via Stripe (Credit Card, Klarna, Affirm)
- **Coupon & Discount Management** with real-time validation
- **Team Management** with player swaps and transfers
- **Marketing Automation** via GoHighLevel integration
- **AI-Powered Workflow Builder** for automated communications
- **Commissioner Compensation** tracking
- **Complete Admin Dashboard** for all operations

### Technology Stack

- **Frontend:** Next.js 14, React, TypeScript, Bootstrap 5
- **Backend:** Next.js API Routes, Server-Side Rendering
- **Database:** Firebase Firestore
- **Payments:** Stripe (Payment Intents, Checkout Sessions, Webhooks)
- **Email:** SendGrid / Nodemailer
- **SMS:** Twilio
- **Marketing:** GoHighLevel API Integration
- **AI:** OpenAI GPT-4 for workflow generation

---

## System Architecture

### Core Collections (Firebase)

```
├── players/                    # Player profiles with registration data
├── coaches/                    # Coach profiles with certifications
├── teams/                      # Team information and rosters
├── payments/                   # Payment records with coupon tracking
├── coupons/                    # Discount coupons and usage tracking
├── user_profiles/              # Unified user profiles
├── player_transfers/           # Player swap history
├── api_keys/                   # Encrypted API keys storage
├── ghl_workflows/              # Saved GoHighLevel workflows
├── gohighlevel_integrations/   # GHL API configurations
├── commissioner_compensation/  # Commissioner payment tracking
├── practice_schedules/         # Practice scheduling
├── failed_payments/            # Payment recovery tracking
├── league_events/              # Event management
└── communication_logs/         # Message history
```

### API Endpoints

#### Registration & Profiles
- `POST /api/registration/create-profile` - Create player/coach profile
- `GET /api/user-profiles` - Fetch all user profiles
- `GET /api/players` - Get all players with full data
- `POST /api/players` - Create new player
- `PUT /api/players` - Update player information
- `DELETE /api/players?id={id}` - Delete player

#### Payments
- `POST /api/payments/create-checkout` - Create Stripe checkout session
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments` - Fetch all payments (includes Stripe data)
- `POST /api/payments/[id]/refund` - Process refund

#### Coupons
- `GET /api/coupons` - Get all coupons
- `POST /api/coupons` - Create new coupon
- `PUT /api/coupons` - Update coupon
- `DELETE /api/coupons` - Delete coupon
- `POST /api/coupons/validate` - Validate coupon code
- `POST /api/coupons/increment-usage` - Increment usage count

#### Player Management
- `POST /api/players/swap` - Swap player between teams
- `GET /api/teams` - Get all teams

#### GoHighLevel
- `GET /api/gohighlevel/integrations` - Get GHL integrations
- `POST /api/gohighlevel/integrations` - Create integration
- `GET /api/ghl/import-workflows` - Import existing workflows
- `POST /api/ghl/convert-workflow` - Convert to plain language
- `POST /api/ghl/generate-workflow` - AI workflow generation
- `POST /api/ghl/create-workflow` - Deploy workflow to GHL
- `GET /api/ghl/workflows` - Get saved workflows
- `POST /api/ghl/workflows` - Save workflow
- `DELETE /api/ghl/workflows?id={id}` - Delete workflow

#### API Keys
- `GET /api/settings/api-keys` - Get all API keys
- `POST /api/settings/api-keys` - Create API key
- `PUT /api/settings/api-keys/[id]` - Update API key
- `DELETE /api/settings/api-keys/[id]` - Delete API key

---

## Admin Dashboard

**Access:** `/admin`

### Navigation Structure

#### 1. User Management
- **All Users** (`/admin?tab=user-profiles`) - Complete user directory
- **Players** (`/admin?tab=players`) - Player-specific management
- **Coaches** (`/admin?tab=coaches`) - Coach-specific management

#### 2. Financial Management
- **Payments** (`/admin?tab=payments`) - Payment records with Stripe integration
- **Pricing Plans** (`/admin?tab=pricing`) - Registration pricing configuration
- **Coupons & Discounts** (`/admin?tab=coupons`) - Coupon management
- **Analytics & Reports** (`/admin?tab=analytics`) - Financial analytics

#### 3. League Operations
- **Leagues** (`/admin?tab=leagues`) - League configuration
- **Seasons** (`/admin?tab=seasons`) - Season management
- **Season Configuration** (`/admin?tab=season-config`) - Season settings
- **Teams** (`/admin?tab=teams`) - Team management
- **Player Transfers** (`/admin?tab=player-transfers`) - Transfer history
- **Player Swaps** (`/admin?tab=player-swaps`) - Swap players between teams
- **Games & Schedules** (`/admin?tab=games`) - Game scheduling

#### 4. Content & Tools
- **Meal Plans** (`/admin?tab=meal-plans`) - Nutrition plan management
- **QR Codes** (`/admin?tab=qr-codes`) - QR code generation

#### 5. Communication
- **SMS Management** (`/admin?tab=sms`) - SMS campaigns
- **Notifications** (`/admin?tab=notifications`) - Push notifications
- **Email Templates** (`/admin?tab=emails`) - Email management
- **GoHighLevel** (`/admin?tab=gohighlevel`) - Marketing automation
- **AI Workflow Builder** (`/admin?tab=workflows`) - AI-powered workflows
- **API Keys** (`/admin?tab=api-keys`) - API credentials management

---

## Payment Processing

### Supported Payment Methods

1. **Credit/Debit Cards** - Via Stripe Payment Intents
2. **Klarna** - Buy Now, Pay Later (4 installments)
3. **Affirm** - Flexible payment plans
4. **Google Pay** - Digital wallet
5. **Apple Pay** - Digital wallet
6. **Cash App** - Digital payments
7. **Amazon Pay** - Amazon account payments

### Payment Flow

```
Registration Form
    ↓
Payment Checkout
    ↓
Stripe Checkout Session
    ↓
Payment Processing
    ↓
Webhook Triggered
    ↓
Payment Record Saved (with coupon data)
    ↓
Player Status Updated
    ↓
Confirmation Email Sent
    ↓
Registration Success Page
```

### Coupon Integration

When a coupon is applied:

1. **Validation** - Real-time validation via `/api/coupons/validate`
2. **Discount Calculation** - Applied to checkout amount
3. **Metadata Capture** - Coupon code, discount, original amount
4. **Webhook Processing** - Payment record includes:
   - `couponCode` - The coupon used (e.g., "REGISTER")
   - `couponDiscount` - Discount amount
   - `originalAmount` - Price before discount
   - `amount` - Final price paid
   - `couponApplied` - Boolean flag
5. **Usage Tracking** - Coupon usage count incremented
6. **Admin Visibility** - Visible in Payments tab with full details

### Payment Record Structure

```javascript
{
  stripeSessionId: "cs_xxx",
  stripePaymentIntentId: "pi_xxx",
  amount: 4.00,                    // Final amount
  originalAmount: 88.50,           // Before coupon
  couponCode: "REGISTER",          // Coupon used
  couponDiscount: 84.50,           // Discount applied
  couponApplied: true,
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+1234567890",
  playerId: "player_xxx",
  description: "Registration Payment",
  status: "succeeded",
  paymentMethod: "card",
  metadata: {...},
  createdAt: Timestamp,
  paidAt: Timestamp
}
```

---

## Coupon System

### Coupon Types

1. **Percentage Discount** - e.g., 20% off
2. **Fixed Amount** - e.g., $10 off
3. **Set Price** - Pay exactly $X regardless of original price

### Coupon Configuration

```javascript
{
  code: "SAVE100",              // Coupon code (uppercase)
  discountType: "set_price",    // percentage | fixed_amount | set_price
  discountValue: 1.00,          // Value based on type
  isActive: true,
  startDate: Timestamp,
  expirationDate: Timestamp,
  maxUses: 100,
  usedCount: 0,
  minOrderAmount: 0,
  applicableItems: [            // What it applies to
    "Player Registration",
    "Coach Registration"
  ],
  description: "Special promotion",
  createdAt: Timestamp
}
```

### Validation Rules

- ✅ Active status (`isActive: true`)
- ✅ Within date range (start ≤ now ≤ expiration)
- ✅ Usage limit not exceeded (`usedCount < maxUses`)
- ✅ Minimum order amount met
- ✅ Applicable to item type
- ✅ Code matches (case-insensitive)

### Discount Calculations

**Percentage:**
```javascript
discount = (orderAmount * discountValue) / 100
finalAmount = orderAmount - discount
```

**Fixed Amount:**
```javascript
discount = Math.min(discountValue, orderAmount)
finalAmount = orderAmount - discount
```

**Set Price:**
```javascript
discount = orderAmount - discountValue
finalAmount = discountValue
```

---

## Player Management

### Player Profile Structure

```javascript
{
  // Personal Information
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+1234567890",
  dateOfBirth: "1995-05-15",
  address: "123 Main St",
  city: "Charlotte",
  state: "NC",
  zipCode: "28202",
  
  // Player Specific
  position: "Quarterback",
  jerseySize: "L",
  jerseyNumber: "12",
  
  // Emergency Contact
  emergencyContact: {
    name: "Jane Doe",
    relationship: "Spouse",
    phone: "+1234567890"
  },
  
  // Medical Information
  medicalInfo: {
    allergies: "None",
    medications: "None",
    conditions: "None"
  },
  
  // Team Assignment
  currentTeamId: "team_xxx",
  currentTeamName: "Team Alpha",
  currentCoachId: "coach_xxx",
  currentCoachName: "Coach Smith",
  
  // Stats
  stats: {
    games: 0,
    touchdowns: 0,
    yards: 0,
    tackles: 0,
    interceptions: 0,
    attendance: 0
  },
  
  // Registration Info
  paymentStatus: "paid",
  selectedPlan: {...},
  registrationDate: Timestamp,
  
  // Metadata
  role: "player",
  status: "active",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### CRUD Operations

**Create Player:**
- Manual admin creation
- Automatic from registration
- All fields optional except name and email

**Read Players:**
- Fetch all with full registration data
- Search by name, email, phone
- Filter by team, status, payment

**Update Player:**
- Partial updates supported
- Preserves unchanged data
- Updates timestamp automatically

**Delete Player:**
- Confirmation required
- Permanent removal
- Consider team assignments

### Player Swaps

**Purpose:** Transfer players between teams while preserving all data.

**Process:**
1. Select player from list
2. View complete profile
3. Choose target team
4. Add reason (optional)
5. Confirm swap
6. Transfer logged in history

**Data Preserved:**
- ✅ Personal information
- ✅ Emergency contacts
- ✅ Medical information
- ✅ Registration data
- ✅ Payment status
- ✅ Stats and metrics

**Transfer Record:**
```javascript
{
  playerId: "player_xxx",
  playerName: "John Doe",
  fromTeamId: "team_1",
  fromTeamName: "Team Alpha",
  toTeamId: "team_2",
  toTeamName: "Team Beta",
  fromCoachId: "coach_1",
  fromCoachName: "Coach Smith",
  toCoachId: "coach_2",
  toCoachName: "Coach Jones",
  reason: "Team balancing",
  swappedBy: "admin",
  swappedAt: Timestamp
}
```

---

## GoHighLevel Integration

### Features

1. **API Integration Management**
2. **Workflow Import & Conversion**
3. **AI Workflow Builder**
4. **Automated Deployment**

### Integration Setup

**Location:** Admin → Integrations → GoHighLevel

**Configuration:**
```javascript
{
  name: "Production GHL",
  apiToken: "encrypted_token",
  locationId: "location_xxx",
  agencyId: "agency_xxx",
  isActive: true,
  
  // Sync Settings
  syncContacts: true,
  syncOpportunities: true,
  syncCalendars: false,
  syncPipelines: false,
  syncCampaigns: false,
  
  // Webhook Configuration
  webhookUrl: "https://yoursite.com/api/ghl/webhook",
  webhookSecret: "secret_xxx",
  enableWebhooks: true,
  
  // Last Sync Info
  lastSyncAt: Timestamp,
  lastSyncStatus: "success",
  totalContactsSynced: 150
}
```

### Workflow Import

**Purpose:** Convert existing GoHighLevel workflows to plain language for easy recreation.

**Process:**
1. Go to GoHighLevel → Import Workflows tab
2. Click "Import Workflows from GoHighLevel"
3. View list of imported workflows
4. Click "Convert to Plain Language" on any workflow
5. AI generates detailed description
6. Copy prompt to clipboard
7. Use in AI Workflow Builder

**Example Output:**
```
"Create a workflow that sends a 3-email welcome series to new customers. 
It should be triggered when a contact is tagged with 'new_customer'. 
Send the first email immediately with a welcome message and company introduction. 
Wait 2 days, then send the second email with product tips and resources. 
Wait another 3 days, then send a final email with a special offer and 
call-to-action. Tag contacts as 'welcomed' after completion."
```

### AI Workflow Builder

**Location:** Admin → Integrations → AI Workflow Builder

**Features:**
- Conversational AI interface
- Follow-up questions for refinement
- Automatic workflow generation
- Save drafts before deployment
- One-click deployment to GoHighLevel

**Usage:**
1. Describe workflow in plain language
2. AI asks clarifying questions
3. Refine requirements through conversation
4. AI generates complete workflow
5. Name and save workflow
6. Deploy to GoHighLevel when ready

**Quick Starters:**
- "I want to create a welcome email series for new sports league members"
- "Help me build an SMS reminder sequence for upcoming games"
- "I need a lead nurturing workflow for potential players"
- "Create an abandoned registration recovery sequence"

---

## API Keys Management

**Location:** Admin → Integrations → API Keys

### Supported Services

- 🤖 **OpenAI** (GPT-4) - AI workflow generation
- 🔌 **GoHighLevel** - Marketing automation
- 💳 **Stripe** - Payment processing
- 📱 **Twilio** - SMS services
- ✉️ **SendGrid** - Email services
- 🔑 **Other** - Custom integrations

### Features

- ✅ Encrypted storage (base64, ready for proper encryption)
- ✅ Active/inactive status
- ✅ Last used tracking
- ✅ Show/hide key values
- ✅ Service-specific icons
- ✅ Add, edit, delete operations

### Security

- Keys encrypted before storage
- Masked display (first 4 + last 4 chars)
- Toggle to show full key
- Never logged or exposed
- Secure deletion

### Usage

API keys stored here are automatically used by the system:
- Workflow builder uses active OpenAI key
- GoHighLevel integration uses active GHL key
- Payment processing uses active Stripe key

---

## Business Operations

### Commissioner Compensation

**System:** Automatic tracking of $1 per registered player

**Features:**
- Real-time compensation calculation
- Stripe Connect for automatic payouts
- Monthly/quarterly reports
- Payment history and audit trail
- Tax reporting (1099 generation)

**Structure:**
```javascript
{
  commissionerId: "commissioner_xxx",
  commissionerName: "Commissioner Anitra",
  commissionerEmail: "anitra@example.com",
  ratePerPlayer: 1.00,
  totalPlayers: 150,
  totalEarned: 150.00,
  periodStart: Timestamp,
  periodEnd: Timestamp,
  periodLabel: "January 2024",
  status: "paid",
  paidAt: Timestamp,
  paymentMethod: "stripe_connect",
  stripeTransferId: "tr_xxx",
  playerIds: [...],
  playerDetails: [...]
}
```

### Practice Scheduling

**Features:**
- Team practice calendar
- Coach and location assignment
- Recurring practices
- Attendance tracking
- Automatic reminders

### Failed Payment Recovery

**System:** Track and recover failed payments

**Workflow:**
1. Automatic detection via Stripe webhook
2. Immediate email sent
3. SMS reminder after 24 hours
4. Phone call task after 48 hours
5. Manual follow-up if needed

**Goal:** Recover $15K+ in 2 weeks

### Event Management

**Supported Events:**
- Jamboree
- Showcases (Blondes vs Brunettes, First Responders)
- Pro basketball merger games
- Regular season games
- Tournaments
- Fundraisers

**Features:**
- Event registration
- Promotion tools (email/SMS templates)
- Attendance tracking
- Results and highlights
- Partner/sponsor management

---

## Environment Configuration

### Required Environment Variables

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Stripe
STRIPE_SECRET_KEY=sk_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# GoHighLevel
GOHIGHLEVEL_API_KEY=xxx
GOHIGHLEVEL_LOCATION_ID=xxx
GOHIGHLEVEL_FROM_EMAIL=noreply@yourdomain.com

# Email (SendGrid or SMTP)
SENDGRID_API_KEY=xxx
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx

# Twilio (SMS)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

# Application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=xxx
```

### Optional Configuration

```bash
# Commissioner Compensation
COMMISSIONER_STRIPE_ACCOUNT_ID=acct_xxx
COMMISSIONER_RATE_PER_PLAYER=1.00

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_xxx
```

---

## Deployment Guide

### Prerequisites

- Node.js 18+ installed
- Firebase project created
- Stripe account configured
- Domain name (for production)

### Step 1: Clone and Install

```bash
git clone https://github.com/brianstittsr/windsurf_DewayneDraftKings.git
cd windsurf_DewayneDraftKings
npm install
```

### Step 2: Configure Environment

1. Copy `.env.local.example` to `.env.local`
2. Fill in all required environment variables
3. Test locally: `npm run dev`

### Step 3: Firebase Setup

1. Create Firestore database
2. Set up authentication (if needed)
3. Configure security rules
4. Create indexes for queries

### Step 4: Stripe Setup

1. Get API keys from Stripe Dashboard
2. Configure webhook endpoint
3. Add webhook secret to environment
4. Test with Stripe test cards

### Step 5: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Configure custom domain
# Set up webhook URLs
```

### Step 6: Post-Deployment

1. Configure Stripe webhook in production
2. Test payment flow end-to-end
3. Verify email delivery
4. Test SMS functionality
5. Configure GoHighLevel integration
6. Set up commissioner compensation

### Webhook Configuration

**Stripe Webhook URL:**
```
https://yourdomain.com/api/payments/webhook
```

**Events to Subscribe:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.failed`
- `charge.refunded`
- `charge.dispute.created`

---

## Support & Maintenance

### Regular Tasks

**Daily:**
- Monitor payment processing
- Check failed payments
- Review registration submissions

**Weekly:**
- Generate financial reports
- Review coupon usage
- Check system performance

**Monthly:**
- Process commissioner compensation
- Generate analytics reports
- Review and optimize workflows

### Troubleshooting

**Payment Issues:**
1. Check Stripe dashboard for errors
2. Verify webhook is receiving events
3. Check Firebase for payment records
4. Review Stripe logs

**Coupon Issues:**
1. Verify coupon is active
2. Check expiration dates
3. Confirm usage limits
4. Test validation endpoint

**Integration Issues:**
1. Verify API keys are active
2. Check rate limits
3. Review error logs
4. Test API endpoints

### Monitoring

- **Stripe Dashboard** - Payment monitoring
- **Firebase Console** - Database and errors
- **Vercel Analytics** - Performance metrics
- **Error Tracking** - Application errors

---

## Version History

### Version 2.0 (October 2025)
- ✅ Complete CRUD operations for player management
- ✅ Coupon tracking in payment records
- ✅ API keys management system
- ✅ Player swap functionality
- ✅ GoHighLevel workflow import/conversion
- ✅ AI-powered workflow builder
- ✅ Commissioner compensation tracking
- ✅ Business operations planning

### Version 1.0 (September 2025)
- ✅ Initial platform launch
- ✅ Registration system
- ✅ Payment processing
- ✅ Basic admin dashboard
- ✅ Coupon system
- ✅ Team management

---

## Contact & Support

**Development Team:** Cascade AI  
**Repository:** https://github.com/brianstittsr/windsurf_DewayneDraftKings  
**Documentation:** This file  

For technical support or questions, refer to the codebase or contact the development team.

---

*Last Updated: October 2, 2025*
*Platform Version: 2.0*
*Documentation Version: 1.0*
