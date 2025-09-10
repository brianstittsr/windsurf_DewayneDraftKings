// Twilio SMS Service for Phase 1
import { Twilio } from 'twilio';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { SMSMessage, SMSSubscriber, SMS_COLLECTIONS } from './sms-schema';

class TwilioSMSService {
  private client: Twilio | null;
  private fromNumber: string;
  private isConfigured: boolean;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    this.isConfigured = !!(accountSid && authToken && phoneNumber);
    
    if (this.isConfigured) {
      this.client = new Twilio(accountSid!, authToken!);
      this.fromNumber = phoneNumber!;
    } else {
      this.client = null;
      this.fromNumber = '';
      console.warn('Twilio not configured - SMS functionality disabled. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.local');
    }
  }

  // Send individual SMS message
  async sendSMS(
    to: string,
    message: string,
    subscriberId?: string,
    journeyId?: string,
    stepId?: string
  ): Promise<SMSMessage> {
    try {
      let twilioMessage: any = null;
      
      if (this.isConfigured && this.client) {
        // Send via Twilio
        twilioMessage = await this.client.messages.create({
          body: message,
          from: this.fromNumber,
          to: to
        });
      } else {
        // Simulate message for development
        console.log(`[SIMULATED SMS] To: ${to}, Message: ${message}`);
        twilioMessage = {
          sid: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'sent'
        };
      }

      // Create SMS message record
      const smsMessage: Omit<SMSMessage, 'id'> = {
        subscriberId: subscriberId || '',
        phone: to,
        content: message,
        journeyId,
        stepId,
        twilioSid: twilioMessage.sid,
        twilioStatus: twilioMessage.status as any,
        sentAt: Timestamp.now(),
        replied: false,
        clicked: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, SMS_COLLECTIONS.SMS_MESSAGES), smsMessage);
      
      // Update subscriber stats
      if (subscriberId) {
        await this.updateSubscriberStats(subscriberId, 'sent');
      }

      return { ...smsMessage, id: docRef.id };
    } catch (error) {
      console.error('Error sending SMS:', error);
      
      // Create failed message record
      const failedMessage: Omit<SMSMessage, 'id'> = {
        subscriberId: subscriberId || '',
        phone: to,
        content: message,
        journeyId,
        stepId,
        twilioStatus: 'failed',
        twilioErrorMessage: error instanceof Error ? error.message : 'Unknown error',
        replied: false,
        clicked: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, SMS_COLLECTIONS.SMS_MESSAGES), failedMessage);
      return { ...failedMessage, id: docRef.id };
    }
  }

  // Send bulk SMS messages
  async sendBulkSMS(
    recipients: { phone: string; subscriberId?: string; message: string }[],
    journeyId?: string,
    stepId?: string
  ): Promise<SMSMessage[]> {
    const results: SMSMessage[] = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSMS(
        recipient.phone,
        recipient.message,
        recipient.subscriberId,
        journeyId,
        stepId
      );
      results.push(result);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Update message status from Twilio webhook
  async updateMessageStatus(
    twilioSid: string,
    status: string,
    errorCode?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      // Find message by Twilio SID
      const messagesRef = collection(db, SMS_COLLECTIONS.SMS_MESSAGES);
      const q = query(messagesRef, where('twilioSid', '==', twilioSid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const messageDoc = querySnapshot.docs[0];
        const updateData: any = {
          twilioStatus: status,
          updatedAt: Timestamp.now()
        };
        
        if (status === 'delivered') {
          updateData.deliveredAt = Timestamp.now();
        }
        
        if (errorCode) {
          updateData.twilioErrorCode = errorCode;
        }
        
        if (errorMessage) {
          updateData.twilioErrorMessage = errorMessage;
        }
        
        await updateDoc(doc(db, SMS_COLLECTIONS.SMS_MESSAGES, messageDoc.id), updateData);
        
        // Update subscriber stats
        const messageData = messageDoc.data() as SMSMessage;
        if (messageData.subscriberId) {
          if (status === 'delivered') {
            await this.updateSubscriberStats(messageData.subscriberId, 'delivered');
          } else if (status === 'failed' || status === 'undelivered') {
            await this.updateSubscriberStats(messageData.subscriberId, 'failed');
          }
        }
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }

  // Handle incoming SMS replies
  async handleIncomingSMS(
    from: string,
    body: string,
    twilioSid: string
  ): Promise<void> {
    try {
      // Find subscriber by phone number
      const subscribersRef = collection(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS);
      const q = query(subscribersRef, where('phone', '==', from));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const subscriberDoc = querySnapshot.docs[0];
        const subscriberId = subscriberDoc.id;
        
        // Find the most recent message to this subscriber
        const messagesRef = collection(db, SMS_COLLECTIONS.SMS_MESSAGES);
        const messageQuery = query(
          messagesRef,
          where('subscriberId', '==', subscriberId),
          where('phone', '==', from)
        );
        const messageSnapshot = await getDocs(messageQuery);
        
        if (!messageSnapshot.empty) {
          // Update the most recent message with reply info
          const recentMessage = messageSnapshot.docs[0];
          await updateDoc(doc(db, SMS_COLLECTIONS.SMS_MESSAGES, recentMessage.id), {
            replied: true,
            replyContent: body,
            replyAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }
        
        // Update subscriber stats
        await this.updateSubscriberStats(subscriberId, 'reply');
        
        // Check for opt-out keywords
        const optOutKeywords = ['STOP', 'UNSUBSCRIBE', 'QUIT', 'END', 'CANCEL'];
        if (optOutKeywords.some(keyword => body.toUpperCase().includes(keyword))) {
          await this.optOutSubscriber(subscriberId);
        }
      }
    } catch (error) {
      console.error('Error handling incoming SMS:', error);
    }
  }

  // Opt out a subscriber
  async optOutSubscriber(subscriberId: string): Promise<void> {
    try {
      await updateDoc(doc(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS, subscriberId), {
        isOptedIn: false,
        optOutDate: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error opting out subscriber:', error);
    }
  }

  // Update subscriber engagement stats
  private async updateSubscriberStats(
    subscriberId: string,
    action: 'sent' | 'delivered' | 'failed' | 'reply'
  ): Promise<void> {
    try {
      const subscriberRef = doc(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS, subscriberId);
      const updateData: any = {
        updatedAt: Timestamp.now()
      };
      
      switch (action) {
        case 'sent':
          updateData.totalMessagesSent = (await this.getSubscriberField(subscriberId, 'totalMessagesSent') || 0) + 1;
          break;
        case 'delivered':
          updateData.totalMessagesDelivered = (await this.getSubscriberField(subscriberId, 'totalMessagesDelivered') || 0) + 1;
          break;
        case 'reply':
          updateData.totalReplies = (await this.getSubscriberField(subscriberId, 'totalReplies') || 0) + 1;
          updateData.lastEngagement = Timestamp.now();
          break;
      }
      
      await updateDoc(subscriberRef, updateData);
    } catch (error) {
      console.error('Error updating subscriber stats:', error);
    }
  }

  // Helper to get subscriber field value
  private async getSubscriberField(subscriberId: string, field: string): Promise<number> {
    try {
      const subscriberDoc = await getDocs(
        query(collection(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS), where('id', '==', subscriberId))
      );
      if (!subscriberDoc.empty) {
        return subscriberDoc.docs[0].data()[field] || 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // Validate phone number format
  static validatePhoneNumber(phone: string): boolean {
    // Basic US phone number validation
    const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  }

  // Format phone number for Twilio
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Add +1 if not present and it's a 10-digit US number
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    return phone; // Return as-is if format is unclear
  }
}

export const twilioService = new TwilioSMSService();
export { TwilioSMSService };
export default TwilioSMSService;
