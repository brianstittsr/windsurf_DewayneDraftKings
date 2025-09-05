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
  
  // Registration Information
  registrationDate: Timestamp;
  registrationStatus: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'overdue';
  
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
  
  // Registration Information
  registrationDate: Timestamp;
  registrationStatus: 'pending' | 'confirmed' | 'cancelled';
  isActive: boolean;
  
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
  };
  
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
  };
  
  // Stripe Integration
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripeSessionId?: string;
  
  // BNPL Integration
  klarnaOrderId?: string;
  affirmChargeId?: string;
  
  // Payment Status
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  paidAt?: Timestamp;
  failureReason?: string;
  
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

// Collection names for Firestore
export const COLLECTIONS = {
  PLAYERS: 'players',
  COACHES: 'coaches',
  TEAMS: 'teams',
  GAMES: 'games',
  PAYMENTS: 'payments',
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
  AUDIT_LOGS: 'audit-logs'
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

// Database query helpers
export const getPlayersByTeam = (teamId: string) => ({
  collection: COLLECTIONS.PLAYERS,
  where: [['teamId', '==', teamId]]
});

export const getActiveLeaderboards = () => ({
  collection: COLLECTIONS.LEADERBOARDS,
  where: [['isPublic', '==', true], ['displayOnHomepage', '==', true]]
});

export const getPendingPayments = () => ({
  collection: COLLECTIONS.PAYMENTS,
  where: [['status', '==', 'pending']]
});

export const getUpcomingEvents = () => ({
  collection: COLLECTIONS.EVENTS,
  where: [['status', '==', 'scheduled']],
  orderBy: [['startTime', 'asc']]
});
