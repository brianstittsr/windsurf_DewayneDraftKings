import { Timestamp } from 'firebase/firestore';

// Enums
export enum UserRole {
  PLAYER = 'PLAYER',
  TRAINER = 'TRAINER',
  COACH = 'COACH',
  TEAM_CAPTAIN = 'TEAM_CAPTAIN',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN'
}

export enum PlayerTag {
  FREE_AGENT = 'FREE_AGENT',
  DRAFT_PICK = 'DRAFT_PICK',
  PROSPECT = 'PROSPECT',
  MEET_GREET = 'MEET_GREET',
  CLIENT = 'CLIENT'
}

export enum SportType {
  FLAG_FOOTBALL = 'FLAG_FOOTBALL',
  VOLLEYBALL = 'VOLLEYBALL',
  KICKBALL = 'KICKBALL',
  BASKETBALL = 'BASKETBALL'
}

export enum NotificationType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH'
}

// Base interface for all documents
interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User document (users collection)
export interface User extends BaseDocument {
  email: string;
  name?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  
  // Player specific fields
  playerTag?: PlayerTag;
  height?: number;
  weight?: number;
  dateOfBirth?: Timestamp;
  emergencyContact?: string;
  
  // Relations (stored as document references)
  trainerId?: string;
  accountabilityPartnerId?: string;
  
  // Billing
  stripeCustomerId?: string;
}

// Player Profile document (playerProfiles collection)
export interface PlayerProfile extends BaseDocument {
  userId: string;
  bio?: string;
  experience?: string;
  achievements?: string;
  goals?: string;
  qrCode?: string;
}

// Team document (teams collection)
export interface Team extends BaseDocument {
  name: string;
  sport: SportType;
  description?: string;
  avatar?: string;
  coachId: string;
  captainId: string;
}

// Team Member document (teamMembers collection)
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  joinedAt: Timestamp;
}

// Match document (matches collection)
export interface Match extends BaseDocument {
  homeTeamId: string;
  awayTeamId: string;
  sport: SportType;
  homeScore?: number;
  awayScore?: number;
  scheduledAt: Timestamp;
  playedAt?: Timestamp;
  location?: string;
}

// Workout document (workouts collection)
export interface Workout extends BaseDocument {
  userId: string;
  type: string;
  duration: number; // in minutes
  intensity?: string;
  caloriesBurned?: number;
  notes?: string;
  date: Timestamp;
}

// Player Metric document (playerMetrics collection)
export interface PlayerMetric {
  id: string;
  userId: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  steps?: number;
  sleepHours?: number;
  waterIntake?: number; // in liters
  date: Timestamp;
  createdAt: Timestamp;
}

// Notification document (notifications collection)
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  sent: boolean;
  sentAt?: Timestamp;
  createdAt: Timestamp;
}

// Subscription document (subscriptions collection)
export interface Subscription extends BaseDocument {
  userId: string;
  stripeSubscriptionId: string;
  status: string;
  priceId: string;
  currentPeriodEnd: Timestamp;
}

// Leaderboard Entry document (leaderboardEntries collection)
export interface LeaderboardEntry extends BaseDocument {
  userId: string;
  sport: SportType;
  category: string; // e.g., "most_workouts", "weight_loss", "calories_burned"
  value: number;
  period: string; // "weekly", "monthly", "all_time"
}

// Collection names constants
export const COLLECTIONS = {
  USERS: 'users',
  PLAYER_PROFILES: 'playerProfiles',
  TEAMS: 'teams',
  TEAM_MEMBERS: 'teamMembers',
  MATCHES: 'matches',
  WORKOUTS: 'workouts',
  PLAYER_METRICS: 'playerMetrics',
  NOTIFICATIONS: 'notifications',
  SUBSCRIPTIONS: 'subscriptions',
  LEADERBOARD_ENTRIES: 'leaderboardEntries'
} as const;
