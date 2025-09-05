# All Pro Sports SMS Automation System

## Phase 1: SMS Automation & Player Registration System

A complete SMS automation system for All Pro Sports with comprehensive player registration, automated message journeys, QR code generation, and payment integration.

## Features

### ✅ Completed (Phase 1)
- **Mobile Registration Form**: Comprehensive player information collection with mobile-optimized interface
- **Player Profile System**: Complete player profiles with stats, emergency contacts, and medical information
- **QR Code Generation**: Auto-generated QR codes for players, teams, and league with profile linking
- **Payment Integration**: Payment page with multiple options and SMS confirmation
- **SMS Automation**: Welcome sequence, registration reminders, feedback collection, and payment confirmations
- **Admin QR Management**: Interface for generating and managing league/team QR codes
- **Player Profile Pages**: Individual player profiles accessible via QR codes with stats and information
- **Team & League Pages**: Dedicated pages for team rosters/stats and league standings/information
- **Analytics Dashboard**: Real-time metrics and performance tracking
- **Webhook Handling**: Delivery status updates and reply processing

### 🚫 Out of Scope (Future Phases)
- Advanced league operations (automated drafts, complex stats)
- Full Stripe payment processing (Phase 2)
- Advanced CRM features
- Multi-league management

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Firebase/Firestore
- **SMS**: Twilio API
- **UI**: Bootstrap 5
- **Analytics**: Custom tracking system

## Project Structure

```
├── app/
│   ├── admin/              # SMS management dashboard
│   ├── api/sms/           # SMS API endpoints
│   │   ├── send/          # Send SMS messages
│   │   ├── journeys/      # Journey management
│   │   ├── webhook/       # Twilio webhooks
│   │   └── analytics/     # Performance metrics
│   └── register/          # User registration page
├── lib/
│   ├── firebase.ts        # Firebase configuration
│   ├── twilio-service.ts  # SMS sending service
│   ├── sms-journey-service.ts # Journey automation
│   ├── sms-analytics.ts   # Analytics tracking
│   └── sms-schema.ts      # Database schema
└── scripts/
    └── initialize-journeys.js # Setup script
```

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your values
4. Run the development server: `npm run dev`

### Environment Configuration

Copy `.env.local.example` to `.env.local` and configure:

```bash
# Twilio SMS
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"  
TWILIO_PHONE_NUMBER="+1234567890"

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
# ... other Firebase config
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Journey Templates

```bash
npm run dev
node scripts/initialize-journeys.js
```

### 4. Configure Twilio Webhook

Set webhook URL in Twilio Console:
```
https://yourdomain.com/api/sms/webhook
```

## Usage

### User Registration
- Visit `/register` to collect SMS subscribers
- Automatic welcome message sent upon registration

### Admin Dashboard  
- Visit `/admin` for SMS management and analytics
- View delivery rates, engagement metrics, and conversion data

### API Endpoints

- `POST /api/sms/send` - Send individual SMS
- `POST /api/sms/journeys` - Manage journey workflows
- `POST /api/sms/webhook` - Handle Twilio status updates
- `GET /api/sms/analytics` - Retrieve performance metrics

## SMS Journeys

### Welcome Sequence (3 steps)
1. Immediate welcome message
2. League information (24h delay)
3. Social media follow CTA (72h delay)

### Registration Reminders (2 steps)
1. Registration open notification
2. Urgency reminder (1 week later)

### Feedback Collection (2 steps)
1. Experience rating request
2. Referral request (24h delay)

## Analytics & Tracking

- **Delivery Metrics**: Send/delivery/failure rates
- **Engagement**: Reply rates, opt-out tracking
- **Conversion**: Click-through rates, journey completion
- **Real-time Dashboard**: Performance monitoring

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Phase 1 Scope Compliance

This implementation strictly adheres to the signed proposal:
- ✅ Automated SMS journeys with deliverability tracking
- ✅ Baseline conversion measurement
- ❌ League operations features deferred to future phases

## License

Private - All Pro Sports Project
