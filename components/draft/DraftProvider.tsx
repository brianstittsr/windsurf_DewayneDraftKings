'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { collection, doc, onSnapshot, query, where, orderBy, addDoc, updateDoc, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestore-schema';
import { DraftSession, DraftPick, DraftQueue, Player, Team } from '@/lib/firestore-schema';

interface DraftContextType {
  // Session Data
  session: DraftSession | null;
  sessionId: string | null;
  loading: boolean;
  error: string | null;

  // Current State
  currentRound: number;
  currentPick: number;
  timeRemaining: number;
  isMyTurn: boolean;
  currentTeamId: string | null;

  // Data
  availablePlayers: Player[];
  teams: Team[];
  recentPicks: DraftPick[];
  draftQueues: DraftQueue[];

  // Actions
  joinDraft: (sessionId: string) => Promise<void>;
  leaveDraft: () => void;
  makePick: (playerId: string) => Promise<boolean>;
  updateQueue: (playerQueue: string[]) => Promise<void>;
  refreshData: () => Promise<void>;

  // Connection Status
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

interface DraftProviderProps {
  children: ReactNode;
  initialSessionId?: string;
}

export function DraftProvider({ children, initialSessionId }: DraftProviderProps) {
  // State
  const [session, setSession] = useState<DraftSession | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [recentPicks, setRecentPicks] = useState<DraftPick[]>([]);
  const [draftQueues, setDraftQueues] = useState<DraftQueue[]>([]);

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // Computed values
  const currentRound = session?.currentRound || 1;
  const currentPick = session?.currentPick || 1;
  const currentTeamId = session?.currentTeamId || null;

  // Calculate time remaining
  const [timeRemaining, setTimeRemaining] = useState(0);
  useEffect(() => {
    if (!session?.timerExpiresAt) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const now = Timestamp.now();
      const expires = session.timerExpiresAt;
      const remaining = Math.max(0, Math.floor((expires.seconds - now.seconds)));
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session?.timerExpiresAt]);

  // Timer management with automatic picks
  useEffect(() => {
    if (!session || !sessionId || session.status !== 'active') return;

    const checkTimerExpiration = () => {
      const now = Timestamp.now();
      const expires = session.timerExpiresAt;

      if (now.seconds >= expires.seconds) {
        // Timer expired - trigger auto-pick
        handleAutoPick();
      }
    };

    // Check immediately and then every second
    checkTimerExpiration();
    const interval = setInterval(checkTimerExpiration, 1000);

    return () => clearInterval(interval);
  }, [session?.timerExpiresAt, session?.status]);

  // Auto-pick logic
  const handleAutoPick = useCallback(async () => {
    if (!sessionId || !session || !currentTeamId) return;

    try {
      // Get team's draft queue
      const queueQuery = query(
        collection(db, COLLECTIONS.DRAFT_QUEUES),
        where('sessionId', '==', sessionId),
        where('teamId', '==', currentTeamId)
      );

      const queueSnapshot = await getDocs(queueQuery);
      const teamQueue = queueSnapshot.docs[0]?.data() as DraftQueue;

      let playerIdToPick: string | null = null;

      if (teamQueue?.playerQueue && teamQueue.playerQueue.length > 0) {
        // Pick from queue
        playerIdToPick = teamQueue.playerQueue[0];

        // Remove from queue
        const updatedQueue = teamQueue.playerQueue.slice(1);
        await updateDoc(doc(db, COLLECTIONS.DRAFT_QUEUES, queueSnapshot.docs[0].id), {
          playerQueue: updatedQueue,
          updatedAt: Timestamp.now()
        });
      } else {
        // No queue - pick random available player
        const playersQuery = query(
          collection(db, COLLECTIONS.PLAYERS),
          where('draftStatus', 'in', ['available', null])
        );

        const playersSnapshot = await getDocs(playersQuery);
        const availablePlayers = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (availablePlayers.length > 0) {
          playerIdToPick = availablePlayers[Math.floor(Math.random() * availablePlayers.length)].id;
        }
      }

      if (playerIdToPick) {
        await makePickInternal(playerIdToPick, 'auto');
      }
    } catch (error) {
      console.error('Auto-pick failed:', error);
      // Try to advance to next pick anyway
      await advanceToNextPick();
    }
  }, [sessionId, session, currentTeamId]);

  // Send Facebook notification for draft pick
  const sendFacebookNotification = useCallback(async (pick: DraftPick, player: Player, team: Team) => {
    try {
      // TODO: Implement Facebook API integration
      // This would post to Facebook when a pick is made
      console.log('Facebook notification:', { pick, player, team });
    } catch (error) {
      console.error('Error sending Facebook notification:', error);
    }
  }, []);

  // Send SMS notification for draft pick
  const sendDraftPickNotification = useCallback(async (pick: DraftPick, player: Player, team: Team) => {
    try {
      const message = `🏈 DRAFT ALERT: ${team.name} selected ${player.firstName} ${player.lastName} with pick #${pick.overallPick} (Round ${pick.round}, Pick ${pick.pickNumber})`;

      // Send to all SMS opt-in users
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientType: 'all',
          message,
          scheduled: false
        }),
      });

      if (!response.ok) {
        console.error('Failed to send SMS notification:', await response.text());
      }
    } catch (error) {
      console.error('Error sending draft pick SMS:', error);
    }
  }, []);

  // Internal make pick function
  const makePickInternal = useCallback(async (playerId: string, pickType: 'auto' | 'manual' = 'manual') => {
    if (!sessionId || !session || !currentTeamId) return false;

    try {
      // Create the pick record
      const pickData = {
        sessionId,
        round: currentRound,
        pickNumber: currentPick,
        overallPick: ((currentRound - 1) * session.draftOrder.length) + currentPick,
        teamId: currentTeamId,
        playerId,
        pickType,
        pickDurationSeconds: pickType === 'auto' ? session.pickTimerSeconds : session.pickTimerSeconds - timeRemaining,
        pickedBy: pickType === 'auto' ? 'system' : 'current-user', // TODO: Get from auth context
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, COLLECTIONS.DRAFT_PICKS), pickData);

      // Update player's draft status
      const playerRef = doc(db, COLLECTIONS.PLAYERS, playerId);
      await updateDoc(playerRef, {
        draftStatus: 'drafted',
        draftedBy: currentTeamId,
        draftedAt: Timestamp.now(),
        draftRound: currentRound,
        draftPick: currentPick,
        updatedAt: Timestamp.now()
      });

      // Get player and team data for notifications
      const [playerDoc, teamDoc] = await Promise.all([
        getDoc(doc(db, COLLECTIONS.PLAYERS, playerId)),
        getDoc(doc(db, COLLECTIONS.TEAMS, currentTeamId))
      ]);

      if (playerDoc.exists() && teamDoc.exists()) {
        const player = { id: playerDoc.id, ...playerDoc.data() } as Player;
        const team = { id: teamDoc.id, ...teamDoc.data() } as Team;

        // Send SMS notification
        await sendDraftPickNotification(pickData as DraftPick, player, team);

        // Send Facebook notification if integrated
        await sendFacebookNotification(pickData as DraftPick, player, team);
      }

      // Advance to next pick
      await advanceToNextPick();

      return true;
    } catch (error: any) {
      console.error('Failed to make pick:', error);
      setError(error.message || 'Failed to make draft pick');
      return false;
    }
  }, [sessionId, session, currentTeamId, currentRound, currentPick, timeRemaining, sendDraftPickNotification]);

  // Advance to next pick
  const advanceToNextPick = useCallback(async () => {
    if (!sessionId || !session) return;

    try {
      const totalTeams = session.draftOrder.length;
      const totalPicks = session.totalRounds * totalTeams;

      let nextRound = currentRound;
      let nextPick = currentPick + 1;

      // Handle snake draft logic
      if (session.pickType === 'snake') {
        if (nextPick > totalTeams) {
          nextRound += 1;
          nextPick = 1;

          // Reverse order for snake draft on odd rounds (rounds 2, 4, etc.)
          if (nextRound % 2 === 0) {
            // Keep order the same for even rounds? Wait, snake draft typically reverses every round
            // Actually, standard snake draft: Round 1: 1-2-3-4-5-6, Round 2: 6-5-4-3-2-1, Round 3: 1-2-3-4-5-6, etc.
            // So odd rounds: normal order, even rounds: reverse order
          }
        }
      } else {
        // Linear draft
        if (nextPick > totalTeams) {
          nextRound += 1;
          nextPick = 1;
        }
      }

      // Check if draft is complete
      const nextOverallPick = ((nextRound - 1) * totalTeams) + nextPick;
      if (nextOverallPick > totalPicks) {
        // Draft complete
        await updateDoc(doc(db, COLLECTIONS.DRAFTS, sessionId), {
          status: 'completed',
          completedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        return;
      }

      // Determine next team
      let nextTeamId: string;
      if (session.pickType === 'snake' && nextRound % 2 === 0) {
        // Even round in snake draft - reverse order
        const reversedOrder = [...session.draftOrder].reverse();
        nextTeamId = reversedOrder[nextPick - 1];
      } else {
        // Normal order
        nextTeamId = session.draftOrder[nextPick - 1];
      }

      // Calculate next timer expiration
      const nextTimerExpiresAt = Timestamp.fromMillis(
        Timestamp.now().toMillis() + (session.pickTimerSeconds * 1000)
      );

      // Update session with next pick info
      await updateDoc(doc(db, COLLECTIONS.DRAFTS, sessionId), {
        currentRound: nextRound,
        currentPick: nextPick,
        currentTeamId: nextTeamId,
        timerExpiresAt: nextTimerExpiresAt,
        updatedAt: Timestamp.now()
      });

    } catch (error) {
      console.error('Failed to advance to next pick:', error);
    }
  }, [sessionId, session, currentRound, currentPick]);

  // Check if it's the current user's turn (simplified - would need user context)
  const isMyTurn = false; // TODO: Implement based on user authentication

  // Real-time subscriptions
  useEffect(() => {
    if (!sessionId || !db) return;

    setConnectionStatus('connecting');

    const unsubscribers: (() => void)[] = [];

    try {
      // Subscribe to draft session
      const sessionRef = doc(db, COLLECTIONS.DRAFTS, sessionId);
      const sessionUnsubscribe = onSnapshot(sessionRef, (doc) => {
        if (doc.exists()) {
          const sessionData = { id: doc.id, ...doc.data() } as DraftSession;
          setSession(sessionData);
          setConnectionStatus('connected');
        } else {
          setError('Draft session not found');
          setConnectionStatus('error');
        }
      }, (error) => {
        console.error('Session subscription error:', error);
        setError('Failed to connect to draft session');
        setConnectionStatus('error');
      });

      unsubscribers.push(sessionUnsubscribe);

      // Subscribe to recent picks
      const picksQuery = query(
        collection(db, COLLECTIONS.DRAFT_PICKS),
        where('sessionId', '==', sessionId),
        orderBy('createdAt', 'desc'),
        orderBy('overallPick', 'desc')
      );

      const picksUnsubscribe = onSnapshot(picksQuery, (snapshot) => {
        const picks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DraftPick[];
        setRecentPicks(picks);
      });

      unsubscribers.push(picksUnsubscribe);

      // Subscribe to draft queues
      const queuesQuery = query(
        collection(db, COLLECTIONS.DRAFT_QUEUES),
        where('sessionId', '==', sessionId)
      );

      const queuesUnsubscribe = onSnapshot(queuesQuery, (snapshot) => {
        const queues = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DraftQueue[];
        setDraftQueues(queues);
      });

      unsubscribers.push(queuesUnsubscribe);

    } catch (error) {
      console.error('Failed to set up subscriptions:', error);
      setConnectionStatus('error');
      setError('Failed to connect to draft system');
    }

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
      setConnectionStatus('disconnected');
    };
  }, [sessionId]);

  // Load available players and teams when session changes
  useEffect(() => {
    if (!session) return;

    const loadData = async () => {
      try {
        // Load available players (not yet drafted)
        const playersQuery = query(
          collection(db, COLLECTIONS.PLAYERS),
          where('draftStatus', 'in', ['available', null])
        );

        const playersSnapshot = await getDoc(doc(db, COLLECTIONS.PLAYERS, 'dummy')); // This would need proper querying
        // TODO: Implement proper player filtering

        // Load teams participating in draft
        const teamsQuery = query(
          collection(db, COLLECTIONS.TEAMS),
          where('__name__', 'in', session.draftOrder)
        );

        // TODO: Implement team loading based on draft order

      } catch (error) {
        console.error('Failed to load draft data:', error);
      }
    };

    loadData();
  }, [session]);

  // Actions
  const joinDraft = useCallback(async (newSessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const sessionRef = doc(db, COLLECTIONS.DRAFTS, newSessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        throw new Error('Draft session not found');
      }

      setSessionId(newSessionId);
    } catch (error: any) {
      setError(error.message || 'Failed to join draft');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveDraft = useCallback(() => {
    setSessionId(null);
    setSession(null);
    setRecentPicks([]);
    setDraftQueues([]);
    setError(null);
  }, []);

  const makePick = useCallback(async (playerId: string): Promise<boolean> => {
    if (!sessionId || !session || !currentTeamId) {
      setError('Not in an active draft session');
      return false;
    }

    if (session.status !== 'active') {
      setError('Draft is not currently active');
      return false;
    }

    try {
      // Create the pick record
      const pickData = {
        sessionId,
        round: currentRound,
        pickNumber: currentPick,
        overallPick: ((currentRound - 1) * session.draftOrder.length) + currentPick,
        teamId: currentTeamId,
        playerId,
        pickType: 'manual' as const,
        pickDurationSeconds: session.pickTimerSeconds - timeRemaining,
        pickedBy: 'current-user', // TODO: Get from auth context
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, COLLECTIONS.DRAFT_PICKS), pickData);

      // Update player's draft status
      const playerRef = doc(db, COLLECTIONS.PLAYERS, playerId);
      await updateDoc(playerRef, {
        draftStatus: 'drafted',
        draftedBy: currentTeamId,
        draftedAt: Timestamp.now(),
        draftRound: currentRound,
        draftPick: currentPick,
        updatedAt: Timestamp.now()
      });

      return true;
    } catch (error: any) {
      console.error('Failed to make pick:', error);
      setError(error.message || 'Failed to make draft pick');
      return false;
    }
  }, [sessionId, session, currentTeamId, currentRound, currentPick, timeRemaining]);

  const updateQueue = useCallback(async (playerQueue: string[]) => {
    if (!sessionId || !currentTeamId) return;

    try {
      // Find existing queue or create new one
      const existingQueue = draftQueues.find(q => q.teamId === currentTeamId);

      const queueData = {
        sessionId,
        teamId: currentTeamId,
        playerQueue,
        updatedAt: Timestamp.now(),
        updatedBy: 'current-user' // TODO: Get from auth context
      };

      if (existingQueue) {
        // Update existing queue
        const queueRef = doc(db, COLLECTIONS.DRAFT_QUEUES, existingQueue.id);
        await updateDoc(queueRef, queueData);
      } else {
        // Create new queue
        await addDoc(collection(db, COLLECTIONS.DRAFT_QUEUES), {
          ...queueData,
          isActive: true
        });
      }
    } catch (error: any) {
      console.error('Failed to update queue:', error);
      setError(error.message || 'Failed to update draft queue');
    }
  }, [sessionId, currentTeamId, draftQueues]);

  const refreshData = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      // Force refresh by re-joining
      await joinDraft(sessionId);
    } catch (error) {
      // Error already handled in joinDraft
    } finally {
      setLoading(false);
    }
  }, [sessionId, joinDraft]);

  const value: DraftContextType = {
    // Session Data
    session,
    sessionId,
    loading,
    error,

    // Current State
    currentRound,
    currentPick,
    timeRemaining,
    isMyTurn,
    currentTeamId,

    // Data
    availablePlayers,
    teams,
    recentPicks,
    draftQueues,

    // Actions
    joinDraft,
    leaveDraft,
    makePick,
    updateQueue,
    refreshData,

    // Connection Status
    connectionStatus
  };

  return (
    <DraftContext.Provider value={value}>
      {children}
    </DraftContext.Provider>
  );
}

export function useDraft() {
  const context = useContext(DraftContext);
  if (context === undefined) {
    throw new Error('useDraft must be used within a DraftProvider');
  }
  return context;
}
