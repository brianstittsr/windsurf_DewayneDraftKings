# Story: Draft Database Schema Implementation

**Story ID:** DK-DRAFT-1.1
**Epic:** Fantasy Football-Style Player Draft System
**Status:** Ready for Development
**Priority:** Critical
**Estimated Effort:** 4-6 hours
**Assignee:** Development Team

## User Story
As a developer, I want to establish the database schema for draft management, so that draft sessions, picks, and player queues can be stored and retrieved efficiently.

## Acceptance Criteria

### Functional Requirements
- [ ] New Firestore collections created: `draft_sessions`, `draft_picks`, `draft_queues`
- [ ] Existing `players` collection extended with draft-related fields
- [ ] Existing `teams` collection extended with draft position and status
- [ ] Firebase security rules updated for draft data access
- [ ] Database indexes created for efficient draft queries
- [ ] Migration script for existing player data (optional draft fields)

### Technical Requirements
- [ ] Schema follows existing Firestore patterns and naming conventions
- [ ] Proper data validation and type safety with TypeScript interfaces
- [ ] Efficient queries for real-time draft status updates
- [ ] Scalable design supporting multiple concurrent drafts
- [ ] Backup and recovery considerations for draft data

### Integration Requirements
- [ ] No disruption to existing player registration flow
- [ ] Existing team management queries remain performant
- [ ] Backward compatibility with current player/team data structures
- [ ] Admin dashboard can access draft data without performance impact

## Technical Design

### Database Schema

#### draft_sessions Collection
```typescript
interface DraftSession {
  id: string;
  leagueId: string;
  seasonId: string;
  name: string;
  status: 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  totalRounds: number;
  currentRound: number;
  currentPick: number;
  pickTimerSeconds: number;
  draftOrder: string[]; // Array of team IDs
  currentTeamId: string;
  timerExpiresAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

#### draft_picks Collection
```typescript
interface DraftPick {
  id: string;
  sessionId: string;
  round: number;
  pickNumber: number;
  teamId: string;
  playerId: string;
  pickType: 'auto' | 'manual' | 'trade';
  pickedAt: Timestamp;
  pickDurationSeconds: number; // How long the pick took
}
```

#### draft_queues Collection
```typescript
interface DraftQueue {
  id: string;
  sessionId: string;
  teamId: string;
  playerQueue: string[]; // Array of player IDs in priority order
  updatedAt: Timestamp;
}
```

#### Extended players Collection
```typescript
interface Player {
  // ... existing fields ...
  draftStatus: 'available' | 'drafted' | 'protected';
  draftedBy?: string; // team ID
  draftedAt?: Timestamp;
  draftRound?: number;
  draftPick?: number;
}
```

#### Extended teams Collection
```typescript
interface Team {
  // ... existing fields ...
  draftPosition: number; // Overall draft position (1-20, etc.)
  draftPicksCompleted: number;
  draftPicksRemaining: number;
}
```

### Security Rules
```
match /draft_sessions/{sessionId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.token.admin == true;
}

match /draft_picks/{pickId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.token.admin == true;
}

match /draft_queues/{queueId} {
  allow read, write: if request.auth != null && resource.data.teamId == request.auth.uid;
}
```

## Implementation Plan

### Phase 1: Schema Design (1-2 hours)
1. Define TypeScript interfaces for all draft-related data structures
2. Review existing player/team schemas for extension points
3. Design efficient query patterns for real-time updates

### Phase 2: Collection Creation (1-2 hours)
1. Create new Firestore collections with proper indexes
2. Extend existing collections with draft fields
3. Update Firebase security rules

### Phase 3: Migration & Testing (1-2 hours)
1. Create migration script for adding draft fields to existing data
2. Test queries and performance with sample data
3. Validate security rules work correctly

## Testing Criteria

### Unit Tests
- [ ] Draft session creation with valid data
- [ ] Player draft status updates
- [ ] Team draft position assignments
- [ ] Security rules prevent unauthorized access

### Integration Tests
- [ ] Existing player queries remain functional
- [ ] Admin dashboard can read draft data
- [ ] Real-time listeners work with new collections
- [ ] No performance degradation on existing queries

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Database schema documented
- [ ] Migration tested on staging environment
- [ ] QA validation passed
- [ ] No existing functionality broken

## Dependencies
- Firebase/Firestore access
- Existing player/team data structures
- Admin authentication system

## Risk Assessment
**Low Risk**: Schema extensions are additive and backward compatible
**Mitigation**: Feature flags can disable draft functionality if issues arise

## Notes
- Consider using subcollections for better organization (e.g., draft_sessions/{sessionId}/picks)
- Implement data validation at application level since Firestore rules are limited
- Plan for draft data archival after season completion
