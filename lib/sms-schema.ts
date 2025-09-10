// SMS Automation Schema for Phase 1
import { Timestamp } from 'firebase/firestore';

// Base interface for SMS-related documents
interface BaseSMSDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// SMS Subscriber - simplified for Phase 1
export interface SMSSubscriber extends BaseSMSDocument {
  // Basic Contact Info
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  
  // SMS Preferences
  isOptedIn: boolean;
  optInDate: Timestamp;
  optOutDate?: Timestamp;
  
  // Journey Tracking
  currentJourneyId?: string;
  currentStep: number;
  
  // Conversion Tracking
  source: 'website' | 'referral' | 'social' | 'manual' | 'other';
  referredBy?: string;
  
  // Engagement Metrics
  totalMessagesSent: number;
  totalMessagesDelivered: number;
  totalReplies: number;
  totalClicks: number;
  lastEngagement?: Timestamp;
  lastReply?: Timestamp;
  lastClick?: Timestamp;
}

// SMS Journey - automated message sequences
export interface SMSJourney extends BaseSMSDocument {
  name: string;
  description: string;
  type: 'welcome' | 'reminder' | 'feedback' | 'referral' | 'promotional';
  
  // Journey Configuration
  isActive: boolean;
  steps: SMSJourneyStep[];
  
  // Targeting
  targetAudience: string[]; // conditions for who receives this journey
  
  // Performance Metrics
  stats: {
    totalSubscribers: number;
    completedJourney: number;
    optedOut: number;
    conversionRate: number;
  };
}

// Individual steps in an SMS journey
export interface SMSJourneyStep {
  id: string;
  order: number;
  name: string;
  messageTemplate: string;
  delayHours: number; // delay before sending this step
  
  // Conditions
  conditions?: string[]; // conditions to proceed to this step
  
  // Call-to-Action
  cta?: {
    text: string;
    url?: string;
    action: 'reply' | 'click' | 'call' | 'visit';
  };
  
  // Performance
  stats: {
    sent: number;
    delivered: number;
    failed: number;
    replied: number;
    clicked: number;
  };
}

// SMS Message - individual message records
export interface SMSMessage extends BaseSMSDocument {
  // Recipient Info
  subscriberId: string;
  phone: string;
  
  // Message Content
  content: string;
  journeyId?: string;
  stepId?: string;
  
  // Twilio Integration
  twilioSid?: string;
  twilioStatus: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  twilioErrorCode?: string;
  twilioErrorMessage?: string;
  
  // Timing
  scheduledFor?: Timestamp;
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  
  // Engagement
  replied: boolean;
  replyContent?: string;
  replyAt?: Timestamp;
  
  // Conversion Tracking
  clicked: boolean;
  clickedAt?: Timestamp;
  convertedAction?: string;
  convertedAt?: Timestamp;
}

// SMS Campaign - for one-off messages
export interface SMSCampaign extends BaseSMSDocument {
  name: string;
  description: string;
  messageContent: string;
  
  // Targeting
  targetAudience: string[];
  estimatedRecipients: number;
  
  // Scheduling
  scheduledFor?: Timestamp;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  
  // Performance
  stats: {
    sent: number;
    delivered: number;
    failed: number;
    replied: number;
    clicked: number;
    optedOut: number;
  };
  
  // Sent to
  recipients: string[]; // subscriber IDs
}

// SMS Analytics - aggregated metrics
export interface SMSAnalytics extends BaseSMSDocument {
  date: Timestamp;
  
  // Message Metrics
  totalMessagesSent: number;
  totalMessagesDelivered: number;
  totalMessagesFailed: number;
  deliveryRate: number;
  
  // Engagement Metrics
  totalReplies: number;
  totalOptOuts: number;
  replyRate: number;
  optOutRate: number;
  
  // Conversion Metrics
  totalClicks: number;
  clickThroughRate: number;
  
  // Subscriber Metrics
  activeSubscribers: number;
  
  // Journey Performance
  conversionsByJourney: { [journeyId: string]: number };
}

// SMS Template - reusable message templates
export interface SMSTemplate extends BaseSMSDocument {
  name: string;
  category: 'welcome' | 'reminder' | 'feedback' | 'promotional' | 'system';
  content: string;
  variables: string[]; // placeholders like {firstName}, {link}
  
  // Usage tracking
  timesUsed: number;
  lastUsed?: Timestamp;
  
  // Performance when used
  avgDeliveryRate: number;
  avgReplyRate: number;
}

// Collection names for SMS features
export const SMS_COLLECTIONS = {
  SMS_SUBSCRIBERS: 'sms-subscribers',
  SMS_JOURNEYS: 'sms-journeys',
  SMS_MESSAGES: 'sms-messages',
  SMS_CAMPAIGNS: 'sms-campaigns',
  SMS_ANALYTICS: 'sms-analytics',
  SMS_TEMPLATES: 'sms-templates'
} as const;

// Helper types
export type SMSSubscriberWithMessages = SMSSubscriber & {
  recentMessages?: SMSMessage[];
};

export type SMSJourneyWithStats = SMSJourney & {
  currentSubscribers?: number;
  recentPerformance?: {
    deliveryRate: number;
    replyRate: number;
  };
};

// Query helpers for SMS operations
export const getSMSSubscribersByStatus = (isOptedIn: boolean) => ({
  collection: SMS_COLLECTIONS.SMS_SUBSCRIBERS,
  where: [['isOptedIn', '==', isOptedIn]]
});

export const getActiveSMSJourneys = () => ({
  collection: SMS_COLLECTIONS.SMS_JOURNEYS,
  where: [['isActive', '==', true]]
});

export const getPendingSMSMessages = () => ({
  collection: SMS_COLLECTIONS.SMS_MESSAGES,
  where: [['twilioStatus', '==', 'queued']],
  orderBy: [['scheduledFor', 'asc']]
});

export const getSMSMessagesBySubscriber = (subscriberId: string) => ({
  collection: SMS_COLLECTIONS.SMS_MESSAGES,
  where: [['subscriberId', '==', subscriberId]],
  orderBy: [['createdAt', 'desc']]
});
