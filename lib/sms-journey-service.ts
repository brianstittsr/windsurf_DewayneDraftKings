// SMS Journey Automation Service for Phase 1
import { db } from './firebase';
import { collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { SMSJourney, SMSJourneyStep, SMSSubscriber, SMS_COLLECTIONS } from './sms-schema';
import { twilioService } from './twilio-service';

class SMSJourneyService {
  
  // Create a new SMS journey
  async createJourney(journeyData: Omit<SMSJourney, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const journey: Omit<SMSJourney, 'id'> = {
      ...journeyData,
      stats: {
        totalSubscribers: 0,
        completedJourney: 0,
        optedOut: 0,
        conversionRate: 0
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, SMS_COLLECTIONS.SMS_JOURNEYS), journey);
    return docRef.id;
  }

  // Start a subscriber on a journey
  async startSubscriberJourney(subscriberId: string, journeyId: string): Promise<void> {
    try {
      // Update subscriber with journey info
      await updateDoc(doc(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS, subscriberId), {
        currentJourneyId: journeyId,
        currentStep: 0,
        updatedAt: Timestamp.now()
      });

      // Update journey stats
      await this.updateJourneyStats(journeyId, 'started');

      // Schedule first step
      await this.scheduleNextStep(subscriberId, journeyId, 0);
    } catch (error) {
      console.error('Error starting subscriber journey:', error);
    }
  }

  // Schedule the next step in a journey
  async scheduleNextStep(subscriberId: string, journeyId: string, currentStep: number): Promise<void> {
    try {
      // Get journey details
      const journeyDoc = await getDocs(
        query(collection(db, SMS_COLLECTIONS.SMS_JOURNEYS), where('__name__', '==', journeyId))
      );

      if (journeyDoc.empty) return;

      const journey = journeyDoc.docs[0].data() as SMSJourney;
      const nextStepIndex = currentStep;

      if (nextStepIndex >= journey.steps.length) {
        // Journey completed
        await this.completeSubscriberJourney(subscriberId, journeyId);
        return;
      }

      const step = journey.steps[nextStepIndex];
      
      // Get subscriber details
      const subscriberDoc = await getDocs(
        query(collection(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS), where('__name__', '==', subscriberId))
      );

      if (subscriberDoc.empty) return;

      const subscriber = subscriberDoc.docs[0].data() as SMSSubscriber;

      // Check if subscriber is still opted in
      if (!subscriber.isOptedIn) return;

      // Calculate send time
      const sendTime = new Date();
      sendTime.setHours(sendTime.getHours() + step.delayHours);

      // For immediate messages (delayHours = 0), send now
      if (step.delayHours === 0) {
        await this.sendJourneyMessage(subscriberId, journeyId, step, subscriber);
      } else {
        // For delayed messages, you would typically use a job queue
        // For now, we'll simulate with a simple timeout (not production-ready)
        setTimeout(async () => {
          await this.sendJourneyMessage(subscriberId, journeyId, step, subscriber);
        }, step.delayHours * 60 * 60 * 1000); // Convert hours to milliseconds
      }
    } catch (error) {
      console.error('Error scheduling next step:', error);
    }
  }

  // Send a journey message
  async sendJourneyMessage(
    subscriberId: string, 
    journeyId: string, 
    step: SMSJourneyStep, 
    subscriber: SMSSubscriber
  ): Promise<void> {
    try {
      // Personalize message content
      let messageContent = step.messageTemplate;
      messageContent = messageContent.replace('{firstName}', subscriber.firstName || 'there');
      messageContent = messageContent.replace('{lastName}', subscriber.lastName || '');
      
      // Add CTA if present
      if (step.cta) {
        messageContent += `\n\n${step.cta.text}`;
        if (step.cta.url) {
          messageContent += ` ${step.cta.url}`;
        }
      }

      // Send SMS
      await twilioService.sendSMS(
        subscriber.phone,
        messageContent,
        subscriberId,
        journeyId,
        step.id
      );

      // Update step stats
      await this.updateStepStats(journeyId, step.id, 'sent');

      // Update subscriber progress
      await updateDoc(doc(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS, subscriberId), {
        currentStep: step.order + 1,
        lastMessageSent: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Schedule next step
      await this.scheduleNextStep(subscriberId, journeyId, step.order + 1);
    } catch (error) {
      console.error('Error sending journey message:', error);
    }
  }

  // Complete a subscriber's journey
  async completeSubscriberJourney(subscriberId: string, journeyId: string): Promise<void> {
    try {
      // Update subscriber
      await updateDoc(doc(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS, subscriberId), {
        currentJourneyId: null,
        currentStep: 0,
        updatedAt: Timestamp.now()
      });

      // Update journey stats
      await this.updateJourneyStats(journeyId, 'completed');
    } catch (error) {
      console.error('Error completing subscriber journey:', error);
    }
  }

  // Update journey statistics
  async updateJourneyStats(journeyId: string, action: 'started' | 'completed' | 'optedOut'): Promise<void> {
    try {
      const journeyRef = doc(db, SMS_COLLECTIONS.SMS_JOURNEYS, journeyId);
      
      // This is a simplified update - in production, you'd want atomic updates
      const journeyDoc = await getDocs(
        query(collection(db, SMS_COLLECTIONS.SMS_JOURNEYS), where('__name__', '==', journeyId))
      );

      if (!journeyDoc.empty) {
        const journey = journeyDoc.docs[0].data() as SMSJourney;
        const stats = { ...journey.stats };

        switch (action) {
          case 'started':
            stats.totalSubscribers += 1;
            break;
          case 'completed':
            stats.completedJourney += 1;
            break;
          case 'optedOut':
            stats.optedOut += 1;
            break;
        }

        // Calculate conversion rate
        if (stats.totalSubscribers > 0) {
          stats.conversionRate = (stats.completedJourney / stats.totalSubscribers) * 100;
        }

        await updateDoc(journeyRef, {
          stats,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error updating journey stats:', error);
    }
  }

  // Update step statistics
  async updateStepStats(journeyId: string, stepId: string, action: 'sent' | 'delivered' | 'failed' | 'replied' | 'clicked'): Promise<void> {
    try {
      // This is a simplified implementation
      // In production, you'd want to store step stats separately or use atomic updates
      console.log(`Step ${stepId} in journey ${journeyId}: ${action}`);
    } catch (error) {
      console.error('Error updating step stats:', error);
    }
  }

  // Get predefined journey templates
  static getJourneyTemplates(): Omit<SMSJourney, 'id' | 'createdAt' | 'updatedAt' | 'stats'>[] {
    return [
      {
        name: 'Welcome Sequence',
        description: 'Welcome new subscribers and introduce the league',
        type: 'welcome',
        isActive: true,
        targetAudience: ['new_subscriber'],
        steps: [
          {
            id: 'welcome-1',
            order: 0,
            name: 'Immediate Welcome',
            messageTemplate: 'Hi {firstName}! 🏈 Welcome to DraftKings League! You\'re now signed up for updates about registration, drafts, and games. Reply STOP to opt out anytime.',
            delayHours: 0,
            stats: { sent: 0, delivered: 0, failed: 0, replied: 0, clicked: 0 }
          },
          {
            id: 'welcome-2',
            order: 1,
            name: 'League Info',
            messageTemplate: 'Hey {firstName}! 🏆 Here\'s what to expect: 20 teams, NFL-style draft, and epic games leading to our Jamboree championship! Registration opens soon.',
            delayHours: 24,
            stats: { sent: 0, delivered: 0, failed: 0, replied: 0, clicked: 0 }
          },
          {
            id: 'welcome-3',
            order: 2,
            name: 'Call to Action',
            messageTemplate: 'Ready to dominate the field? 💪 Follow us for updates and behind-the-scenes content!',
            delayHours: 72,
            cta: {
              text: 'Follow us here:',
              url: 'https://facebook.com/draftkingsleague',
              action: 'click'
            },
            stats: { sent: 0, delivered: 0, failed: 0, replied: 0, clicked: 0 }
          }
        ]
      },
      {
        name: 'Registration Reminders',
        description: 'Remind subscribers about registration deadlines',
        type: 'reminder',
        isActive: true,
        targetAudience: ['not_registered'],
        steps: [
          {
            id: 'reg-reminder-1',
            order: 0,
            name: 'First Reminder',
            messageTemplate: 'Hey {firstName}! ⏰ Registration for DraftKings League is now OPEN! Secure your spot before we fill up. Only 500 spots available!',
            delayHours: 0,
            cta: {
              text: 'Register now:',
              url: 'https://draftkingsleague.com/register',
              action: 'click'
            },
            stats: { sent: 0, delivered: 0, failed: 0, replied: 0, clicked: 0 }
          },
          {
            id: 'reg-reminder-2',
            order: 1,
            name: 'Urgency Reminder',
            messageTemplate: 'Last chance {firstName}! 🚨 Registration closes in 48 hours. Don\'t miss out on the most epic flag football season yet!',
            delayHours: 168, // 1 week later
            cta: {
              text: 'Register before it\'s too late:',
              url: 'https://draftkingsleague.com/register',
              action: 'click'
            },
            stats: { sent: 0, delivered: 0, failed: 0, replied: 0, clicked: 0 }
          }
        ]
      },
      {
        name: 'Feedback Collection',
        description: 'Collect feedback and encourage referrals',
        type: 'feedback',
        isActive: true,
        targetAudience: ['active_subscriber'],
        steps: [
          {
            id: 'feedback-1',
            order: 0,
            name: 'Experience Check',
            messageTemplate: 'Hey {firstName}! How\'s your DraftKings League experience so far? Reply with a 1-10 rating!',
            delayHours: 0,
            stats: { sent: 0, delivered: 0, failed: 0, replied: 0, clicked: 0 }
          },
          {
            id: 'feedback-2',
            order: 1,
            name: 'Referral Request',
            messageTemplate: 'Thanks for the feedback! 🙏 Know someone who\'d love flag football? Refer them and you both get a bonus when they register!',
            delayHours: 24,
            cta: {
              text: 'Share the league:',
              url: 'https://draftkingsleague.com/refer',
              action: 'click'
            },
            stats: { sent: 0, delivered: 0, failed: 0, replied: 0, clicked: 0 }
          }
        ]
      }
    ];
  }
}

export const smsJourneyService = new SMSJourneyService();
export default SMSJourneyService;
