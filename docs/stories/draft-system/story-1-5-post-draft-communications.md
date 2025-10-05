# Story: Post-Draft Communication Workflows

**Story ID:** DK-DRAFT-1.5
**Epic:** Fantasy Football-Style Player Draft System
**Status:** Ready for Development
**Priority:** Medium
**Estimated Effort:** 6-8 hours
**Assignee:** Full-Stack Developer

## User Story
As a coach, I want automated communication tools to connect with my drafted players and share team information, so that I can build team relationships and coordinate activities effectively.

## Acceptance Criteria

### Team Communication System
- [ ] Coach-to-player messaging interface within the platform
- [ ] Bulk messaging capabilities for team announcements
- [ ] Player contact information accessible to assigned coaches
- [ ] Message history and conversation threading
- [ ] Integration with existing SMS/email systems

### Facebook Page Integration
- [ ] Automatic Facebook posts when players are drafted to teams
- [ ] Team formation announcements with player spotlights
- [ ] Scheduled posting for optimal engagement timing
- [ ] Facebook Graph API integration with proper permissions
- [ ] Admin controls for enabling/disabling social media posts

### Communication Workflows
- [ ] Welcome message sequence for newly drafted players
- [ ] Team meeting coordination and scheduling
- [ ] Practice and game information distribution
- [ ] Emergency contact and roster updates
- [ ] Performance feedback and highlight sharing

## Technical Design

### Communication Architecture

#### Team Messaging Service
```typescript
// lib/team-communications.ts
interface TeamMessage {
  id: string;
  teamId: string;
  senderId: string; // Coach ID
  recipientIds: string[]; // Player IDs
  type: 'welcome' | 'announcement' | 'meeting' | 'reminder';
  subject: string;
  content: string;
  channels: ('sms' | 'email' | 'platform')[];
  scheduledFor?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
}

class TeamCommunicationService {
  async sendTeamMessage(message: TeamMessage): Promise<boolean> {
    const results = await Promise.allSettled(
      message.channels.map(channel =>
        this.sendViaChannel(message, channel)
      )
    );

    return results.some(result => result.status === 'fulfilled');
  }

  private async sendViaChannel(message: TeamMessage, channel: string) {
    switch (channel) {
      case 'sms':
        return this.sendBulkSMS(message);
      case 'email':
        return this.sendBulkEmail(message);
      case 'platform':
        return this.sendPlatformNotification(message);
    }
  }
}
```

#### Facebook Integration Service
```typescript
// lib/facebook-integration.ts
interface FacebookPost {
  message: string;
  link?: string;
  image?: string;
  scheduled_publish_time?: number;
}

class FacebookPageService {
  private pageAccessToken: string;
  private pageId: string;

  async postDraftAnnouncement(teamName: string, playerNames: string[]): Promise<string> {
    const message = this.buildDraftAnnouncement(teamName, playerNames);
    const imageUrl = await this.generateTeamImage(teamName, playerNames);

    const post: FacebookPost = {
      message,
      image: imageUrl,
      link: `${process.env.NEXT_PUBLIC_BASE_URL}/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}`
    };

    return await this.publishToFacebook(post);
  }

  private buildDraftAnnouncement(teamName: string, playerNames: string[]): string {
    return `🏈 DRAFT COMPLETE! 🏈

Welcome to the ${teamName} family!

New team members:
${playerNames.map(name => `• ${name}`).join('\n')}

Get ready for an exciting season with All Pro Sports NC! ⚽

#AllProSportsNC #${teamName.replace(/\s+/g, '')} #DraftDay`;
  }

  private async publishToFacebook(post: FacebookPost): Promise<string> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${this.pageId}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...post,
          access_token: this.pageAccessToken,
        }),
      }
    );

    const result = await response.json();
    return result.id; // Post ID
  }
}
```

### Post-Draft Workflow Automation

#### Welcome Sequence
```typescript
// lib/draft-workflows.ts
class PostDraftWorkflowService {
  async triggerWelcomeSequence(playerId: string, teamId: string) {
    // 1. Immediate SMS welcome (handled by Story 1.4)

    // 2. Platform welcome message
    await this.sendPlatformWelcome(playerId, teamId);

    // 3. Schedule team introduction email (24 hours later)
    await this.scheduleTeamIntroductionEmail(playerId, teamId);

    // 4. Facebook announcement (if enabled)
    await this.postFacebookAnnouncement(teamId, [playerId]);

    // 5. Coach notification
    await this.notifyCoachOfNewPlayer(teamId, playerId);
  }

  private async sendPlatformWelcome(playerId: string, teamId: string) {
    const team = await getTeamData(teamId);
    const coach = await getCoachData(team.coachId);

    const welcomeMessage: TeamMessage = {
      teamId,
      senderId: team.coachId,
      recipientIds: [playerId],
      type: 'welcome',
      subject: `Welcome to ${team.name}!`,
      content: `
Welcome to the ${team.name}!

Your coach ${coach.firstName} ${coach.lastName} will be reaching out soon to coordinate your first team meeting.

Team Colors: ${team.colors || 'TBD'}
Practice Schedule: ${team.practiceSchedule || 'TBD'}

Questions? Reply to this message or contact your coach directly.
      `,
      channels: ['platform', 'email'],
      status: 'sent',
      sentAt: new Date()
    };

    await teamCommunicationService.sendTeamMessage(welcomeMessage);
  }
}
```

### Facebook Page Management

#### Post Scheduling
```typescript
// Admin interface for managing Facebook posts
interface FacebookSettings {
  enabled: boolean;
  pageId: string;
  accessToken: string;
  autoPostDrafts: boolean;
  postTiming: 'immediate' | 'scheduled';
  scheduledHour: number; // Hour of day for scheduled posts
}

class FacebookScheduler {
  async scheduleDraftPost(teamName: string, playerNames: string[], delayMinutes: number = 0) {
    const settings = await getFacebookSettings();

    if (!settings.enabled || !settings.autoPostDrafts) {
      return;
    }

    const postTime = new Date();
    if (settings.postTiming === 'scheduled') {
      postTime.setHours(settings.scheduledHour, 0, 0, 0);
      // If scheduled time has passed today, schedule for tomorrow
      if (postTime < new Date()) {
        postTime.setDate(postTime.getDate() + 1);
      }
    } else if (delayMinutes > 0) {
      postTime.setMinutes(postTime.getMinutes() + delayMinutes);
    }

    // Schedule the post
    await scheduleFacebookPost({
      teamName,
      playerNames,
      scheduledFor: postTime
    });
  }
}
```

### Communication Hub Interface

#### Coach Communication Dashboard
```typescript
// pages/teams/[teamId]/communications.tsx
function TeamCommunicationsPage({ teamId }: { teamId: string }) {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  return (
    <div className="communications-hub">
      <MessageComposer
        teamId={teamId}
        availableRecipients={players}
        onSend={handleSendMessage}
      />

      <MessageHistory
        messages={messages}
        onReply={handleReply}
        onBulkAction={handleBulkAction}
      />

      <CommunicationTemplates
        onUseTemplate={handleUseTemplate}
      />

      <FacebookIntegrationPanel
        teamId={teamId}
        onPostAnnouncement={handleFacebookPost}
      />
    </div>
  );
}
```

## Implementation Plan

### Phase 1: Communication Infrastructure (2-3 hours)
1. Create TeamCommunicationService with multi-channel support
2. Implement basic messaging API endpoints
3. Add message history and threading

### Phase 2: Facebook Integration (2-3 hours)
1. Set up Facebook Graph API integration
2. Create post scheduling and publishing logic
3. Build admin controls for Facebook settings

### Phase 3: Workflow Automation (2-3 hours)
1. Implement post-draft welcome sequences
2. Create automated team introduction flows
3. Add coach notification system

## Testing Criteria

### Communication Tests
- [ ] Messages sent successfully via multiple channels
- [ ] Bulk messaging works for team announcements
- [ ] Message history and threading functions correctly
- [ ] Coach-to-player communication is secure

### Facebook Integration Tests
- [ ] Facebook posts published successfully
- [ ] Post scheduling works correctly
- [ ] Image generation and attachment functions
- [ ] Error handling for API failures

### Workflow Tests
- [ ] Welcome sequences trigger automatically after draft
- [ ] Team introduction emails are scheduled and sent
- [ ] Coach notifications work reliably
- [ ] No duplicate messages sent

## Definition of Done
- [ ] Communication workflows function end-to-end
- [ ] Facebook integration posts successfully
- [ ] Coach communication tools are intuitive
- [ ] Automated sequences work reliably
- [ ] Code reviewed and security tested

## Dependencies
- Story 1.1: Draft Database Schema ✅
- Existing SMS/Email services ✅
- Facebook Graph API access (requires setup)

## Risk Assessment
**Medium Risk**: External API dependencies (Facebook)
**Mitigation**: Graceful degradation if Facebook API unavailable

## Notes
- Facebook integration requires app review and permissions
- Consider implementing message templates for common communications
- Plan for message archiving and compliance requirements
- Consider implementing read receipts and delivery confirmation
- May want to add communication analytics and engagement tracking
