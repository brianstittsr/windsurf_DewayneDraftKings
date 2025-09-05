# Twilio Studio Setup for DraftKings SMS Journeys

## Overview
Twilio Studio provides visual workflow management for SMS journeys, replacing the custom journey service with Twilio's robust platform.

## Benefits vs Current System
- **Visual Flow Builder**: Drag-and-drop interface for creating SMS sequences
- **Built-in Delays**: Native support for timed messages without custom scheduling
- **Branching Logic**: Conditional flows based on user responses
- **Analytics**: Built-in execution tracking and metrics
- **Scalability**: Handles high-volume messaging automatically
- **Error Handling**: Automatic retry and failure management

## Setup Steps

### 1. Create Studio Flows in Twilio Console

#### Welcome Journey Flow
```json
{
  "name": "DraftKings Welcome Journey",
  "description": "Welcome new subscribers to the league",
  "steps": [
    {
      "type": "send_message",
      "message": "🏈 Welcome to DraftKings League! You're now signed up for SMS updates.",
      "delay": 0
    },
    {
      "type": "wait",
      "duration": "2 hours"
    },
    {
      "type": "send_message", 
      "message": "Ready to join your first league? Reply YES to get started or STOP to opt out.",
      "collect_response": true
    },
    {
      "type": "branch",
      "condition": "{{widgets.collect_response.inbound.Body | upcase}}",
      "branches": {
        "YES": "send_league_info",
        "STOP": "opt_out_flow"
      }
    }
  ]
}
```

#### Registration Reminder Flow
```json
{
  "name": "Registration Reminder",
  "description": "Remind users to complete registration",
  "steps": [
    {
      "type": "send_message",
      "message": "⏰ Don't forget to complete your DraftKings League registration! Finish setup: {{registration_link}}"
    },
    {
      "type": "wait",
      "duration": "24 hours"
    },
    {
      "type": "check_registration_status",
      "webhook_url": "{{base_url}}/api/sms/webhook/check-registration"
    },
    {
      "type": "branch",
      "condition": "{{widgets.check_registration.parsed.completed}}",
      "branches": {
        "false": "send_final_reminder",
        "true": "end_flow"
      }
    }
  ]
}
```

### 2. Environment Variables
Add these to your `.env` file:

```bash
# Twilio Studio Flow SIDs (get these from Twilio Console after creating flows)
TWILIO_WELCOME_FLOW_SID=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_REMINDER_FLOW_SID=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FEEDBACK_FLOW_SID=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_GAMEDAY_FLOW_SID=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Studio Webhook URL (for your app)
TWILIO_STUDIO_WEBHOOK_URL=https://yourdomain.com/api/sms/studio
```

### 3. Webhook Configuration
In each Studio Flow, set the webhook URL to:
```
https://yourdomain.com/api/sms/studio
```

### 4. Integration Examples

#### Start Welcome Journey (API Call)
```javascript
const response = await fetch('/api/sms/studio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'start_journey',
    journeyType: 'welcome',
    phoneNumber: '+1234567890',
    context: {
      userName: 'John Doe',
      registrationLink: 'https://app.draftkings.com/register/abc123'
    }
  })
});
```

#### Trigger Journey by User Action
```javascript
// When user registers
await fetch('/api/sms/studio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'trigger_by_action',
    trigger: 'registration',
    phoneNumber: '+1234567890',
    context: { userName: 'John Doe' }
  })
});
```

#### Check Journey Status
```javascript
const status = await fetch('/api/sms/studio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'get_status',
    executionSid: 'FNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  })
});
```

## Studio Flow Templates

### Game Day Updates Flow
1. **Trigger**: Game starts
2. **Message**: "🏈 GAME ON! [Team A] vs [Team B] - Follow live updates"
3. **Wait**: Until halftime
4. **Message**: "⏱️ HALFTIME: [Team A] 14 - [Team B] 7"
5. **Wait**: Until game end
6. **Message**: "🏆 FINAL: [Winner] wins! Check your league standings"

### Feedback Collection Flow
1. **Trigger**: After league event
2. **Message**: "How was your DraftKings experience? Reply 1-5 (5=excellent)"
3. **Collect Response**: Store rating
4. **Branch**: If rating < 3, send follow-up
5. **Message**: "Thanks for your feedback! 🙏"

## Migration from Current System

### Replace Journey Service Calls
```typescript
// OLD: Custom journey service
await smsJourneyService.startJourney(subscriberId, 'welcome');

// NEW: Twilio Studio
await twilioStudioService.startJourney('welcome', phoneNumber, {
  subscriberId,
  userName: subscriber.name
});
```

### Update Registration Flow
```typescript
// In registration API
export async function POST(request: NextRequest) {
  // ... registration logic ...
  
  // Start welcome journey via Studio
  await twilioStudioService.triggerJourneyByAction('registration', phoneNumber, {
    userName: userData.name,
    registrationLink: `${process.env.BASE_URL}/complete-registration/${userId}`
  });
}
```

## Cost Comparison

### Current System (Firebase + Custom)
- Firebase Functions: ~$0.40/million executions
- Storage: ~$0.026/GB/month
- Manual scheduling complexity

### Twilio Studio
- Studio Executions: $0.0025 per execution
- SMS Messages: $0.0075 per message (same as current)
- Built-in scheduling and error handling

**Example**: 10,000 subscribers, 5 messages per journey
- Current: ~$200/month (Firebase + development time)
- Studio: ~$375/month (more expensive but much more robust)

## Testing Studio Flows

### 1. Test in Twilio Console
- Use the Studio Flow debugger
- Test with your phone number
- Verify webhook calls

### 2. Test via API
```bash
curl -X POST http://localhost:3000/api/sms/studio \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start_journey",
    "journeyType": "welcome", 
    "phoneNumber": "+1234567890",
    "context": {"userName": "Test User"}
  }'
```

## Next Steps
1. Create Studio Flows in Twilio Console
2. Update environment variables with Flow SIDs
3. Test each journey type
4. Migrate existing subscribers to Studio flows
5. Monitor execution analytics in Twilio Console
