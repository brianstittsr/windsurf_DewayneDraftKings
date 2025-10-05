# Story: Draft API Endpoints Implementation

**Story ID:** DK-DRAFT-1.2
**Epic:** Fantasy Football-Style Player Draft System
**Status:** Ready for Development
**Priority:** Critical
**Estimated Effort:** 6-8 hours
**Assignee:** Development Team

## User Story
As a frontend developer, I want RESTful API endpoints for draft management, so that the draft interface can create sessions, track picks, and provide real-time updates.

## Acceptance Criteria

### API Endpoints Required
- [ ] `POST /api/draft/sessions` - Create new draft session
- [ ] `GET /api/draft/sessions` - List draft sessions
- [ ] `GET /api/draft/sessions/{sessionId}` - Get draft session details
- [ ] `PUT /api/draft/sessions/{sessionId}` - Update draft session
- [ ] `POST /api/draft/sessions/{sessionId}/start` - Start draft session
- [ ] `POST /api/draft/sessions/{sessionId}/pick` - Make a draft pick
- [ ] `GET /api/draft/sessions/{sessionId}/status` - Get real-time draft status
- [ ] `POST /api/draft/queues/{teamId}` - Update team draft queue

### Real-Time Functionality
- [ ] Server-Sent Events (SSE) endpoint for draft updates
- [ ] WebSocket support for instant pick notifications
- [ ] Automatic timer progression with pick advancement
- [ ] Connection recovery for interrupted clients

### Integration Requirements
- [ ] Leverages existing Firebase/Firestore patterns
- [ ] Uses current authentication middleware
- [ ] Follows existing API response format standards
- [ ] Integrates with SMS notification system for picks

## Technical Design

### API Architecture

#### Draft Session Management
```typescript
// POST /api/draft/sessions
interface CreateDraftSessionRequest {
  leagueId: string;
  seasonId: string;
  name: string;
  totalRounds: number;
  pickTimerSeconds: number;
  teamIds: string[]; // Teams participating in draft
}

interface DraftSessionResponse {
  id: string;
  status: 'scheduled' | 'active' | 'completed';
  currentRound: number;
  currentPick: number;
  nextTeamId: string;
  timerExpiresAt: Date;
}
```

#### Draft Pick Execution
```typescript
// POST /api/draft/sessions/{sessionId}/pick
interface DraftPickRequest {
  playerId: string;
  teamId: string; // Should match current team's turn
}

interface DraftPickResponse {
  success: boolean;
  pickNumber: number;
  round: number;
  playerDrafted: {
    id: string;
    name: string;
    position: string;
  };
  nextTeamId: string;
  timerExpiresAt: Date;
}
```

#### Real-Time Status Updates
```typescript
// GET /api/draft/sessions/{sessionId}/status
interface DraftStatusResponse {
  sessionId: string;
  status: string;
  currentRound: number;
  currentPick: number;
  timeRemaining: number; // seconds
  nextTeamId: string;
  recentPicks: Array<{
    round: number;
    pick: number;
    teamId: string;
    playerId: string;
    playerName: string;
    timestamp: Date;
  }>;
  availablePlayers: Array<{
    id: string;
    name: string;
    position: string;
    stats?: object;
  }>;
}
```

### Real-Time Implementation

#### Server-Sent Events Endpoint
```typescript
// GET /api/draft/sessions/{sessionId}/events
// Returns SSE stream with draft updates

interface DraftEvent {
  type: 'pick-made' | 'timer-update' | 'session-started' | 'session-paused';
  data: any;
  timestamp: Date;
}
```

#### Timer Management
```typescript
class DraftTimer {
  private sessionId: string;
  private durationSeconds: number;
  private onExpire: () => void;
  private intervalId: NodeJS.Timeout;

  constructor(sessionId: string, durationSeconds: number, onExpire: () => void) {
    this.sessionId = sessionId;
    this.durationSeconds = durationSeconds;
    this.onExpire = onExpire;
  }

  start(): void {
    // Start countdown timer
    // Broadcast timer updates via SSE
    // Call onExpire when time runs out
  }

  pause(): void {
    // Pause timer and broadcast status
  }

  resume(): void {
    // Resume timer from remaining time
  }

  reset(seconds: number): void {
    // Reset timer with new duration
  }
}
```

### SMS Integration

#### Draft Pick Notifications
```typescript
interface DraftNotificationService {
  async notifyPlayerDrafted(
    playerId: string,
    teamName: string,
    coachContact: string,
    jerseyNumber?: string
  ): Promise<boolean>;
}

// Implementation integrates with existing Twilio service
class TwilioDraftNotifications implements DraftNotificationService {
  async notifyPlayerDrafted(player, team, coach, jersey) {
    // Use existing SMS templates and infrastructure
    // Send immediate notification upon successful pick
  }
}
```

## Implementation Plan

### Phase 1: Core API Endpoints (3-4 hours)
1. Implement draft session CRUD operations
2. Create draft pick execution logic
3. Add session status retrieval
4. Integrate with existing authentication

### Phase 2: Real-Time Functionality (2-3 hours)
1. Implement SSE endpoint for live updates
2. Create timer management system
3. Add automatic pick progression
4. Test connection recovery scenarios

### Phase 3: SMS Integration (1-2 hours)
1. Extend existing SMS service for draft notifications
2. Create draft-specific message templates
3. Test notification delivery and error handling

## Testing Criteria

### API Tests
- [ ] Session creation with valid/invalid data
- [ ] Pick execution respects draft order and timing
- [ ] Status endpoint returns correct real-time data
- [ ] Authentication required for all endpoints

### Real-Time Tests
- [ ] SSE connections receive pick updates
- [ ] Timer countdown broadcasts correctly
- [ ] Multiple clients stay synchronized
- [ ] Network interruptions handled gracefully

### Integration Tests
- [ ] SMS notifications sent upon successful picks
- [ ] Existing SMS workflows remain unaffected
- [ ] Database updates trigger real-time broadcasts

## Definition of Done
- [ ] All API endpoints implemented and tested
- [ ] Real-time functionality working across clients
- [ ] SMS notifications integrated successfully
- [ ] Code reviewed and approved
- [ ] API documentation created
- [ ] Performance tested with multiple concurrent users

## Dependencies
- Story 1.1: Draft Database Schema ✅
- Existing SMS notification system ✅
- Firebase real-time capabilities ✅
- Authentication middleware ✅

## Risk Assessment
**Medium Risk**: Real-time functionality complexity
**Mitigation**: Start with SSE, fallback to polling if needed

## Notes
- Consider implementing optimistic updates on frontend
- Plan for draft session persistence across server restarts
- Implement rate limiting for pick API calls
- Consider using Redis for timer state if scaling becomes an issue
