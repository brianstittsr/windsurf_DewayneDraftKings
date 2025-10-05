# Story: SMS Draft Notifications

**Story ID:** DK-DRAFT-1.4
**Epic:** Fantasy Football-Style Player Draft System
**Status:** Ready for Development
**Priority:** High
**Estimated Effort:** 3-4 hours
**Assignee:** Backend Developer

## User Story
As a player, I want to receive an immediate SMS notification when I'm drafted to a team, so that I know which team selected me and how to connect with my coach.

## Acceptance Criteria

### SMS Notification Requirements
- [ ] SMS sent immediately upon successful draft pick
- [ ] Message includes team name, coach contact information, and jersey details
- [ ] Professional, exciting tone that builds league excitement
- [ ] Delivery confirmation and retry logic for failed sends
- [ ] Opt-out capability for draft notifications

### Integration Requirements
- [ ] Leverages existing Twilio SMS infrastructure
- [ ] Uses current SMS rate limiting and error handling
- [ ] Maintains SMS analytics integration for reporting
- [ ] No disruption to existing SMS workflows (welcome, reminders, etc.)

### Message Content
- [ ] Congratulatory and exciting tone
- [ ] Team name and basic team information
- [ ] Coach contact details (name, phone, email if available)
- [ ] Jersey number assignment (if applicable)
- [ ] Next steps for team communication
- [ ] League branding and excitement messaging

## Technical Design

### SMS Service Integration

#### Draft Notification Service
```typescript
// lib/draft-notifications.ts
interface DraftNotificationData {
  playerId: string;
  playerName: string;
  teamName: string;
  coachName: string;
  coachPhone?: string;
  coachEmail?: string;
  jerseyNumber?: string;
  leagueName: string;
}

class DraftSMSNotifications {
  private twilioService: TwilioService;

  constructor() {
    this.twilioService = new TwilioService();
  }

  async sendDraftNotification(data: DraftNotificationData): Promise<boolean> {
    try {
      const message = this.buildDraftMessage(data);
      const result = await this.twilioService.sendSMS(data.playerPhone, message);

      // Log notification for analytics
      await this.logNotification({
        playerId: data.playerId,
        type: 'draft_pick',
        status: result.success ? 'delivered' : 'failed',
        messageId: result.messageId,
        timestamp: new Date()
      });

      return result.success;
    } catch (error) {
      console.error('Draft SMS notification failed:', error);
      return false;
    }
  }

  private buildDraftMessage(data: DraftNotificationData): string {
    return `🏈 CONGRATULATIONS! 🎉

You've been drafted to ${data.teamName}!
Coach: ${data.coachName}
${data.coachPhone ? `Phone: ${data.coachPhone}` : ''}
${data.jerseyNumber ? `Jersey: #${data.jerseyNumber}` : ''}

Welcome to ${data.leagueName}! Get ready for an exciting season! ⚽

Reply to this message to connect with your coach.`;
  }
}
```

### Integration Points

#### Draft Pick Flow Integration
```typescript
// In draft pick API endpoint
export async function POST(request: Request, { params }: { params: { sessionId: string } }) {
  const { playerId, teamId } = await request.json();

  // Validate pick and update database
  const pickResult = await executeDraftPick(sessionId, playerId, teamId);

  if (pickResult.success) {
    // Send SMS notification asynchronously
    const notificationService = new DraftSMSNotifications();
    const playerData = await getPlayerData(playerId);
    const teamData = await getTeamData(teamId);
    const coachData = await getCoachData(teamData.coachId);

    // Don't await - fire and forget for performance
    notificationService.sendDraftNotification({
      playerId,
      playerName: playerData.firstName + ' ' + playerData.lastName,
      playerPhone: playerData.phone,
      teamName: teamData.name,
      coachName: coachData.firstName + ' ' + coachData.lastName,
      coachPhone: coachData.phone,
      coachEmail: coachData.email,
      jerseyNumber: pickResult.jerseyNumber,
      leagueName: 'All Pro Sports NC'
    });
  }

  return NextResponse.json(pickResult);
}
```

#### Player Data Retrieval
```typescript
// lib/player-service.ts
export async function getPlayerData(playerId: string) {
  const playerDoc = await getDoc(doc(db, 'players', playerId));
  if (!playerDoc.exists()) {
    // Try coaches collection
    const coachDoc = await getDoc(doc(db, 'coaches', playerId));
    if (!coachDoc.exists()) {
      throw new Error('Player not found');
    }
    return coachDoc.data();
  }
  return playerDoc.data();
}
```

### Message Templates

#### Success Notification
```
🏈 DRAFT ALERT! 🏈

[Player Name], you've been selected!

Team: [Team Name]
Coach: [Coach Name]
Contact: [Coach Phone]

Jersey #: [Number] (if assigned)

Welcome to All Pro Sports NC!
Text your coach to get started! ⚽
```

#### Error Handling
```typescript
// lib/draft-notifications.ts
async sendDraftNotification(data: DraftNotificationData): Promise<boolean> {
  try {
    // Primary send attempt
    const result = await this.twilioService.sendSMS(data.playerPhone, message);

    if (!result.success) {
      // Retry logic with exponential backoff
      for (let attempt = 1; attempt <= 3; attempt++) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        const retryResult = await this.twilioService.sendSMS(data.playerPhone, message);
        if (retryResult.success) {
          return true;
        }
      }

      // Log permanent failure
      await this.logNotification({
        ...notificationData,
        status: 'permanently_failed',
        error: result.error
      });

      return false;
    }

    return true;
  } catch (error) {
    console.error('SMS notification error:', error);
    return false;
  }
}
```

### Opt-Out Management

#### Draft Notification Preferences
```typescript
// Extend player profile
interface PlayerProfile {
  // ... existing fields ...
  notifications: {
    sms: {
      welcome: boolean;
      reminders: boolean;
      draft: boolean; // New field for draft notifications
    };
    email: {
      confirmations: boolean;
      newsletters: boolean;
    };
  };
}
```

## Implementation Plan

### Phase 1: Service Integration (1-2 hours)
1. Create DraftSMSNotifications service class
2. Integrate with existing Twilio service
3. Add draft-specific message templates

### Phase 2: API Integration (1-2 hours)
1. Modify draft pick API endpoint to trigger SMS
2. Add async notification sending to avoid blocking picks
3. Implement error handling and logging

### Phase 3: Testing & Optimization (1 hour)
1. Test SMS delivery with mock data
2. Verify integration doesn't break existing SMS flows
3. Add analytics tracking for draft notifications

## Testing Criteria

### Functional Tests
- [ ] SMS sent immediately after successful draft pick
- [ ] Message contains correct team and coach information
- [ ] Delivery confirmed in Twilio dashboard
- [ ] Failed sends trigger retry logic

### Integration Tests
- [ ] Draft pick API still responds quickly (SMS is async)
- [ ] Existing SMS workflows remain unaffected
- [ ] Analytics capture draft notification metrics
- [ ] Opt-out preferences respected

### Edge Case Tests
- [ ] Invalid phone numbers handled gracefully
- [ ] Network failures trigger retries
- [ ] Multiple picks in rapid succession don't overwhelm SMS service
- [ ] Coach contact information updates reflected in messages

## Definition of Done
- [ ] SMS notifications sent reliably for all draft picks
- [ ] Message content is professional and exciting
- [ ] Integration doesn't impact draft pick performance
- [ ] Error handling and retry logic implemented
- [ ] Code reviewed and tested

## Dependencies
- Story 1.2: Draft API Endpoints ✅
- Existing Twilio SMS service ✅
- Player and team data access ✅

## Risk Assessment
**Low Risk**: Builds on existing SMS infrastructure
**Mitigation**: Async sending prevents blocking draft operations

## Notes
- Consider SMS length limits (160 characters for single message)
- Plan for international number formatting if league expands
- Consider implementing SMS status webhooks for delivery confirmation
- May want to add A/B testing for message effectiveness
- Consider rate limiting to prevent SMS service overload during busy drafts
