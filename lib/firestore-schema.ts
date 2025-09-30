// Firestore Database Schema for DraftKings League Management System
import { Timestamp } from 'firebase/firestore';

// Base interface for all documents
interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Product/Pricing Plans Interface
export interface Product extends BaseDocument {
  // Basic Information
  title: string;
  subtitle: string;
  description?: string;
  
  // Pricing
  price: number;
  serviceFee: number;
  totalPrice: number; // price + serviceFee
  
  // Product Details
  features: string[];
  itemType: 'jamboree' | 'season' | 'bundle' | 'assistant_coach' | 'head_coach';
  category: 'player' | 'coach';
  
  // Display Options
  popular: boolean;
  buttonText: string;
  buttonClass: string;
  displayOrder: number;
  
  // Status
  isActive: boolean;
  isVisible: boolean;
  
  // Availability
  availableFrom?: Timestamp;
  availableUntil?: Timestamp;
  maxCapacity?: number;
  currentRegistrations?: number;
  
  // Metadata
  tags?: string[];
  notes?: string;
}

export interface Player extends BaseDocument {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Timestamp;
  profilePhoto?: string;
  jerseySize: string;
  
  // Role Assignment
  role: 'player';
  
  // Registration Information
  registrationDate: Timestamp;
  registrationStatus: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'overdue';
  registrationPdfUrl?: string;
  
  // Player Classification
  playerTag: 'free-agent' | 'draft-pick' | 'prospect' | 'meet-greet' | 'client';
  position: 'quarterback' | 'rusher' | 'receiver' | 'defender' | 'flex';
  
  // Team Assignment
  teamId?: string;
  draftRound?: number;
  draftPick?: number;
  isDrafted: boolean;
  
  // Emergency Contact
  emergencyContact?: {
    name: string;
    phone: string;
  };
  
  // Medical Information
  medicalInfo?: {
    conditions: string;
    lastUpdated: Timestamp;
  };
  
  // Stats and Performance
  stats: {
    gamesPlayed: number;
    touchdowns: number;
    yards: number;
    tackles: number;
    interceptions: number;
    attendance: number;
  };
  
  // Health and Fitness Tracking
  metrics: {
    currentWeight: number;
    targetWeight?: number;
    weighIns: WeighIn[];
    workouts: Workout[];
    totalWeightLoss: number;
  };
  
  // Referral System
  referredBy?: string; // Player ID who referred this player
  referrals: string[]; // Array of Player IDs this player referred
  referralRewards: number; // Points/credits earned from referrals
  referralLevel: number; // Level in referral tree
  
  // QR Code
  qrCode: string;
  qrCodeUrl: string; // URL that QR code points to
  
  // Marketing Automation
  funnelStatus: {
    currentFunnelId?: string;
    currentStep: number;
    lastInteraction: Timestamp;
    isOptedOut: boolean;
  };
}

export interface Coach extends BaseDocument {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Timestamp;
  profilePhoto?: string;
  jerseySize?: string;
  
  // Role Assignment
  role: 'coach';
  
  // Registration Information
  registrationDate: Timestamp;
  registrationStatus: 'pending' | 'confirmed' | 'cancelled';
  isActive: boolean;
  registrationPdfUrl?: string;
  
  // Coaching Information
  experience: string; // Years of experience or description
  certifications: string[]; // Array of certification names
  specialties: string[]; // Areas of expertise
  coachingLevel: 'assistant' | 'head' | 'coordinator' | 'volunteer';
  
  // Team Assignment
  assignedTeams: string[]; // Array of Team IDs
  maxTeams: number;
  
  // Emergency Contact
  emergencyContact?: {
    name: string;
    phone: string;
  };
  
  // Coaching Stats
  stats: {
    seasonsCoached: number;
    teamsCoached: number;
    totalWins: number;
    totalLosses: number;
    championshipsWon: number;
  };
  
  // QR Code
  qrCode: string;
  qrCodeUrl: string;
  
  // Marketing Automation
  funnelStatus: {
    currentFunnelId?: string;
    currentStep: number;
    lastInteraction: Timestamp;
    isOptedOut: boolean;
  };
}

export interface Team extends BaseDocument {
  name: string;
  shortName?: string; // Team abbreviation
  division: 'men' | 'women' | 'mixed';
  coachId: string;
  coachName: string;
  description?: string;
  
  // Roster Management
  players: string[]; // Array of Player IDs
  coaches: string[]; // Array of Coach IDs
  captainId?: string; // Player ID of team captain
  maxRosterSize: number;
  currentRosterSize: number;
  rosterLocked: boolean;
  
  // Team Performance
  stats: {
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number;
    gamesPlayed: number;
    winPercentage: number;
    pointsDifferential: number;
  };
  
  // Season Information
  seasonId: string;
  leagueId: string;
  
  // Team Settings
  ageGroup?: 'youth' | 'adult' | 'senior' | 'mixed';
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  
  // Location and Contact
  homeField?: string;
  establishedDate?: Timestamp;
  
  // Status
  isActive: boolean;
  
  // Social Media Integration
  facebookPageUrl?: string;
  socialMediaStats: {
    followers: number;
    engagement: number;
  };
  
  // Draft Information
  draftOrder: number;
  draftPicks: DraftPick[];
  availableTrades: number;
  
  // Team Colors and Branding
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export interface Game extends BaseDocument {
  // Game Identification
  gameNumber: number;
  week: number;
  seasonId: string;
  leagueId: string;
  
  // Teams
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  
  // Scheduling
  scheduledDate: Timestamp;
  actualDate?: Timestamp;
  venue: string;
  
  // Game Status
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  
  // Score Information
  score: {
    home: number;
    away: number;
    quarter1?: { home: number; away: number };
    quarter2?: { home: number; away: number };
    quarter3?: { home: number; away: number };
    quarter4?: { home: number; away: number };
    overtime?: { home: number; away: number };
  };
  
  // Game Statistics
  stats: {
    homeTeamStats: TeamGameStats;
    awayTeamStats: TeamGameStats;
  };
  
  // Officials and Administration
  referees?: string[];
  recordedBy: string; // Admin user ID
  notes?: string;
  
  // Weather (for outdoor games)
  weather?: {
    temperature: number;
    conditions: string;
    windSpeed?: number;
  };
}

export interface TeamGameStats {
  totalYards: number;
  passingYards: number;
  rushingYards: number;
  touchdowns: number;
  fieldGoals: number;
  turnovers: number;
  penalties: number;
  penaltyYards: number;
  timeOfPossession?: string; // MM:SS format
}

export interface Season extends BaseDocument {
  name: string;
  year: number;
  leagueId: string;
  
  // Season Configuration
  startDate: Timestamp;
  endDate: Timestamp;
  regularSeasonWeeks: number;
  playoffWeeks: number;
  
  // Season Status
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  currentWeek: number;
  
  // Playoff Configuration
  playoffTeams: number;
  championshipDate?: Timestamp;
  
  // Season Statistics
  stats: {
    totalGames: number;
    completedGames: number;
    totalTeams: number;
    totalPlayers: number;
  };
}

export interface League extends BaseDocument {
  name: string;
  shortName?: string;
  description?: string;
  sport: 'flag_football' | 'basketball' | 'soccer' | 'volleyball' | 'other';
  
  // League Configuration
  maxTeams: number;
  minTeams?: number;
  maxPlayersPerTeam: number;
  gameLength: number; // minutes
  type?: 'recreational' | 'competitive' | 'professional' | 'youth';
  format?: 'round-robin' | 'playoff' | 'tournament' | 'ladder';
  
  // Season Information
  currentSeasonId?: string;
  seasonStartDate?: Timestamp;
  seasonEndDate?: Timestamp;
  registrationDeadline?: Timestamp;
  
  // Pricing and Registration
  registrationFee?: number;
  teamFee?: number;
  playerFee?: number;
  
  // League Rules
  rules: {
    overtimeRules?: string;
    scoringSystem: string;
    playerEligibility: string;
  };
  
  // Age Restrictions
  ageRestrictions?: {
    minAge?: number;
    maxAge?: number;
  };
  
  // Status
  isActive: boolean;
  isAcceptingRegistrations?: boolean;
  
  // Contact and Location
  organizerId?: string;
  location?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // League Statistics
  stats: {
    totalSeasons: number;
    totalGamesPlayed: number;
    allTimeWins: { [teamId: string]: number };
    allTimeLosses: { [teamId: string]: number };
  };
}

export interface DraftPick {
  round: number;
  pick: number;
  playerId: string;
  playerName: string;
  timestamp: Timestamp;
  tradedFrom?: string; // Team ID if pick was traded
}

export interface WeighIn {
  date: Timestamp;
  weight: number;
  bodyFatPercentage?: number;
  notes?: string;
  recordedBy: string; // Staff ID
}

export interface Workout {
  date: Timestamp;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports-specific' | 'group-class';
  duration: number; // minutes
  caloriesBurned?: number;
  intensity: 'low' | 'medium' | 'high';
  notes?: string;
  instructorId?: string; // Staff ID
}

export interface Payment extends BaseDocument {
  // Customer Information
  playerId?: string;
  coachId?: string;
  customerEmail: string;
  customerName: string;
  
  // Payment Details
  amount: number;
  currency: 'USD';
  description: string;
  paymentType: 'registration' | 'monthly' | 'equipment' | 'event' | 'other';
  
  // Payment Method
  paymentMethod: {
    type: 'card' | 'klarna' | 'affirm' | 'bank_transfer' | 'cash';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    bnplAccountVerified?: boolean; // For BNPL methods
  };
  
  // Stripe Integration
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripeSessionId?: string;
  
  // BNPL Integration
  klarnaOrderId?: string;
  affirmChargeId?: string;
  bnplAccountStatus?: 'verified' | 'unverified' | 'created' | 'failed';
  
  // Payment Status
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  paidAt?: Timestamp;
  failureReason?: string;
  
  // Plan Information (from checkout)
  planDetails?: {
    planType: 'jamboree' | 'season' | 'jamboree_season' | 'coach_assistant' | 'coach_head';
    planName: string;
    originalPrice: number;
    serviceFee: number;
    couponCode?: string;
    couponDiscount?: number;
    finalAmount: number;
  };
  
  // Subscription Details (if applicable)
  subscriptionId?: string;
  subscriptionPeriod?: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // Refund Information
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Timestamp;
  refundStatus?: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  stripeRefundId?: string;
  stripeChargeId?: string;
  
  // Dispute Information
  disputeStatus?: 'warning_needs_response' | 'warning_under_review' | 'warning_closed' | 'needs_response' | 'under_review' | 'charge_refunded' | 'won' | 'lost';
  disputeReason?: string;
  disputeAmount?: number;
  
  // Installment Information (for BNPL)
  installments?: {
    total: number;
    paid: number;
    nextDueDate?: Timestamp;
    monthlyAmount: number;
  };
  
  // Metadata
  metadata?: { [key: string]: string };
  notes?: string;
  processedBy?: string; // Admin user ID
}

export interface MarketingFunnel extends BaseDocument {
  name: string;
  type: 'lead-nurturing' | 'upsell' | 'retention' | 'referral' | 'payment-reminder';
  
  // Funnel Configuration
  steps: FunnelStep[];
  triggers: FunnelTrigger[];
  targetAudience: string[]; // Player tags or conditions
  
  // Performance Metrics
  stats: {
    totalEntered: number;
    totalCompleted: number;
    conversionRate: number;
    revenue: number;
    avgTimeToComplete: number; // hours
  };
  
  // A/B Testing
  variants?: {
    name: string;
    percentage: number;
    steps: FunnelStep[];
  }[];
  
  // Status
  isActive: boolean;
}

export interface FunnelStep {
  id: string;
  order: number;
  type: 'email' | 'sms' | 'call' | 'appointment' | 'payment' | 'upsell-offer';
  title: string;
  content: string;
  delayHours: number;
  conditions?: string[]; // Conditions to proceed to next step
  
  // Call-to-Action
  cta?: {
    text: string;
    url: string;
    type: 'button' | 'link' | 'phone';
  };
  
  // Performance
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

export interface FunnelTrigger {
  event: 'registration' | 'payment-due' | 'workout-missed' | 'referral-made' | 'weigh-in-missed' | 'team-drafted';
  conditions: string[];
  delayHours?: number;
}

export interface Leaderboard extends BaseDocument {
  name: string;
  type: 'referrals' | 'signups' | 'performance' | 'weight-loss' | 'participation' | 'revenue-generated';
  
  // Leaderboard Configuration
  period: 'daily' | 'weekly' | 'monthly' | 'season' | 'all-time';
  maxEntries: number;
  minValue?: number; // Minimum value to appear on leaderboard
  
  // Entries
  entries: LeaderboardEntry[];
  
  // Display Settings
  isPublic: boolean;
  displayOnHomepage: boolean;
  showPlayerPhotos: boolean;
  
  // Rewards
  rewards?: {
    rank: number;
    reward: string;
    value: number;
  }[];
  
  // Timestamps
  lastUpdated: Timestamp;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  playerPhoto?: string;
  value: number;
  rank: number;
  change: number; // Change from previous period
  trend: 'up' | 'down' | 'same';
  additionalInfo?: string; // Extra context for the entry
}

export interface Staff extends BaseDocument {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  
  // Role and Permissions
  role: 'admin' | 'coach' | 'trainer' | 'staff' | 'manager';
  permissions: string[];
  department: string;
  
  // Revenue Assignments
  revenueStreams: {
    registrations: boolean;
    jerseys: boolean;
    mealPlans: boolean;
    fitnessClasses: boolean;
    merchandise: boolean;
  };
  
  // Performance Tracking
  kpis: {
    signupsTarget: number;
    signupsActual: number;
    revenueTarget: number;
    revenueActual: number;
    conversionRate: number;
    customerSatisfaction: number;
  };
  
  // Job Description
  jobTitle: string;
  jobDescription: string;
  goals: string[];
  responsibilities: string[];
  
  // Commission Structure
  commissionRate: number; // Percentage
  bonusStructure?: {
    threshold: number;
    bonus: number;
  }[];
  
  // Timestamps
  hireDate: Timestamp;
  lastLogin?: Timestamp;
}

export interface Event extends BaseDocument {
  name: string;
  type: 'game' | 'practice' | 'draft' | 'weigh-in' | 'meeting' | 'jamboree' | 'tournament';
  
  // Event Details
  description: string;
  location: string;
  address?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  
  // Participants
  teams?: string[]; // Team IDs
  players?: string[]; // Player IDs
  staff?: string[]; // Staff IDs
  expectedAttendance: number;
  actualAttendance?: number;
  
  // Status
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'postponed';
  
  // Results (for games)
  results?: {
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    playerStats: { [playerId: string]: any };
    mvpPlayerId?: string;
  };
  
  // Media and Social
  photos?: string[];
  videos?: string[];
  socialMediaPosts?: string[];
}

export interface Notification extends BaseDocument {
  // Recipient Information
  recipientId: string;
  recipientType: 'player' | 'staff' | 'coach' | 'team';
  
  // Notification Content
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'update' | 'promotion' | 'achievement' | 'payment-due';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Delivery Methods
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  scheduledFor?: Timestamp;
  
  // Related Data
  relatedEntity?: {
    type: 'payment' | 'event' | 'registration' | 'funnel' | 'leaderboard';
    id: string;
  };
  
  // Interaction Tracking
  openedAt?: Timestamp;
  clickedAt?: Timestamp;
  
  // Timestamps
  sentAt?: Timestamp;
}

export interface ReferralTree extends BaseDocument {
  rootPlayerId: string; // The original referrer
  
  // Tree Structure
  levels: {
    level: number;
    players: {
      playerId: string;
      playerName: string;
      referredBy: string;
      referralDate: Timestamp;
      isActive: boolean;
    }[];
  }[];
  
  // Metrics
  totalReferrals: number;
  activeReferrals: number;
  totalRevenue: number;
  
  // Rewards Distributed
  rewardsDistributed: {
    playerId: string;
    amount: number;
    type: 'cash' | 'credit' | 'merchandise';
    date: Timestamp;
  }[];
}

export interface Coupon extends BaseDocument {
  // Basic Information
  code: string; // Unique coupon code (e.g., "SAVE20", "WELCOME50")
  name: string; // Display name for admin
  description?: string;
  
  // Discount Configuration
  discountType: 'percentage' | 'fixed_amount' | 'set_price';
  discountValue: number; // Percentage (0-100), fixed amount, or set price
  
  // Usage Limits
  maxUses?: number; // Total times coupon can be used
  usedCount: number; // Current usage count
  maxUsesPerCustomer?: number; // Per customer limit
  
  // Validity Period
  startDate: Timestamp;
  expirationDate: Timestamp;
  
  // Applicable Items
  applicableItems: {
    playerRegistration: boolean;
    coachRegistration: boolean;
    jamboreeOnly: boolean;
    completeSeason: boolean;
    jamboreeAndSeason: boolean;
  };
  
  // Minimum Requirements
  minimumAmount?: number; // Minimum order amount
  
  // Status
  isActive: boolean;
  
  // Usage Tracking
  usageHistory: {
    customerId: string;
    customerEmail: string;
    usedAt: Timestamp;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
  }[];
  
  // Admin Information
  createdBy: string; // Admin user ID
  lastModifiedBy: string;
}

export interface SystemSettings extends BaseDocument {
  // Registration Settings
  registrationOpen: boolean;
  maxPlayers: number;
  maxTeams: number;
  registrationDeadline: Timestamp;
  
  // Draft Settings
  draftDate: Timestamp;
  draftRounds: number;
  draftTimePerPick: number; // seconds
  
  // Payment Settings
  registrationFee: number;
  lateFee: number;
  refundPolicy: string;
  
  // Season Settings
  seasonStartDate: Timestamp;
  seasonEndDate: Timestamp;
  jamboreeDate: Timestamp;
  
  // Feature Flags
  features: {
    autoPayEnabled: boolean;
    referralProgramActive: boolean;
    leaderboardsPublic: boolean;
    qrCodesEnabled: boolean;
    marketingAutomationActive: boolean;
  };
  
  // Timestamps
  updatedBy: string; // Staff ID
}

// New interfaces for checkout process
export interface CheckoutSession extends BaseDocument {
  // Session Identification
  sessionId: string; // Stripe session ID
  sessionUrl: string; // Stripe checkout URL
  
  // Customer Information
  customerEmail: string;
  customerName: string;
  playerId?: string;
  coachId?: string;
  
  // Plan Selection
  selectedPlan: {
    planType: 'jamboree' | 'season' | 'jamboree_season' | 'coach_assistant' | 'coach_head';
    planName: string;
    originalPrice: number;
    serviceFee: number;
    couponCode?: string;
    couponDiscount?: number;
    finalAmount: number;
  };
  
  // Payment Configuration
  paymentMethods: ('card' | 'klarna' | 'affirm')[];
  selectedPaymentMethod?: 'card' | 'klarna' | 'affirm';
  bnplAccountVerified?: boolean;
  
  // Session Status
  status: 'created' | 'active' | 'completed' | 'expired' | 'cancelled';
  expiresAt: Timestamp;
  
  // Success/Cancel URLs
  successUrl: string;
  cancelUrl: string;
  
  // Related Payment
  paymentId?: string;
  
  // Registration Data (stored temporarily)
  registrationData?: {
    personalInfo: any;
    roleSpecificInfo: any;
    emergencyContact: any;
    medicalInfo: any;
  };
  
  // Completion Status
  completedAt?: Timestamp;
  registrationCompleted?: boolean;
}

export interface PlanSelection extends BaseDocument {
  // User Information
  sessionId?: string; // Browser session
  customerEmail?: string;
  
  // Selected Plan
  planType: 'jamboree' | 'season' | 'jamboree_season' | 'coach_assistant' | 'coach_head';
  planName: string;
  role: 'player' | 'coach';
  
  // Pricing Details
  originalPrice: number;
  serviceFee: number;
  couponCode?: string;
  couponDiscount?: number;
  finalAmount: number;
  
  // Selection Context
  selectedFrom: 'pricing_page' | 'registration_wizard' | 'admin_panel';
  
  // Status
  status: 'selected' | 'in_checkout' | 'paid' | 'expired';
  expiresAt: Timestamp;
  
  // Conversion Tracking
  convertedToPayment?: boolean;
  paymentId?: string;
  checkoutSessionId?: string;
}

// User Profile Interface (Enhanced for admin management)
export interface UserProfile extends BaseDocument {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Timestamp;
  role: 'player' | 'coach';
  jerseySize?: string;
  profilePhoto?: string;
  
  // Registration Data
  registrationData: RegistrationData;
  registrationPdfUrl?: string;
  
  // Profile Management
  profileUrl?: string;
  qrCodeUrl?: string;
  qrCodeData?: string;
  
  // Payment Information
  stripeSessionId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentId?: string;
  
  // Status
  status: 'active' | 'inactive' | 'suspended';
  isVerified: boolean;
  
  // Admin Notes
  adminNotes?: string;
  lastLogin?: Timestamp;
}

// Registration Data Interface
export interface RegistrationData {
  role: 'player' | 'coach';
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  position?: string;
  playerTag?: string;
  jerseySize: string;
  experience?: string;
  coachingLevel?: string;
  certifications?: string;
  specialties?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  maxTeams?: number;
  waiverAccepted: boolean;
  parentGuardianName?: string;
  parentGuardianSignature?: string;
  waiverSignatureDate?: string;
  selectedPlan?: any;
  submittedAt: Timestamp;
}

export interface PricingPlan extends BaseDocument {
  // Plan Details
  title: string;
  subtitle: string;
  price: number;
  serviceFee: number;
  features: string[];
  popular: boolean;
  buttonText: string;
  buttonClass: string;
  itemType: 'jamboree' | 'season' | 'bundle' | 'assistant_coach' | 'head_coach';
  category: 'player' | 'coach';
  isActive: boolean;
}

// Collection names for Firestore
export const COLLECTIONS = {
  PLAYERS: 'players',
  COACHES: 'coaches',
  USER_PROFILES: 'user_profiles',
  TEAMS: 'teams',
  GAMES: 'games',
  SEASONS: 'seasons',
  LEAGUES: 'leagues',
  PAYMENTS: 'payments',
  REFUNDS: 'refunds',
  DISPUTES: 'disputes',
  CHECKOUT_SESSIONS: 'checkout_sessions',
  PLAN_SELECTIONS: 'plan_selections',
  SUBSCRIPTIONS: 'subscriptions',
  PAYMENT_METHODS: 'payment_methods',
  MARKETING_FUNNELS: 'marketing_funnels',
  FUNNEL_STEPS: 'funnel_steps',
  PLAYER_FUNNEL_STATUS: 'player_funnel_status',
  QR_CODES: 'qr_codes',
  NOTIFICATIONS: 'notifications',
  DRAFT_HISTORY: 'draft-history',
  SYSTEM_SETTINGS: 'system-settings',
  AUDIT_LOGS: 'audit-logs',
  COUPONS: 'coupons',
  SMS_OPT_INS: 'sms_opt_ins',
  MEAL_PLANS: 'meal_plans',
  MEAL_PLAN_ORDERS: 'meal_plan_orders',
  MEAL_PLAN_CATEGORIES: 'meal_plan_categories',
  PRICING: 'pricing',
  // Enhanced Flag Football League Collections
  LEADS: 'leads',
  ENHANCED_TEAMS: 'enhanced_teams',
  ENHANCED_PLAYERS: 'enhanced_players',
  JERSEY_QR_CODES: 'jersey_qr_codes',
  DRAFT_EVENTS: 'draft_events',
  ENHANCED_DRAFT_PICKS: 'enhanced_draft_picks',
  ENHANCED_LEADERBOARDS: 'enhanced_leaderboards',
  REFERRAL_TREES: 'referral_trees',
  UPSELL_CAMPAIGNS: 'upsell_campaigns',
  STAFF_KPIS: 'staff_kpis',
  ENHANCED_EVENTS: 'enhanced_events',
  ANALYTICS: 'analytics',
  CONSENT_RECORDS: 'consent_records',
  FACEBOOK_LINKS: 'facebook_links'
} as const;

// Subcollections
export const SUBCOLLECTIONS = {
  PLAYER_STATS: 'stats',
  PLAYER_PAYMENTS: 'payments',
  PLAYER_NOTIFICATIONS: 'notifications',
  TEAM_GAMES: 'games',
  FUNNEL_PARTICIPANTS: 'participants'
} as const;

// Helper types for common operations
export type PlayerWithTeam = Player & {
  team?: Team;
};

export type TeamWithPlayers = Team & {
  playerDetails?: Player[];
};

export type PaymentWithPlayer = Payment & {
  player?: Player;
};

export type CheckoutSessionWithPlan = CheckoutSession & {
  planDetails?: PlanSelection;
};

export type PaymentWithCheckout = Payment & {
  checkoutSession?: CheckoutSession;
};

// Database query helpers
export const getPlayersByTeam = (teamId: string) => ({
  collection: COLLECTIONS.PLAYERS,
  where: [['teamId', '==', teamId]]
});

export const getTeamsByLeague = (leagueId: string) => ({
  collection: COLLECTIONS.TEAMS,
  where: [['leagueId', '==', leagueId]]
});

export const getGamesBySeason = (seasonId: string) => ({
  collection: COLLECTIONS.GAMES,
  where: [['seasonId', '==', seasonId]]
});

export const getPendingPayments = () => ({
  collection: COLLECTIONS.PAYMENTS,
  where: [['status', '==', 'pending']]
});

export const getActiveCheckoutSessions = () => ({
  collection: COLLECTIONS.CHECKOUT_SESSIONS,
  where: [['status', 'in', ['created', 'active']]]
});

export const getCheckoutSessionByStripeId = (sessionId: string) => ({
  collection: COLLECTIONS.CHECKOUT_SESSIONS,
  where: [['sessionId', '==', sessionId]]
});

export const getPlanSelectionsByEmail = (email: string) => ({
  collection: COLLECTIONS.PLAN_SELECTIONS,
  where: [['customerEmail', '==', email]]
});

export const getCompletedGames = (seasonId: string) => ({
  collection: COLLECTIONS.GAMES,
  where: [['seasonId', '==', seasonId], ['status', '==', 'completed']],
  orderBy: [['actualDate', 'desc']]
});

// Refund Interface
export interface Refund extends BaseDocument {
  // Stripe Information
  stripeRefundId: string;
  stripeChargeId: string;
  paymentId?: string; // Reference to original payment
  
  // Refund Details
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'other';
  receiptNumber?: string;
  
  // Customer Information
  customerEmail?: string;
  customerName?: string;
  
  // Processing Information
  processedBy?: string; // Admin user ID who initiated refund
  processedAt?: Timestamp;
  
  // Metadata
  metadata?: { [key: string]: string };
  notes?: string;
}

// Dispute Interface
export interface Dispute extends BaseDocument {
  // Stripe Information
  stripeDisputeId: string;
  stripeChargeId: string;
  paymentId?: string; // Reference to original payment
  
  // Dispute Details
  amount: number;
  currency: string;
  status: 'warning_needs_response' | 'warning_under_review' | 'warning_closed' | 'needs_response' | 'under_review' | 'charge_refunded' | 'won' | 'lost';
  reason: 'duplicate' | 'fraudulent' | 'subscription_canceled' | 'product_unacceptable' | 'product_not_received' | 'unrecognized' | 'credit_not_processed' | 'general' | 'incorrect_account_details' | 'insufficient_funds' | 'bank_cannot_process' | 'debit_not_authorized' | 'customer_initiated';
  
  // Evidence and Response
  evidenceDetails?: {
    accessActivityLog?: string;
    billingAddress?: string;
    cancellationPolicy?: string;
    cancellationPolicyDisclosure?: string;
    cancellationRebuttal?: string;
    customerCommunication?: string;
    customerEmailAddress?: string;
    customerName?: string;
    customerPurchaseIp?: string;
    customerSignature?: string;
    duplicateChargeDocumentation?: string;
    duplicateChargeExplanation?: string;
    duplicateChargeId?: string;
    productDescription?: string;
    receipt?: string;
    refundPolicy?: string;
    refundPolicyDisclosure?: string;
    refundRefusalExplanation?: string;
    serviceDate?: string;
    serviceDocumentation?: string;
    shippingAddress?: string;
    shippingCarrier?: string;
    shippingDate?: string;
    shippingDocumentation?: string;
    shippingTrackingNumber?: string;
    uncategorizedFile?: string;
    uncategorizedText?: string;
  };
  
  // Important Dates
  evidenceDueBy?: Timestamp;
  submittedAt?: Timestamp;
  
  // Customer Information
  customerEmail?: string;
  customerName?: string;
  
  // Processing Information
  handledBy?: string; // Admin user ID handling dispute
  
  // Metadata
  metadata?: { [key: string]: string };
  notes?: string;
}

// SMS Opt-in Interface
export interface SMSOptIn extends BaseDocument {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  consent: boolean;
  marketingConsent: boolean;
  optInDate: Timestamp;
  status: 'active' | 'opted_out' | 'suspended';
  source: 'web_form' | 'registration' | 'manual' | 'api';
  ipAddress?: string;
  userAgent?: string;
  
  // Opt-out tracking
  optOutDate?: Timestamp;
  optOutMethod?: 'reply_stop' | 'web_form' | 'manual' | 'complaint';
  
  // Message tracking
  messagesSent: number;
  lastMessageSent?: Timestamp;
  
  // Compliance
  tcpaCompliant: boolean;
  consentText: string;
}

// Meal Plan Interface
export interface MealPlan extends BaseDocument {
  // Basic Information
  name: string;
  description: string;
  shortDescription?: string;
  
  // Pricing
  price: number;
  originalPrice?: number; // For showing discounts
  currency: 'USD';
  
  // Plan Details
  duration: number; // Number of days
  mealsPerDay: number;
  totalMeals: number;
  
  // Meal Categories
  categories: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: boolean;
  };
  
  // Dietary Options
  dietaryOptions: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    keto: boolean;
    lowCarb: boolean;
    highProtein: boolean;
    dairyFree: boolean;
    nutFree: boolean;
  };
  
  // Features and Benefits
  features: string[];
  benefits: string[];
  
  // Media
  imageUrl?: string;
  galleryImages?: string[];
  
  // Availability
  isActive: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  maxOrders?: number; // Maximum number of orders allowed
  currentOrders: number; // Current number of active orders
  
  // Scheduling
  availableStartDates?: Timestamp[];
  blackoutDates?: Timestamp[]; // Dates when plan is not available
  
  // Nutritional Information
  nutrition?: {
    caloriesPerDay: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
    sodiumMg: number;
  };
  
  // Sample Menu
  sampleMeals?: {
    day: number;
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string[];
  }[];
  
  // Admin Information
  createdBy: string; // Staff ID
  lastModifiedBy: string;
  
  // Status
  status: 'draft' | 'active' | 'inactive' | 'discontinued';
  
  // Sales Metrics
  salesStats: {
    totalSold: number;
    revenue: number;
    averageRating?: number;
    reviewCount: number;
  };
}

// Meal Plan Order Interface
export interface MealPlanOrder extends BaseDocument {
  // Customer Information
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Meal Plan Details
  mealPlanId: string;
  mealPlanName: string;
  planDuration: number;
  mealsPerDay: number;
  
  // Pricing
  planPrice: number;
  serviceFee?: number;
  deliveryFee?: number;
  totalAmount: number;
  
  // Delivery Information
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    instructions?: string;
  };
  
  // Schedule
  startDate: Timestamp;
  endDate: Timestamp;
  deliveryDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  deliveryTime: 'morning' | 'afternoon' | 'evening';
  
  // Dietary Preferences
  dietaryRestrictions?: string[];
  allergies?: string[];
  specialInstructions?: string;
  
  // Order Status
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  
  // Payment Information
  paymentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripeSessionId?: string;
  
  // Delivery Tracking
  deliveries: {
    date: Timestamp;
    status: 'scheduled' | 'out_for_delivery' | 'delivered' | 'failed' | 'rescheduled';
    deliveredAt?: Timestamp;
    deliveryNotes?: string;
    recipientName?: string;
    photoUrl?: string; // Proof of delivery
  }[];
  
  // Customer Feedback
  rating?: number; // 1-5 stars
  review?: string;
  reviewDate?: Timestamp;
  
  // Admin Notes
  adminNotes?: string;
  assignedTo?: string; // Staff ID responsible for order
}

// Meal Plan Category Interface
export interface MealPlanCategory extends BaseDocument {
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Admin
  createdBy: string;
}

// ========================================
// ENHANCED FLAG FOOTBALL LEAGUE INTERFACES
// ========================================

// Lead Management Interface
export interface Lead extends BaseDocument {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Lead Classification
  source: 'sms' | 'email' | 'referral' | 'event' | 'social' | 'website';
  status: 'prospect' | 'nurturing' | 'hot' | 'converted' | 'lost';
  score: number; // 0-100
  tags: string[];
  
  // Engagement Tracking
  lastContact: Timestamp;
  conversionProbability: number; // 0-1
  assignedStaff: string; // userId
  
  // Communication History
  notes: {
    timestamp: Timestamp;
    staffId: string;
    content: string;
    type: 'call' | 'email' | 'sms' | 'meeting' | 'other';
  }[];
  
  // Touchpoint Tracking
  touchpoints: {
    timestamp: Timestamp;
    channel: 'sms' | 'email' | 'call' | 'web' | 'social';
    campaign?: string;
    response?: 'positive' | 'negative' | 'neutral' | 'no-response';
  }[];
}

// Enhanced Team Interface
export interface EnhancedTeam extends BaseDocument {
  // Basic Information
  name: string;
  capacity: number;
  currentSize: number;
  waitlistSize: number;
  
  // Coaching Staff
  coachId: string;
  assistantCoaches: string[];
  
  // Team Status
  status: 'forming' | 'full' | 'draft-ready' | 'active' | 'inactive';
  draftOrder: number;
  division: string;
  homeField: string;
  
  // Branding
  teamColor: string;
  logoUrl?: string;
  qrCodeUrl?: string;
  
  // Social Media
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  
  // Performance Stats
  stats: {
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number;
    gamesPlayed: number;
    winPercentage: number;
  };
}

// Enhanced Player Interface
export interface EnhancedPlayer extends BaseDocument {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Timestamp;
  
  // Player Status
  status: 'prospect' | 'pending-payment' | 'paid-registered' | 'draft-pool' | 'team-assigned' | 'waitlist';
  position: 'quarterback' | 'rusher' | 'receiver' | 'defender' | 'flex';
  playerTag: 'free-agent' | 'draft-pick' | 'prospect' | 'meet-greet' | 'client' | 'veteran' | 'rookie';
  
  // Jersey Information
  jerseyNumber?: number;
  jerseySize: string;
  
  // Team Assignment
  teamId?: string;
  draftRound?: number;
  draftPick?: number;
  isDrafted: boolean;
  
  // Availability
  availability: {
    weekdays: string[];
    weekends: string[];
    timePreference: 'morning' | 'afternoon' | 'evening';
  };
  
  // Preferences
  preferences: {
    position: string[];
    teamStyle: 'competitive' | 'recreational' | 'social';
    notifications: {
      sms: boolean;
      email: boolean;
      push: boolean;
    };
  };
  
  // Profile & QR Code
  qrCodeUrl?: string;
  profileUrl?: string;
  
  // Performance Stats
  stats: {
    gamesPlayed: number;
    touchdowns: number;
    receptions: number;
    yards: number;
    tackles?: number;
    interceptions?: number;
  };
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Medical Information
  medicalInfo: {
    conditions: string;
    allergies: string;
    lastUpdated: Timestamp;
  };
  
  // Referral System
  referredBy?: string;
  referralCount: number;
}

// Jersey QR Code Interface
export interface JerseyQRCode extends BaseDocument {
  // Assignment
  playerId: string;
  teamId: string;
  jerseyNumber: number;
  
  // QR Code Details
  qrCodeUrl: string;
  landingPageUrl: string;
  
  // Tracking
  scanCount: number;
  lastScanned?: Timestamp;
  
  // Production Status
  printStatus: 'pending' | 'printed' | 'delivered' | 'active';
  vendorOrderId?: string;
  
  // Specifications
  specifications: {
    placement: string;
    size: string;
    color: string;
    material: string;
  };
}

// Draft Event Interface
export interface DraftEvent extends BaseDocument {
  // Event Details
  name: string;
  status: 'setup' | 'active' | 'paused' | 'completed';
  
  // Draft Configuration
  currentRound: number;
  currentPick: number;
  pickTimeLimit: number; // seconds
  
  // Participants
  teams: string[]; // team IDs
  draftOrder: string[]; // team IDs in draft order
  
  // Rules
  rules: {
    rounds: number;
    positionLimits: {
      quarterback: number;
      rusher: number;
      receiver: number;
      defender: number;
      flex: number;
    };
    tradingAllowed: boolean;
    autodraftEnabled: boolean;
  };
  
  // Timing
  startTime?: Timestamp;
  endTime?: Timestamp;
}

// Enhanced Draft Pick Interface
export interface EnhancedDraftPick extends BaseDocument {
  // Draft Context
  draftEventId: string;
  round: number;
  pick: number;
  overallPick: number;
  
  // Assignment
  teamId: string;
  selectedPlayerId?: string;
  
  // Status
  status: 'upcoming' | 'active' | 'completed' | 'skipped' | 'traded';
  pickTimestamp?: Timestamp;
  timeRemaining: number;
  
  // Trading
  tradedTo?: string;
}

// Enhanced Leaderboard Interface
export interface EnhancedLeaderboard extends BaseDocument {
  // Configuration
  category: 'stats' | 'referrals' | 'participation' | 'revenue' | 'attendance';
  period: 'daily' | 'weekly' | 'monthly' | 'season' | 'all-time';
  
  // Entries
  entries: {
    playerId: string;
    playerName: string;
    teamName?: string;
    value: number;
    rank: number;
    change: number;
    trend: 'up' | 'down' | 'same';
    avatar?: string;
    additionalInfo?: string;
  }[];
  
  // Display Settings
  displaySettings: {
    title: string;
    subtitle: string;
    showTop: number;
    updateFrequency: 'hourly' | 'daily' | 'weekly';
  };
  
  // Timestamps
  lastUpdated: Timestamp;
}

// Referral Tree Interface
export interface ReferralTree extends BaseDocument {
  // Root Referrer
  referrerId: string;
  
  // Referral Data
  referrals: {
    playerId: string;
    playerName: string;
    registrationDate: Timestamp;
    rewardEarned: number;
    status: 'active' | 'inactive';
  }[];
  
  // Metrics
  totalReferrals: number;
  totalRewards: number;
  level: number;
  
  // Status
  status: 'active' | 'inactive' | 'suspended';
  rewardsTier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// Upsell Campaign Interface
export interface UpsellCampaign extends BaseDocument {
  // Campaign Details
  name: string;
  targetAudience: string[];
  trigger: 'registration' | 'milestone' | 'seasonal' | 'manual' | 'behavior';
  
  // Offers
  offers: {
    productId: string;
    productName: string;
    originalPrice: number;
    discountPercent: number;
    finalPrice: number;
    expirationDays: number;
    conversionCount: number;
  }[];
  
  // Performance
  conversionRate: number;
  revenue: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  
  // Scheduling
  schedule: {
    delay: number; // hours
    reminderIntervals: number[]; // hours
    maxAttempts: number;
  };
  
  // Messaging
  messaging: {
    subject: string;
    channels: ('email' | 'sms')[];
    personalization: boolean;
  };
}

// Staff KPI Interface
export interface StaffKPI extends BaseDocument {
  // Staff Information
  staffId: string;
  role: 'registration' | 'jersey-qr' | 'meal-plan' | 'classes' | 'draft-stats' | 'general-manager';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  
  // Metrics
  metrics: {
    name: string;
    value: number;
    target: number;
    unit: 'count' | 'percentage' | 'currency';
    trend: 'up' | 'down' | 'stable';
    percentOfTarget: number;
  }[];
  
  // Goals
  goals: {
    name: string;
    target: number;
    current: number;
    deadline: Timestamp;
    status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  }[];
  
  // Performance
  performance: number; // Overall performance score 0-100
  
  // Achievements
  achievements: {
    name: string;
    description: string;
    earnedDate: Timestamp;
    badge: 'bronze' | 'silver' | 'gold';
  }[];
}

// Enhanced Event Interface
export interface EnhancedEvent extends BaseDocument {
  // Event Details
  name: string;
  type: 'jamboree' | 'draft' | 'game' | 'practice' | 'social';
  date: Timestamp;
  venue: string;
  
  // Status
  status: 'planning' | 'setup' | 'active' | 'completed' | 'cancelled';
  
  // Registrations
  registrations: {
    playerId: string;
    registrationTime: Timestamp;
    checkInTime?: Timestamp;
    paymentStatus: 'pending' | 'completed' | 'failed';
    method: 'online' | 'onsite';
    specialRequests?: string;
  }[];
  
  // Staff Assignment
  staff: {
    staffId: string;
    role: string;
    shiftStart: Timestamp;
    shiftEnd: Timestamp;
    responsibilities: string[];
  }[];
  
  // Equipment
  equipment: {
    item: string;
    quantity: number;
    status: 'reserved' | 'delivered' | 'setup' | 'returned';
    assignedTo?: string;
  }[];
  
  // Budget
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  
  // Attendance
  attendance: {
    expected: number;
    registered: number;
    checkedIn: number;
  };
}

// Analytics Interface
export interface Analytics extends BaseDocument {
  // Event Details
  eventType: 'registration' | 'payment' | 'scan' | 'referral' | 'upsell' | 'login' | 'page-view';
  userId?: string;
  sessionId?: string;
  
  // UTM Parameters
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  
  // Value
  value?: number;
  
  // Metadata
  metadata: {
    device?: string;
    browser?: string;
    location?: string;
    referrer?: string;
    conversionTime?: number;
    [key: string]: any;
  };
  
  // Timestamp
  timestamp: Timestamp;
}

// Consent Records Interface
export interface ConsentRecord extends BaseDocument {
  // User Information
  userId: string;
  consentType: 'sms' | 'email' | 'marketing' | 'analytics' | 'cookies' | 'data-processing';
  
  // Consent Details
  granted: boolean;
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
  
  // Method
  method: 'registration' | 'update' | 'withdrawal';
  version: string;
}


// Schedule Management Interface
export interface Schedule extends BaseDocument {
  // Game Information
  homeTeamId: string;
  awayTeamId: string;
  leagueId: string;
  
  // Game Details
  gameDate: Timestamp;
  gameTime: string; // Format: "HH:MM"
  duration: number; // in minutes
  
  // Location
  venue: string;
  field?: string;
  address?: string;
  
  // Game Status
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'postponed';
  
  // Scores (when completed)
  homeScore?: number;
  awayScore?: number;
  
  // Game Details
  week?: number;
  round?: number;
  gameType: 'regular' | 'playoff' | 'championship' | 'friendly';
  
  // Officials
  referees: string[]; // Array of referee IDs or names
  
  // Weather and Conditions
  weather?: string;
  temperature?: number;
  fieldConditions?: string;
  
  // Notifications
  notificationsSent: boolean;
  remindersSent: boolean;
  
  // Notes and Updates
  notes?: string;
  lastUpdated: Timestamp;
  updatedBy: string; // User ID who last updated
}

// Game Statistics Interface
export interface GameStats extends BaseDocument {
  // Game Reference
  scheduleId: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  
  // Game Summary
  finalScore: {
    home: number;
    away: number;
  };
  
  // Player Statistics
  playerStats: {
    playerId: string;
    teamId: string;
    stats: {
      goals?: number;
      assists?: number;
      saves?: number;
      fouls?: number;
      yellowCards?: number;
      redCards?: number;
      minutesPlayed?: number;
      [statName: string]: number | undefined;
    };
  }[];
  
  // Team Statistics
  teamStats: {
    [teamId: string]: {
      possession?: number;
      shots?: number;
      shotsOnTarget?: number;
      corners?: number;
      fouls?: number;
      cards?: number;
      [statName: string]: number | undefined;
    };
  };
  
  // Game Events
  events: {
    minute: number;
    type: 'goal' | 'card' | 'substitution' | 'foul' | 'other';
    playerId?: string;
    teamId: string;
    description: string;
  }[];
  
  // Match Officials
  referee: string;
  assistantReferees?: string[];
  
  // Metadata
  recordedBy: string; // User ID who recorded stats
  verifiedBy?: string; // User ID who verified stats
  isVerified: boolean;
}

// GoHighLevel Integration Interface
export interface GoHighLevelIntegration extends BaseDocument {
  // API Configuration
  apiToken: string; // Encrypted API token
  locationId: string; // GHL Location ID
  agencyId?: string; // GHL Agency ID (if applicable)
  
  // Integration Settings
  name: string; // Friendly name for this integration
  description?: string;
  isActive: boolean;
  
  // Sync Settings
  syncContacts: boolean;
  syncOpportunities: boolean;
  syncCalendars: boolean;
  syncPipelines: boolean;
  syncCampaigns: boolean;
  
  // Mapping Configuration
  contactMapping: {
    [localField: string]: string; // Maps local fields to GHL custom fields
  };
  
  // Pipeline Configuration
  defaultPipelineId?: string;
  defaultStageId?: string;
  
  // Webhook Configuration
  webhookUrl?: string;
  webhookSecret?: string;
  enableWebhooks: boolean;
  
  // Last Sync Information
  lastSyncAt?: Timestamp;
  lastSyncStatus: 'success' | 'error' | 'pending' | 'never';
  lastSyncError?: string;
  totalContactsSynced: number;
  totalOpportunitiesSynced: number;
  
  // Rate Limiting
  rateLimitRemaining?: number;
  rateLimitReset?: Timestamp;
  
  // Metadata
  createdBy: string; // Admin user ID who created this integration
  lastModifiedBy: string; // Admin user ID who last modified
}

// GoHighLevel Sync Log Interface
export interface GoHighLevelSyncLog extends BaseDocument {
  // Integration Reference
  integrationId: string;
  
  // Sync Details
  syncType: 'contacts' | 'opportunities' | 'calendars' | 'pipelines' | 'campaigns' | 'full';
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  
  // Sync Statistics
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  
  // Timing
  startedAt: Timestamp;
  completedAt?: Timestamp;
  duration?: number; // in milliseconds
  
  // Error Information
  errors: {
    recordId?: string;
    error: string;
    details?: any;
  }[];
  
  // Sync Summary
  summary?: {
    contactsCreated: number;
    contactsUpdated: number;
    opportunitiesCreated: number;
    opportunitiesUpdated: number;
    [key: string]: number;
  };
  
  // Metadata
  triggeredBy: string; // User ID or 'system' for automated syncs
  triggerType: 'manual' | 'scheduled' | 'webhook' | 'event';
}
