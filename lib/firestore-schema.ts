// Firestore Database Schema for DraftKings League Management System
import { Timestamp } from 'firebase/firestore';

// Base interface for all documents
interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  division: 'men' | 'women' | 'mixed';
  coachId: string;
  coachName: string;
  
  // Roster Management
  players: string[]; // Array of Player IDs
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
  sport: 'flag_football' | 'basketball' | 'soccer' | 'volleyball' | 'other';
  
  // League Configuration
  maxTeams: number;
  maxPlayersPerTeam: number;
  gameLength: number; // minutes
  
  // Current Season
  currentSeasonId?: string;
  
  // League Rules
  rules: {
    overtimeRules?: string;
    scoringSystem: string;
    playerEligibility: string;
  };
  
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
  REFERRAL_TREES: 'referral-trees',
  SYSTEM_SETTINGS: 'system-settings',
  AUDIT_LOGS: 'audit-logs',
  COUPONS: 'coupons',
  SMS_OPT_INS: 'sms_opt_ins'
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
