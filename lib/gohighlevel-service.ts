// GoHighLevel API Service
// Documentation: https://highlevel.stoplight.io/docs/integrations/

import axios, { AxiosInstance, AxiosError } from 'axios';

interface GHLWorkflowAction {
  type: 'email' | 'sms' | 'wait' | 'condition' | 'tag' | 'webhook';
  data: any;
}

interface GHLWorkflow {
  name: string;
  description?: string;
  trigger: {
    type: 'manual' | 'form_submission' | 'tag_added' | 'opportunity_created' | 'appointment_scheduled';
    config?: any;
  };
  actions: GHLWorkflowAction[];
}

export class GoHighLevelService {
  private client: AxiosInstance;
  private locationId: string;

  constructor() {
    const apiKey = process.env.GOHIGHLEVEL_API_KEY || '';
    this.locationId = process.env.GOHIGHLEVEL_LOCATION_ID || '';
    
    // Create Axios instance with default config for API v2
    this.client = axios.create({
      baseURL: 'https://services.leadconnectorhq.com',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      timeout: 30000 // 30 second timeout
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`GHL API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('GHL Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`GHL API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          console.error(`GHL API Error: ${error.response.status}`, error.response.data);
          throw new Error(`GoHighLevel API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          console.error('GHL No Response:', error.request);
          throw new Error('GoHighLevel API: No response received');
        } else {
          console.error('GHL Request Setup Error:', error.message);
          throw new Error(`GoHighLevel API: ${error.message}`);
        }
      }
    );
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const response = await this.client.request({
        url: endpoint,
        method: method as any,
        data
      });
      return response.data;
    } catch (error) {
      console.error('GHL makeRequest error:', error);
      throw error;
    }
  }

  // Create a workflow
  async createWorkflow(workflow: GHLWorkflow) {
    return this.makeRequest('/workflows', 'POST', {
      locationId: this.locationId,
      ...workflow
    });
  }

  // Send an email
  async sendEmail(contactId: string, emailData: {
    subject: string;
    body: string;
    from?: string;
  }) {
    return this.makeRequest('/conversations/messages', 'POST', {
      type: 'Email',
      contactId,
      locationId: this.locationId,
      subject: emailData.subject,
      html: emailData.body,
      emailFrom: emailData.from || process.env.GOHIGHLEVEL_FROM_EMAIL
    });
  }

  // Send an SMS
  async sendSMS(contactId: string, message: string) {
    return this.makeRequest('/conversations/messages', 'POST', {
      type: 'SMS',
      contactId,
      locationId: this.locationId,
      message
    });
  }

  // Create or update a contact
  async upsertContact(contactData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }) {
    return this.makeRequest('/contacts', 'POST', {
      locationId: this.locationId,
      ...contactData
    });
  }

  // Add tags to a contact
  async addTagsToContact(contactId: string, tags: string[]) {
    return this.makeRequest(`/contacts/${contactId}/tags`, 'POST', {
      tags
    });
  }

  // Create a campaign (email/SMS sequence)
  async createCampaign(campaignData: {
    name: string;
    type: 'email' | 'sms';
    messages: Array<{
      delay: number; // in hours
      subject?: string; // for email
      content: string;
    }>;
  }) {
    return this.makeRequest('/campaigns', 'POST', {
      locationId: this.locationId,
      ...campaignData
    });
  }

  // Get contact by email or phone
  async findContact(email?: string, phone?: string) {
    const query = email ? `email=${email}` : phone ? `phone=${phone}` : '';
    return this.makeRequest(`/contacts/lookup?${query}&locationId=${this.locationId}`);
  }

  // Create an opportunity (lead)
  async createOpportunity(opportunityData: {
    contactId: string;
    pipelineId: string;
    stageId: string;
    name: string;
    monetaryValue?: number;
    status?: string;
  }) {
    return this.makeRequest('/opportunities', 'POST', {
      locationId: this.locationId,
      ...opportunityData
    });
  }

  // Get all pipelines
  async getPipelines() {
    return this.makeRequest(`/pipelines?locationId=${this.locationId}`);
  }

  // Get all workflows (API v2)
  async getWorkflows() {
    return this.makeRequest(`/workflows/`, 'GET', {
      params: { locationId: this.locationId }
    });
  }

  // Trigger a workflow for a contact
  async triggerWorkflow(workflowId: string, contactId: string) {
    return this.makeRequest(`/workflows/${workflowId}/trigger`, 'POST', {
      contactId
    });
  }
}

export const ghlService = new GoHighLevelService();
