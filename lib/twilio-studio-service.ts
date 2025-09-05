// Twilio Studio Integration for SMS Journey Management
import { Twilio } from 'twilio';

interface StudioExecution {
  sid: string;
  status: string;
  context: Record<string, any>;
  flowSid: string;
  contactChannelAddress: string;
}

interface JourneyFlow {
  name: string;
  flowSid: string;
  description: string;
  triggers: string[];
}

class TwilioStudioService {
  private client: Twilio;
  
  // Pre-defined journey flows
  private journeyFlows: Record<string, JourneyFlow> = {
    welcome: {
      name: 'Welcome Journey',
      flowSid: 'FW_WELCOME_FLOW_SID', // Replace with actual Studio Flow SID
      description: 'Welcome new subscribers with league information',
      triggers: ['registration', 'opt_in']
    },
    reminder: {
      name: 'Registration Reminder',
      flowSid: 'FW_REMINDER_FLOW_SID', // Replace with actual Studio Flow SID
      description: 'Remind users to complete registration',
      triggers: ['incomplete_registration']
    },
    feedback: {
      name: 'Feedback Collection',
      flowSid: 'FW_FEEDBACK_FLOW_SID', // Replace with actual Studio Flow SID
      description: 'Collect user feedback after events',
      triggers: ['post_event', 'weekly_survey']
    },
    gameday: {
      name: 'Game Day Updates',
      flowSid: 'FW_GAMEDAY_FLOW_SID', // Replace with actual Studio Flow SID
      description: 'Send live game updates and scores',
      triggers: ['game_start', 'score_update', 'game_end']
    }
  };

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }

  /**
   * Start a Studio Flow execution for a subscriber
   */
  async startJourney(
    journeyType: keyof typeof this.journeyFlows,
    phoneNumber: string,
    context: Record<string, any> = {}
  ): Promise<StudioExecution> {
    try {
      const flow = this.journeyFlows[journeyType];
      if (!flow) {
        throw new Error(`Journey type '${journeyType}' not found`);
      }

      // Start Studio Flow execution
      const execution = await this.client.studio.v2
        .flows(flow.flowSid)
        .executions
        .create({
          to: phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER!,
          parameters: {
            // Pass context data to Studio Flow
            subscriberPhone: phoneNumber,
            journeyType,
            timestamp: new Date().toISOString(),
            ...context
          }
        });

      console.log(`Started ${flow.name} journey for ${phoneNumber}:`, execution.sid);

      return {
        sid: execution.sid,
        status: execution.status,
        context: execution.context,
        flowSid: flow.flowSid,
        contactChannelAddress: phoneNumber
      };
    } catch (error) {
      console.error('Error starting Studio journey:', error);
      throw error;
    }
  }

  /**
   * Get execution status and context
   */
  async getJourneyStatus(executionSid: string): Promise<StudioExecution | null> {
    try {
      const execution = await this.client.studio.v2
        .flows.executions(executionSid)
        .fetch();

      return {
        sid: execution.sid,
        status: execution.status,
        context: execution.context,
        flowSid: execution.flowSid,
        contactChannelAddress: execution.contactChannelAddress
      };
    } catch (error) {
      console.error('Error fetching execution status:', error);
      return null;
    }
  }

  /**
   * Stop an active journey execution
   */
  async stopJourney(executionSid: string): Promise<boolean> {
    try {
      await this.client.studio.v2
        .flows.executions(executionSid)
        .update({ status: 'ended' });

      console.log(`Stopped journey execution: ${executionSid}`);
      return true;
    } catch (error) {
      console.error('Error stopping journey:', error);
      return false;
    }
  }

  /**
   * Update journey context (for dynamic content)
   */
  async updateJourneyContext(
    executionSid: string,
    contextUpdates: Record<string, any>
  ): Promise<boolean> {
    try {
      // Note: Studio doesn't support direct context updates
      // This would require webhook handling to update context
      console.log(`Context update requested for ${executionSid}:`, contextUpdates);
      
      // Store context updates in your database for webhook retrieval
      // Implementation depends on your data storage choice
      
      return true;
    } catch (error) {
      console.error('Error updating journey context:', error);
      return false;
    }
  }

  /**
   * Get available journey types
   */
  getAvailableJourneys(): JourneyFlow[] {
    return Object.values(this.journeyFlows);
  }

  /**
   * Trigger journey based on user action
   */
  async triggerJourneyByAction(
    action: string,
    phoneNumber: string,
    context: Record<string, any> = {}
  ): Promise<StudioExecution[]> {
    const triggeredJourneys: StudioExecution[] = [];

    for (const [journeyType, flow] of Object.entries(this.journeyFlows)) {
      if (flow.triggers.includes(action)) {
        try {
          const execution = await this.startJourney(
            journeyType as keyof typeof this.journeyFlows,
            phoneNumber,
            { ...context, trigger: action }
          );
          triggeredJourneys.push(execution);
        } catch (error) {
          console.error(`Failed to trigger ${journeyType} journey:`, error);
        }
      }
    }

    return triggeredJourneys;
  }

  /**
   * Handle Studio webhook events
   */
  async handleWebhook(webhookData: any): Promise<void> {
    try {
      const { ExecutionSid, FlowSid, CurrentStep, ContactChannelAddress } = webhookData;

      console.log('Studio webhook received:', {
        execution: ExecutionSid,
        flow: FlowSid,
        step: CurrentStep,
        contact: ContactChannelAddress
      });

      // Handle different webhook events
      switch (webhookData.CurrentStep) {
        case 'step_completed':
          await this.handleStepCompleted(webhookData);
          break;
        case 'flow_ended':
          await this.handleFlowEnded(webhookData);
          break;
        case 'user_reply':
          await this.handleUserReply(webhookData);
          break;
        default:
          console.log('Unhandled webhook event:', CurrentStep);
      }
    } catch (error) {
      console.error('Error handling Studio webhook:', error);
    }
  }

  private async handleStepCompleted(webhookData: any): Promise<void> {
    // Track step completion in analytics
    console.log('Journey step completed:', webhookData);
  }

  private async handleFlowEnded(webhookData: any): Promise<void> {
    // Track journey completion
    console.log('Journey flow ended:', webhookData);
  }

  private async handleUserReply(webhookData: any): Promise<void> {
    // Handle user responses and route to appropriate flows
    console.log('User reply received:', webhookData);
  }
}

export const twilioStudioService = new TwilioStudioService();
export default TwilioStudioService;
