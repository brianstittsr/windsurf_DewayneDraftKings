// Draft System Database Types and Schemas
// Fantasy Football-Style Player Draft System

export interface DraftSession {
  id: string;
  leagueId: string;
  seasonId: string;
  name: string;
  status: 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  totalRounds: number;
  currentRound: number;
  currentPick: number;
  pickTimerSeconds: number;
  draftOrder: string[]; // Array of team IDs in draft order
  currentTeamId: string;
  timerExpiresAt: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy: string;
}

export interface DraftPick {
  id: string;
  sessionId: string;
  round: number;
  pickNumber: number;
  teamId: string;
  playerId: string;
  pickType: 'auto' | 'manual' | 'trade';
  pickedAt: FirebaseFirestore.Timestamp;
  pickDurationSeconds: number; // How long the pick took
  pickedBy?: string; // User ID who made the pick
}

export interface DraftQueue {
  id: string;
  sessionId: string;
  teamId: string;
  playerQueue: string[]; // Array of player IDs in priority order
  updatedAt: FirebaseFirestore.Timestamp;
  updatedBy: string;
}

// Extended Player interface for draft functionality
export interface PlayerWithDraft {
  // Existing fields from Player interface
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  teamId?: string;
  jerseyNumber?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  updatedAt?: FirebaseFirestore.Timestamp;

  // Draft-related fields (optional to maintain compatibility)
  draftStatus?: 'available' | 'drafted' | 'protected';
  draftedBy?: string; // team ID
  draftedAt?: FirebaseFirestore.Timestamp;
  draftRound?: number;
  draftPick?: number;
  draftValue?: number; // Projected fantasy points or ranking
}

// Extended Team interface for draft functionality
export interface TeamWithDraft {
  // Existing fields from Team interface
  name: string;
  shortName?: string;
  division?: string;
  coachId?: string;
  coachName?: string;
  description?: string;
  maxRosterSize?: number;
  ageGroup?: string;
  skillLevel?: string;
  homeField?: string;
  isActive?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  updatedAt?: FirebaseFirestore.Timestamp;

  // Draft-related fields (optional to maintain compatibility)
  draftPosition?: number; // Overall draft position (1-20, etc.)
  draftPicksCompleted?: number;
  draftPicksRemaining?: number;
  draftQueue?: string[]; // Player IDs in draft priority order
}

// Draft Session Creation Request
export interface CreateDraftSessionRequest {
  leagueId: string;
  seasonId: string;
  name: string;
  totalRounds: number;
  pickTimerSeconds: number;
  teamIds: string[]; // Teams participating in draft
  draftOrder?: 'snake' | 'linear' | 'custom';
  customOrder?: string[]; // Custom team order if draftOrder is 'custom'
}

// Draft Pick Request
export interface DraftPickRequest {
  playerId: string;
  teamId: string;
  pickType?: 'auto' | 'manual' | 'trade';
}

// Draft Session Status Response
export interface DraftStatusResponse {
  sessionId: string;
  status: string;
  currentRound: number;
  currentPick: number;
  timeRemaining: number; // seconds
  nextTeamId: string;
  timerExpiresAt: Date;
  recentPicks: Array<{
    round: number;
    pick: number;
    teamId: string;
    playerId: string;
    playerName: string;
    teamName: string;
    timestamp: Date;
  }>;
  availablePlayers: Array<{
    id: string;
    name: string;
    position?: string;
    stats?: object;
    draftValue?: number;
  }>;
}

// Draft Analytics
export interface DraftAnalytics {
  sessionId: string;
  totalPicks: number;
  averagePickTime: number;
  longestPick: number;
  shortestPick: number;
  teamsParticipating: number;
  completionTime: number; // Total time for draft
  createdAt: FirebaseFirestore.Timestamp;
}

