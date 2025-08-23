// Conversion Tracking Service for Phase 1
import { db } from './firebase';
import { collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { SMSSubscriber, SMSMessage, SMS_COLLECTIONS } from './sms-schema';

export interface ConversionEvent {
  id?: string;
  subscriberId: string;
  eventType: 'click' | 'registration' | 'referral' | 'engagement';
  source: 'sms' | 'website' | 'social' | 'referral';
  messageId?: string;
  journeyId?: string;
  stepId?: string;
  value?: number; // Monetary value if applicable
  metadata?: { [key: string]: any };
  timestamp: Timestamp;
  createdAt: Timestamp;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface ConversionReport {
  totalConversions: number;
  conversionRate: number;
  conversionsByType: { [type: string]: number };
  conversionsBySource: { [source: string]: number };
  conversionsByJourney: { [journeyId: string]: number };
  funnel: ConversionFunnel[];
  revenue: number;
  averageTimeToConvert: number; // in hours
}

class ConversionTrackingService {
  
  // Track a conversion event
  async trackConversion(event: Omit<ConversionEvent, 'id' | 'createdAt'>): Promise<string> {
    try {
      const conversionData: Omit<ConversionEvent, 'id'> = {
        ...event,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'sms_conversions'), conversionData);

      // Update subscriber conversion stats
      await this.updateSubscriberConversionStats(event.subscriberId, event.eventType, event.value);

      return docRef.id;
    } catch (error) {
      console.error('Error tracking conversion:', error);
      throw error;
    }
  }

  // Track click-through from SMS
  async trackSMSClick(
    subscriberId: string, 
    messageId: string, 
    url: string, 
    journeyId?: string, 
    stepId?: string
  ): Promise<void> {
    try {
      await this.trackConversion({
        subscriberId,
        eventType: 'click',
        source: 'sms',
        messageId,
        journeyId,
        stepId,
        metadata: { url },
        timestamp: Timestamp.now()
      });

      // Update message click stats
      await updateDoc(doc(db, SMS_COLLECTIONS.SMS_MESSAGES, messageId), {
        clickedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Update subscriber click stats
      await updateDoc(doc(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS, subscriberId), {
        totalClicks: (await this.getSubscriberStat(subscriberId, 'totalClicks')) + 1,
        lastClick: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

    } catch (error) {
      console.error('Error tracking SMS click:', error);
    }
  }

  // Track registration conversion
  async trackRegistration(
    subscriberId: string, 
    registrationValue: number = 0,
    source: 'sms' | 'website' | 'social' | 'referral' = 'sms'
  ): Promise<void> {
    try {
      await this.trackConversion({
        subscriberId,
        eventType: 'registration',
        source,
        value: registrationValue,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error tracking registration:', error);
    }
  }

  // Track referral conversion
  async trackReferral(
    referrerSubscriberId: string,
    newSubscriberId: string,
    referralValue: number = 0
  ): Promise<void> {
    try {
      await this.trackConversion({
        subscriberId: referrerSubscriberId,
        eventType: 'referral',
        source: 'referral',
        value: referralValue,
        metadata: { newSubscriberId },
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error tracking referral:', error);
    }
  }

  // Get conversion report for date range
  async getConversionReport(startDate: Date, endDate: Date): Promise<ConversionReport> {
    try {
      const conversionsQuery = query(
        collection(db, 'sms_conversions'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      );

      const conversionsSnapshot = await getDocs(conversionsQuery);
      const conversions = conversionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConversionEvent[];

      // Get total subscribers for conversion rate calculation
      const subscribersSnapshot = await getDocs(collection(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS));
      const totalSubscribers = subscribersSnapshot.size;

      const totalConversions = conversions.length;
      const conversionRate = totalSubscribers > 0 ? (totalConversions / totalSubscribers) * 100 : 0;

      // Group conversions by type
      const conversionsByType: { [type: string]: number } = {};
      conversions.forEach(conv => {
        conversionsByType[conv.eventType] = (conversionsByType[conv.eventType] || 0) + 1;
      });

      // Group conversions by source
      const conversionsBySource: { [source: string]: number } = {};
      conversions.forEach(conv => {
        conversionsBySource[conv.source] = (conversionsBySource[conv.source] || 0) + 1;
      });

      // Group conversions by journey
      const conversionsByJourney: { [journeyId: string]: number } = {};
      conversions.forEach(conv => {
        if (conv.journeyId) {
          conversionsByJourney[conv.journeyId] = (conversionsByJourney[conv.journeyId] || 0) + 1;
        }
      });

      // Calculate revenue
      const revenue = conversions.reduce((sum, conv) => sum + (conv.value || 0), 0);

      // Calculate average time to convert (simplified)
      const avgTimeToConvert = await this.calculateAverageTimeToConvert(conversions);

      // Build conversion funnel
      const funnel = await this.buildConversionFunnel(startDate, endDate);

      return {
        totalConversions,
        conversionRate,
        conversionsByType,
        conversionsBySource,
        conversionsByJourney,
        funnel,
        revenue,
        averageTimeToConvert: avgTimeToConvert
      };

    } catch (error) {
      console.error('Error getting conversion report:', error);
      return {
        totalConversions: 0,
        conversionRate: 0,
        conversionsByType: {},
        conversionsBySource: {},
        conversionsByJourney: {},
        funnel: [],
        revenue: 0,
        averageTimeToConvert: 0
      };
    }
  }

  // Build conversion funnel analysis
  private async buildConversionFunnel(startDate: Date, endDate: Date): Promise<ConversionFunnel[]> {
    try {
      // Get subscribers in date range
      const subscribersQuery = query(
        collection(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      );

      const subscribersSnapshot = await getDocs(subscribersQuery);
      const subscribers = subscribersSnapshot.docs.map(doc => doc.data() as SMSSubscriber);

      const totalSubscribers = subscribers.length;
      
      // Define funnel stages
      const stages = [
        {
          stage: 'SMS Subscribers',
          count: totalSubscribers,
          filter: () => true
        },
        {
          stage: 'Message Recipients',
          count: 0,
          filter: (sub: SMSSubscriber) => (sub.totalMessagesSent || 0) > 0
        },
        {
          stage: 'Engaged Users',
          count: 0,
          filter: (sub: SMSSubscriber) => (sub.totalReplies || 0) > 0 || (sub.totalClicks || 0) > 0
        },
        {
          stage: 'Active Clickers',
          count: 0,
          filter: (sub: SMSSubscriber) => (sub.totalClicks || 0) > 0
        }
      ];

      // Calculate counts for each stage
      stages.forEach((stage, index) => {
        if (index === 0) return; // First stage already set
        stage.count = subscribers.filter(stage.filter).length;
      });

      // Calculate conversion and drop-off rates
      const funnel: ConversionFunnel[] = stages.map((stage, index) => {
        const prevCount = index > 0 ? stages[index - 1].count : totalSubscribers;
        const conversionRate = prevCount > 0 ? (stage.count / prevCount) * 100 : 0;
        const dropOffRate = 100 - conversionRate;

        return {
          stage: stage.stage,
          count: stage.count,
          conversionRate,
          dropOffRate
        };
      });

      return funnel;

    } catch (error) {
      console.error('Error building conversion funnel:', error);
      return [];
    }
  }

  // Calculate average time to convert
  private async calculateAverageTimeToConvert(conversions: ConversionEvent[]): Promise<number> {
    try {
      const conversionTimes: number[] = [];

      for (const conversion of conversions) {
        // Get subscriber's opt-in date
        const subscriberDoc = await getDocs(
          query(
            collection(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS),
            where('__name__', '==', conversion.subscriberId)
          )
        );

        if (!subscriberDoc.empty) {
          const subscriber = subscriberDoc.docs[0].data() as SMSSubscriber;
          if (subscriber.optInDate) {
            const timeToConvert = conversion.timestamp.toMillis() - subscriber.optInDate.toMillis();
            conversionTimes.push(timeToConvert / (1000 * 60 * 60)); // Convert to hours
          }
        }
      }

      if (conversionTimes.length === 0) return 0;

      const avgTime = conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length;
      return Math.round(avgTime * 100) / 100; // Round to 2 decimal places

    } catch (error) {
      console.error('Error calculating average time to convert:', error);
      return 0;
    }
  }

  // Update subscriber conversion statistics
  private async updateSubscriberConversionStats(
    subscriberId: string, 
    eventType: string, 
    value?: number
  ): Promise<void> {
    try {
      const subscriberRef = doc(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS, subscriberId);
      
      const updateData: any = {
        updatedAt: Timestamp.now()
      };

      switch (eventType) {
        case 'click':
          updateData.totalClicks = (await this.getSubscriberStat(subscriberId, 'totalClicks')) + 1;
          updateData.lastClick = Timestamp.now();
          break;
        case 'registration':
          updateData.hasRegistered = true;
          updateData.registrationDate = Timestamp.now();
          if (value) updateData.registrationValue = value;
          break;
        case 'referral':
          updateData.totalReferrals = (await this.getSubscriberStat(subscriberId, 'totalReferrals')) + 1;
          updateData.lastReferral = Timestamp.now();
          if (value) updateData.referralValue = (await this.getSubscriberStat(subscriberId, 'referralValue')) + value;
          break;
      }

      await updateDoc(subscriberRef, updateData);

    } catch (error) {
      console.error('Error updating subscriber conversion stats:', error);
    }
  }

  // Helper to get subscriber stat
  private async getSubscriberStat(subscriberId: string, field: string): Promise<number> {
    try {
      const subscriberDoc = await getDocs(
        query(
          collection(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS),
          where('__name__', '==', subscriberId)
        )
      );

      if (!subscriberDoc.empty) {
        return subscriberDoc.docs[0].data()[field] || 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // Get top performing journeys by conversion
  async getTopPerformingJourneys(limit: number = 10): Promise<Array<{
    journeyId: string;
    conversions: number;
    conversionRate: number;
    revenue: number;
  }>> {
    try {
      const conversionsSnapshot = await getDocs(collection(db, 'sms_conversions'));
      const conversions = conversionsSnapshot.docs.map(doc => doc.data() as ConversionEvent);

      const journeyStats: { [journeyId: string]: {
        conversions: number;
        revenue: number;
        subscribers: Set<string>;
      }} = {};

      conversions.forEach(conv => {
        if (conv.journeyId) {
          if (!journeyStats[conv.journeyId]) {
            journeyStats[conv.journeyId] = {
              conversions: 0,
              revenue: 0,
              subscribers: new Set()
            };
          }
          
          journeyStats[conv.journeyId].conversions++;
          journeyStats[conv.journeyId].revenue += conv.value || 0;
          journeyStats[conv.journeyId].subscribers.add(conv.subscriberId);
        }
      });

      const results = Object.entries(journeyStats)
        .map(([journeyId, stats]) => ({
          journeyId,
          conversions: stats.conversions,
          conversionRate: (stats.conversions / stats.subscribers.size) * 100,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.conversions - a.conversions)
        .slice(0, limit);

      return results;

    } catch (error) {
      console.error('Error getting top performing journeys:', error);
      return [];
    }
  }
}

export const conversionTrackingService = new ConversionTrackingService();
export default ConversionTrackingService;
