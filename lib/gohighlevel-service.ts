// GoHighLevel API Service
// Documentation: https://highlevel.stoplight.io/docs/integrations/

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
  private apiKey: string;
  private baseUrl: string;
  private locationId: string;

  constructor() {
    this.apiKey = process.env.GOHIGHLEVEL_API_KEY || '';
    this.locationId = process.env.GOHIGHLEVEL_LOCATION_ID || '';
    this.baseUrl = 'https://rest.gohighlevel.com/v1';
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GoHighLevel API Error: ${response.status} - ${error}`);
    }

    return response.json();
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

  // Get all workflows
  async getWorkflows() {
    return this.makeRequest(`/workflows?locationId=${this.locationId}`);
  }

  // Trigger a workflow for a contact
  async triggerWorkflow(workflowId: string, contactId: string) {
    return this.makeRequest(`/workflows/${workflowId}/trigger`, 'POST', {
      contactId
    });
  }
}

export const ghlService = new GoHighLevelService();
