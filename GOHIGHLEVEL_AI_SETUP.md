# GoHighLevel AI Workflow Builder

## Overview

This system allows you to create GoHighLevel workflows using plain language, without touching the GoHighLevel interface. Simply describe what you want in natural language, and AI will generate complete email/SMS workflows that are automatically created in your GoHighLevel account.

## Setup

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# GoHighLevel API Configuration
GOHIGHLEVEL_API_KEY=your_ghl_api_key_here
GOHIGHLEVEL_LOCATION_ID=your_location_id_here
GOHIGHLEVEL_FROM_EMAIL=noreply@yourdomain.com

# OpenAI API (for AI workflow generation)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Get Your GoHighLevel API Key

1. Log into your GoHighLevel account
2. Go to Settings → Integrations → API Key
3. Copy your API key
4. Add it to `.env.local` as `GOHIGHLEVEL_API_KEY`

### 3. Get Your Location ID

1. In GoHighLevel, go to Settings → Business Profile
2. Your Location ID is in the URL or under API settings
3. Add it to `.env.local` as `GOHIGHLEVEL_LOCATION_ID`

### 4. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to `.env.local` as `OPENAI_API_KEY`

## Usage

### Option 1: Admin Interface

1. Go to your admin panel
2. Navigate to "AI Workflow Builder" section
3. Either:
   - Select a quick-start template, OR
   - Describe your workflow in plain language
4. Click "Generate Workflow with AI"
5. Review the generated workflow
6. Click "Create in GoHighLevel" to deploy it

### Option 2: API Endpoints

#### Generate Workflow

```bash
POST /api/ghl/generate-workflow
Content-Type: application/json

{
  "description": "Create a 3-email welcome series for new members",
  "type": "email"
}
```

#### Create Workflow in GHL

```bash
POST /api/ghl/create-workflow
Content-Type: application/json

{
  "workflow": {
    "name": "Welcome Series",
    "description": "3-email welcome sequence",
    "trigger": { "type": "manual" },
    "steps": [...]
  }
}
```

## Examples

### Email Welcome Series

**Plain Language:**
```
Create a 5-email welcome series for new sports league registrations. 
Start with a thank you, then send training tips, team information, 
schedule details, and a final check-in. Space them 2 days apart.
```

**AI Generates:**
- Email 1: Welcome & thank you (immediate)
- Email 2: Training tips (48 hours later)
- Email 3: Team information (48 hours later)
- Email 4: Schedule details (48 hours later)
- Email 5: Check-in & support (48 hours later)

### SMS Reminder Sequence

**Plain Language:**
```
Build an SMS reminder sequence for upcoming games. 
Send reminders 24 hours before, 2 hours before, 
and a post-game follow-up.
```

**AI Generates:**
- SMS 1: 24-hour reminder with game details
- SMS 2: 2-hour reminder with location
- SMS 3: Post-game thank you and next steps

### Lead Nurture Workflow

**Plain Language:**
```
Create a lead nurturing workflow for potential players. 
Send information about our programs, success stories, 
and special offers over 10 days.
```

**AI Generates:**
- Day 1: Introduction to programs
- Day 3: Success stories & testimonials
- Day 5: Program benefits
- Day 7: Special offer
- Day 10: Final call-to-action

## Quick Start Templates

The system includes 6 pre-built templates:

1. **Welcome Series** - 3-email welcome sequence
2. **Abandoned Cart** - Recovery sequence with 3 reminders
3. **Event Reminder** - Confirmations and follow-ups
4. **Lead Nurture** - 7-day educational sequence
5. **Customer Onboarding** - Setup instructions
6. **Re-engagement** - Win back inactive contacts

## Features

### Automatic Personalization

AI automatically adds personalization tokens:
- `{{contact.first_name}}`
- `{{contact.last_name}}`
- `{{contact.email}}`
- `{{contact.phone}}`

### Smart Timing

AI suggests appropriate delays between messages based on:
- Message type (email vs SMS)
- Workflow purpose
- Industry best practices

### Multi-Channel

Create workflows with:
- Email only
- SMS only
- Mixed (email + SMS)
- Lead nurture (optimized sequence)

### Workflow Triggers

Workflows can be triggered by:
- Manual trigger
- Form submission
- Tag added
- Opportunity created
- Appointment scheduled

## Advanced Usage

### Custom Workflow Types

```javascript
// Email sequence
POST /api/ghl/generate-workflow
{
  "description": "Your description",
  "type": "email_sequence"
}

// SMS sequence
POST /api/ghl/generate-workflow
{
  "description": "Your description",
  "type": "sms_sequence"
}

// Lead nurture
POST /api/ghl/generate-workflow
{
  "description": "Your description",
  "type": "nurture"
}
```

### Template Customization

```javascript
POST /api/ghl/generate-workflow
{
  "template": "welcome",
  "customization": "Focus on sports training and include video links"
}
```

## Troubleshooting

### "API Key Invalid"
- Verify your GoHighLevel API key is correct
- Check that the key has proper permissions
- Ensure you're using the correct location ID

### "OpenAI Error"
- Verify your OpenAI API key is valid
- Check your OpenAI account has credits
- Ensure you have access to GPT-4

### "Workflow Not Creating"
- Check GoHighLevel API logs
- Verify your location ID is correct
- Ensure workflow name doesn't already exist

## API Reference

### GoHighLevel Service Methods

```typescript
// Send email
await ghlService.sendEmail(contactId, {
  subject: "Subject",
  body: "HTML content"
});

// Send SMS
await ghlService.sendSMS(contactId, "Message");

// Create contact
await ghlService.upsertContact({
  email: "email@example.com",
  firstName: "John",
  lastName: "Doe"
});

// Add tags
await ghlService.addTagsToContact(contactId, ["tag1", "tag2"]);

// Trigger workflow
await ghlService.triggerWorkflow(workflowId, contactId);
```

## Best Practices

1. **Be Specific**: The more detailed your description, the better the AI-generated workflow
2. **Test First**: Generate and review before creating in GHL
3. **Use Templates**: Start with templates and customize
4. **Check Timing**: Verify delays make sense for your use case
5. **Personalize**: AI adds tokens, but review for your brand voice

## Support

For issues or questions:
- Check GoHighLevel API documentation
- Review OpenAI API status
- Check console logs for detailed errors
- Verify all environment variables are set

## Next Steps

1. Set up your environment variables
2. Test with a simple workflow
3. Try different templates
4. Create custom workflows with plain language
5. Monitor performance in GoHighLevel

Happy automating! 🚀
