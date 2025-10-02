// AI-Powered Workflow Generator
// Converts plain language descriptions into GoHighLevel workflows

interface WorkflowRequest {
  description: string;
  type: 'email' | 'sms' | 'mixed' | 'nurture';
}

interface GeneratedWorkflow {
  name: string;
  description: string;
  trigger: {
    type: string;
    config?: any;
  };
  steps: Array<{
    type: 'email' | 'sms' | 'wait' | 'condition' | 'tag';
    delay?: number; // in hours
    subject?: string; // for email
    content: string;
    condition?: string;
    tags?: string[];
  }>;
}

export class AIWorkflowGenerator {
  private openAIKey: string;

  constructor() {
    this.openAIKey = process.env.OPENAI_API_KEY || '';
  }

  async generateWorkflow(request: WorkflowRequest): Promise<GeneratedWorkflow> {
    const prompt = this.buildPrompt(request);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert at creating marketing automation workflows for GoHighLevel. 
              Convert user descriptions into structured workflows with emails, SMS, delays, and conditions.
              Always return valid JSON matching the GeneratedWorkflow interface.
              Be specific with email/SMS content, include personalization tokens like {{contact.first_name}}.
              For delays, use reasonable timeframes (hours).`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      const workflow = JSON.parse(data.choices[0].message.content);
      
      return this.validateAndEnhanceWorkflow(workflow);
    } catch (error) {
      console.error('Error generating workflow:', error);
      throw error;
    }
  }

  private buildPrompt(request: WorkflowRequest): string {
    return `Create a ${request.type} workflow based on this description:

"${request.description}"

Generate a complete workflow with:
1. A descriptive name
2. Clear description
3. Appropriate trigger (manual, form_submission, tag_added, etc.)
4. Sequence of steps including:
   - Welcome messages
   - Follow-up messages
   - Appropriate delays between messages
   - Personalization using {{contact.first_name}}, {{contact.last_name}}, etc.
   - Clear calls-to-action
   - Tags for tracking

Return as JSON with this structure:
{
  "name": "Workflow Name",
  "description": "What this workflow does",
  "trigger": {
    "type": "manual|form_submission|tag_added|opportunity_created",
    "config": {}
  },
  "steps": [
    {
      "type": "email|sms|wait|tag",
      "delay": 0,
      "subject": "Email subject (if email)",
      "content": "Message content with {{tokens}}",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;
  }

  private validateAndEnhanceWorkflow(workflow: any): GeneratedWorkflow {
    // Ensure all required fields exist
    if (!workflow.name) {
      workflow.name = 'Generated Workflow';
    }
    if (!workflow.description) {
      workflow.description = 'AI-generated workflow';
    }
    if (!workflow.trigger) {
      workflow.trigger = { type: 'manual' };
    }
    if (!workflow.steps || !Array.isArray(workflow.steps)) {
      workflow.steps = [];
    }

    // Add delay to first step if not present
    if (workflow.steps.length > 0 && workflow.steps[0].delay === undefined) {
      workflow.steps[0].delay = 0;
    }

    return workflow as GeneratedWorkflow;
  }

  // Generate email sequence
  async generateEmailSequence(description: string, numEmails: number = 3): Promise<GeneratedWorkflow> {
    return this.generateWorkflow({
      description: `Create an email sequence with ${numEmails} emails: ${description}`,
      type: 'email'
    });
  }

  // Generate SMS sequence
  async generateSMSSequence(description: string, numMessages: number = 3): Promise<GeneratedWorkflow> {
    return this.generateWorkflow({
      description: `Create an SMS sequence with ${numMessages} messages: ${description}`,
      type: 'sms'
    });
  }

  // Generate lead nurture workflow
  async generateNurtureWorkflow(description: string): Promise<GeneratedWorkflow> {
    return this.generateWorkflow({
      description: `Create a lead nurturing workflow: ${description}`,
      type: 'nurture'
    });
  }

  // Generate from template
  async generateFromTemplate(template: string, customization: string): Promise<GeneratedWorkflow> {
    const templates: Record<string, string> = {
      'welcome': 'Create a welcome series for new contacts with 3 emails over 5 days introducing our services',
      'abandoned_cart': 'Create an abandoned cart recovery sequence with 3 reminders over 3 days',
      'event_reminder': 'Create an event reminder sequence with confirmations and follow-ups',
      'lead_nurture': 'Create a 7-day lead nurturing sequence educating prospects about our value',
      'onboarding': 'Create an onboarding sequence for new customers with setup instructions',
      're_engagement': 'Create a re-engagement campaign for inactive contacts'
    };

    const baseDescription = templates[template] || templates['welcome'];
    const fullDescription = customization 
      ? `${baseDescription}. Additional requirements: ${customization}`
      : baseDescription;

    return this.generateWorkflow({
      description: fullDescription,
      type: 'mixed'
    });
  }
}

export const aiWorkflowGenerator = new AIWorkflowGenerator();
