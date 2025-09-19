# Flag Football League — Activities & Implementation Plan

This document outlines the structured plan of activities required to launch, automate, and scale the league operations for All Pro Sports. It is designed to align with our existing **Next.js / Bootstrap / Firebase** web application stack.

---

## Goals
- Achieve **~500 player registrations** across 20 co-ed teams (≈33–35 players each).
- Automate **nurturing → registration → payment → upsell** flows.
- Deliver a **"see your name everywhere"** experience (leaderboards, new client lists, weigh-ins, referral tree).
- Deploy **QR-coded jerseys** linking players to team pages, league pages, stats, and payments.
- Align staff roles with **revenue-linked KPIs**.
- Be **event-ready** for the Jamboree.

---

## Current System Status ✅

### Already Implemented
- ✅ **Registration System**: Multi-step registration with player/coach roles
- ✅ **Payment Processing**: Stripe integration with multiple payment methods
- ✅ **QR Code Generation**: Automatic profile QR codes in confirmation emails
- ✅ **SMS Automation**: Twilio integration with journey workflows
- ✅ **Email Service**: PDF generation and confirmation emails
- ✅ **Admin Dashboard**: SMS analytics and basic management
- ✅ **Team Management**: Basic team creation and game scheduling
- ✅ **User Profiles**: Complete player profiles with emergency contacts
- ✅ **Coupon System**: Discount codes and promotional pricing

### Integration Points
- Firebase/Firestore database with comprehensive schema
- Bootstrap 5 UI components and modern styling
- Stripe webhook handling for payment automation
- Twilio SMS service for automated communications
- PDF generation for registration documents

---

## Workstream A — Lead Nurture & Payment Automation
**Objective:** Convert leads into paid registrations and minimize manual follow-ups.  
**Stack Fit:** Firebase Functions (triggers), Firestore (lead DB), Bootstrap modals/forms, Firebase Cloud Messaging.

### Activities
1. **Import Lead Database** 
   - Enhance existing SMS opt-in system to capture lead segments
   - Add lead scoring and classification tags
   - Import historical leads with proper segmentation

2. **Enhanced SMS/Email Sequences**
   - Extend existing SMS journey system with payment-focused flows
   - Add email integration to complement SMS automation
   - Build automated branching logic:
     - Pay now → direct checkout link
     - Pay later → scheduled reminders (1-day-before + day-of)
     - Not interested → exit flow with re-engagement sequence

3. **Payment Reminder Automation**
   - Leverage existing Stripe integration for payment tracking
   - Build Firebase Functions for scheduled payment reminders
   - Add abandoned cart recovery for incomplete registrations

4. **KPI Dashboard Enhancement**
   - Extend existing admin dashboard with lead conversion metrics
   - Add real-time conversion tracking and funnel analysis
   - Build staff performance dashboards

### Technical Implementation
```typescript
// Enhanced Lead Schema
interface Lead extends BaseDocument {
  source: 'sms' | 'email' | 'referral' | 'event' | 'social';
  status: 'prospect' | 'nurturing' | 'hot' | 'converted' | 'lost';
  score: number; // 0-100 lead scoring
  tags: string[];
  lastContact: Timestamp;
  conversionProbability: number;
  assignedStaff?: string;
}
```

---

## Workstream B — Registration, Roster & Team Capacity
**Objective:** Standardize registration & enforce team size limits.  
**Stack Fit:** Firebase Firestore (Team, Player collections), Bootstrap tables & forms.

### Activities
1. **Enhanced Registration Flow**
   - Extend existing registration system with position preferences
   - Add availability tracking and scheduling preferences
   - Implement team capacity limits and waitlist management

2. **Draft Pool Management**
   - Auto-assign players to Draft Pool when teams are full
   - Build draft-eligible player interface
   - Add manual override capabilities for admin

3. **Status Tracking System**
   - Enhance existing player status with detailed workflow:
     - `Prospect` → `Pending Payment` → `Paid/Registered` → `Draft Pool` → `Team-Assigned`
   - Add automated status transitions based on payment events
   - Build status-based filtering and reporting

4. **Coach & Referee Onboarding**
   - Create separate registration flows for coaches and referees
   - Add certification tracking and background check integration
   - Build coach assignment and team management tools

### Technical Implementation
```typescript
// Enhanced Team Schema
interface Team extends BaseDocument {
  name: string;
  capacity: number;
  currentSize: number;
  waitlistSize: number;
  coachId?: string;
  assistantCoaches: string[];
  status: 'forming' | 'full' | 'draft-ready' | 'active';
  draftOrder?: number;
}

// Enhanced Player Status
type PlayerStatus = 
  | 'prospect' 
  | 'pending-payment' 
  | 'paid-registered' 
  | 'draft-pool' 
  | 'team-assigned' 
  | 'waitlist';
```

---

## Workstream C — QR Codes & Jerseys
**Objective:** Make jerseys interactive with enhanced QR functionality.  
**Stack Fit:** Next.js dynamic routes, Firebase Hosting for landing pages, existing QR code generator.

### Activities
1. **Enhanced QR Code System**
   - Extend existing QR code generation for jersey-specific codes
   - Create team-level QR codes linking to team pages
   - Add league-wide QR codes for general information

2. **Interactive Landing Pages**
   - Build dynamic player profile pages (extend existing system)
   - Create team pages with roster, stats, and schedules
   - Add league-wide leaderboards and statistics

3. **Jersey Integration**
   - Generate CSV exports for jersey printing with QR codes
   - Add QR code placement specifications for vendors
   - Build jersey number assignment and tracking

4. **Analytics & Tracking**
   - Implement QR scan tracking with Firebase Analytics
   - Add UTM parameter support for attribution
   - Build scan frequency and engagement reports

### Technical Implementation
```typescript
// Jersey QR Code Schema
interface JerseyQRCode extends BaseDocument {
  playerId: string;
  teamId: string;
  jerseyNumber: number;
  qrCodeUrl: string;
  landingPageUrl: string;
  scanCount: number;
  lastScanned?: Timestamp;
  printStatus: 'pending' | 'printed' | 'delivered';
}
```

---

## Workstream D — Draft System (MVP)
**Objective:** Support NFL-style draft feel with team caps.  
**Stack Fit:** Firestore DraftPool collection, Bootstrap DraftBoard UI.

### Activities
1. **Draft Board Interface**
   - Build live draft board with real-time updates
   - Add position-based filtering (QB, rusher, receiver, etc.)
   - Implement drag-and-drop draft functionality

2. **Team Capacity Management**
   - Auto-close teams once capacity is reached
   - Add waitlist management for full teams
   - Build overflow handling for excess registrations

3. **Draft Rules Engine**
   - Implement position requirements per team
   - Add draft order randomization and management
   - Build trade approval workflow

4. **Live Draft Experience**
   - Create real-time draft board for event display
   - Add draft timer and pick notifications
   - Build mobile-friendly draft interface for coaches

### Technical Implementation
```typescript
// Draft System Schema
interface DraftEvent extends BaseDocument {
  name: string;
  status: 'setup' | 'active' | 'paused' | 'completed';
  currentRound: number;
  currentPick: number;
  pickTimeLimit: number; // seconds
  teams: string[];
  draftOrder: string[];
}

interface DraftPick extends BaseDocument {
  draftEventId: string;
  round: number;
  pick: number;
  teamId: string;
  playerId?: string;
  timestamp?: Timestamp;
  status: 'upcoming' | 'active' | 'completed' | 'skipped';
}
```

---

## Workstream E — Visibility & Referrals
**Objective:** Motivate and grow through recognition.  
**Stack Fit:** Firebase Firestore collections (`Leaderboards`, `Referrals`), Bootstrap cards.

### Activities
1. **Leaderboard System**
   - Build multiple leaderboard categories (stats, referrals, participation)
   - Add real-time updates and live displays for events
   - Create seasonal and all-time tracking

2. **Referral Program**
   - Extend existing system with referral tree visualization
   - Add referral reward tracking and redemption
   - Build referral performance analytics

3. **Recognition Features**
   - Create "new client" spotlight displays
   - Add achievement badges and milestone tracking
   - Build social sharing capabilities

4. **Event Display Integration**
   - Create large-screen displays for events
   - Add real-time stat updates during games
   - Build photo/video integration for highlights

### Technical Implementation
```typescript
// Leaderboard Schema
interface Leaderboard extends BaseDocument {
  category: 'stats' | 'referrals' | 'participation' | 'revenue';
  period: 'weekly' | 'monthly' | 'seasonal' | 'all-time';
  entries: LeaderboardEntry[];
  lastUpdated: Timestamp;
}

interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  value: number;
  rank: number;
  change: number; // position change from last period
}

// Referral Tree Schema
interface ReferralTree extends BaseDocument {
  referrerId: string;
  referrals: ReferralNode[];
  totalReferrals: number;
  totalRewards: number;
  level: number; // depth in referral tree
}
```

---

## Workstream F — Upsell Flows
**Objective:** Subtle, value-driven upselling.  
**Stack Fit:** Firebase Cloud Messaging + Firestore triggers, existing email/SMS system.

### Activities
1. **Micro-Questionnaire System**
   - Build post-registration surveys for interests
   - Add meal plan preference collection
   - Create fitness class interest tracking

2. **Automated Upsell Triggers**
   - Extend existing SMS system with upsell sequences
   - Add milestone-based offer triggers
   - Build seasonal promotion automation

3. **A/B Testing Framework**
   - Create offer testing and optimization system
   - Add conversion tracking and analytics
   - Build performance comparison dashboards

4. **Value-Driven Messaging**
   - Create educational content sequences
   - Add success story sharing
   - Build community engagement campaigns

### Technical Implementation
```typescript
// Upsell Campaign Schema
interface UpsellCampaign extends BaseDocument {
  name: string;
  targetAudience: string[];
  trigger: 'registration' | 'milestone' | 'seasonal' | 'manual';
  offers: UpsellOffer[];
  conversionRate: number;
  revenue: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
}

interface UpsellOffer {
  productId: string;
  discountPercent?: number;
  bundlePrice?: number;
  expirationDate: Timestamp;
  conversionCount: number;
}
```

---

## Workstream G — Org Design & KPIs
**Objective:** Link staff roles directly to metrics.  
**Stack Fit:** Firebase Firestore KPI collection, Bootstrap admin dashboard.

### Activities
1. **Role Definition & Assignment**
   - Registration Specialist: Conversion rates, registration volume
   - Jersey/QR Coordinator: Production timeline, scan rates
   - Meal Plan Manager: Upsell conversion, customer satisfaction
   - Class Coordinator: Attendance rates, retention
   - Draft/Stats Manager: Data accuracy, engagement metrics

2. **KPI Dashboard Development**
   - Extend existing admin dashboard with role-specific metrics
   - Add real-time performance tracking
   - Build goal setting and progress monitoring

3. **Weekly Reporting System**
   - Create automated KPI reports
   - Add performance trend analysis
   - Build team performance comparisons

4. **Incentive Structure**
   - Link KPIs to performance bonuses
   - Add achievement recognition system
   - Build team collaboration metrics

### Technical Implementation
```typescript
// Staff KPI Schema
interface StaffKPI extends BaseDocument {
  staffId: string;
  role: 'registration' | 'jersey-qr' | 'meal-plan' | 'classes' | 'draft-stats';
  period: 'daily' | 'weekly' | 'monthly';
  metrics: KPIMetric[];
  goals: KPIGoal[];
  performance: number; // 0-100 score
}

interface KPIMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}
```

---

## Workstream H — Jamboree Event Readiness
**Objective:** Ensure seamless event-day experience.  
**Stack Fit:** Next.js frontend for registration/stats screens, Firebase hosting for real-time dashboards.

### Activities
1. **Event Infrastructure Testing**
   - Test all registration/payment flows on venue Wi-Fi
   - Validate mobile responsiveness for on-site registration
   - Build offline fallback capabilities

2. **Signage & QR Integration**
   - Create event signage with registration QR codes
   - Add payment processing QR codes for quick checkout
   - Build information kiosks with league details

3. **Staff Assignment & Training**
   - Assign roles: greeters, scan helpers, payment support
   - Create event-day runbook and procedures
   - Build staff communication system

4. **Contingency Planning**
   - Set up manual registration forms as backup
   - Add card reader fallbacks for payment processing
   - Create offline data collection procedures

5. **Post-Event Automation**
   - Build automated recap and stats sharing
   - Add post-event upsell campaigns
   - Create feedback collection and analysis

### Technical Implementation
```typescript
// Event Management Schema
interface Event extends BaseDocument {
  name: string;
  date: Timestamp;
  venue: string;
  status: 'planning' | 'setup' | 'active' | 'completed';
  registrations: EventRegistration[];
  staff: EventStaff[];
  equipment: EventEquipment[];
}

interface EventRegistration {
  playerId: string;
  checkInTime?: Timestamp;
  paymentStatus: 'pending' | 'completed';
  method: 'online' | 'onsite';
}
```

---

## Workstream I — Data, Tech & Compliance
**Objective:** Keep stack simple, measurable, and compliant.  
**Stack Fit:** Firebase Firestore schema, Auth, Functions.

### Activities
1. **Enhanced Schema Design**
   - Extend existing Firestore schema for new collections
   - Add proper indexing and query optimization
   - Build data validation and integrity checks

2. **Attribution & Analytics**
   - Add UTM parameter tracking throughout system
   - Build comprehensive conversion funnel analysis
   - Create customer journey mapping

3. **Compliance & Consent**
   - Enhance existing SMS opt-in with granular permissions
   - Add email marketing consent management
   - Build data retention and deletion policies

4. **Backup & Recovery**
   - Implement daily automated backups
   - Add data export capabilities for compliance
   - Build disaster recovery procedures

### Technical Implementation
```typescript
// Enhanced Analytics Schema
interface Analytics extends BaseDocument {
  eventType: 'registration' | 'payment' | 'scan' | 'referral' | 'upsell';
  userId?: string;
  sessionId: string;
  source: string;
  medium: string;
  campaign?: string;
  value?: number;
  metadata: Record<string, any>;
}

// Consent Management
interface ConsentRecord extends BaseDocument {
  userId: string;
  consentType: 'sms' | 'email' | 'marketing' | 'analytics';
  granted: boolean;
  timestamp: Timestamp;
  ipAddress: string;
  userAgent: string;
}
```

---

## 3-Week Implementation Timeline

### Week 1: Foundation & Core Systems
**Days 1-2: Lead Management & Nurture**
- Import and segment existing leads
- Enhance SMS journey system with payment flows
- Build lead scoring and classification

**Days 3-4: Registration & Team Management**
- Implement team capacity limits and draft pool
- Add enhanced player status tracking
- Build coach/referee onboarding flows

**Days 5-7: KPI Dashboard & Staff Roles**
- Define staff roles and KPI metrics
- Build enhanced admin dashboard
- Create performance tracking system

### Week 2: Engagement & Revenue Systems
**Days 8-9: QR Code & Jersey System**
- Enhance QR code generation for jerseys
- Build team and league landing pages
- Create jersey vendor integration

**Days 10-11: Draft System & Leaderboards**
- Build draft board interface
- Implement leaderboard system
- Add referral tree visualization

**Days 12-14: Upsell Flows & Analytics**
- Create micro-questionnaire system
- Build automated upsell campaigns
- Add comprehensive analytics tracking

### Week 3: Event Preparation & Launch
**Days 15-16: Event Infrastructure**
- Test all systems on venue network
- Create event signage and QR codes
- Build staff training materials

**Days 17-18: Full System Rehearsal**
- Run complete registration-to-payment flow
- Test draft system with mock data
- Validate all KPI dashboards

**Days 19-21: Jamboree Execution**
- Deploy event-day systems
- Execute registration and draft
- Launch post-event campaigns

---

## Open Decisions & Next Steps

### Immediate Decisions Needed
1. **Payment Provider Configuration**
   - Configure Stripe for scheduled/auto-draft payments
   - Set up ACH processing for recurring fees
   - Define payment failure handling procedures

2. **Team Assignment Rules**
   - Define conflict resolution for team preferences
   - Set position requirements per team
   - Create trade approval workflow

3. **Referral Reward Structure**
   - Set reward tiers and budget allocation
   - Define redemption methods and limits
   - Create reward fulfillment process

4. **Jersey Vendor Coordination**
   - Finalize QR code placement specifications
   - Set production timeline and deadlines
   - Define quality control procedures

### Technical Priorities
1. Extend existing Firebase schema with new collections
2. Build enhanced admin dashboard components
3. Create mobile-optimized event interfaces
4. Implement real-time data synchronization

---

## Success Metrics & Acceptance Criteria

### Automated Systems
- ✅ Lead nurture sequences converting at >15% rate
- ✅ Payment reminders reducing manual follow-up by 80%
- ✅ Registration flow completing in <5 minutes
- ✅ QR code scans driving >25% profile engagement

### Operational Efficiency
- ✅ Staff KPI dashboards updating in real-time
- ✅ Team capacity management preventing overregistration
- ✅ Draft system handling 500+ players smoothly
- ✅ Event-day registration processing <2 minutes per player

### Revenue & Growth
- ✅ Upsell campaigns achieving >10% conversion
- ✅ Referral program generating >20% of new registrations
- ✅ Payment automation reducing processing costs by 50%
- ✅ Overall registration target of 500 players achieved

### Technical Performance
- ✅ System handling 100+ concurrent users
- ✅ Mobile responsiveness across all devices
- ✅ 99.9% uptime during event periods
- ✅ Data backup and recovery procedures tested

---

## Integration with Existing System

This plan builds upon the robust foundation already established in the All Pro Sports system:

- **Leverages existing** registration, payment, and SMS automation
- **Extends current** QR code and email systems
- **Enhances present** admin dashboard and team management
- **Integrates with** established Firebase/Firestore architecture
- **Maintains compatibility** with Bootstrap UI and Next.js framework

The implementation will be additive rather than replacement, ensuring continuity of current operations while adding the advanced league management capabilities outlined in this plan.
