import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { DraftSession, DraftPick, DraftPickRequest } from '@/lib/draft-types';

export const dynamic = 'force-dynamic';

// POST /api/draft/sessions/[sessionId]/pick - Make a draft pick
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const pickData: DraftPickRequest = await request.json();

    // Validate required fields
    if (!pickData.playerId || !pickData.teamId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: playerId, teamId'
      }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 503 });
    }

    // Get current session state
    const sessionRef = doc(db, 'draft_sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Draft session not found'
      }, { status: 404 });
    }

    const sessionData = sessionSnap.data() as DraftSession;

    // Validate session is active
    if (sessionData.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Draft session is not active'
      }, { status: 400 });
    }

    // Validate it's the correct team's turn
    if (sessionData.currentTeamId !== pickData.teamId) {
      return NextResponse.json({
        success: false,
        error: 'Not this team\'s turn to pick'
      }, { status: 400 });
    }

    // Check if player is available (not already drafted)
    const playersRef = collection(db, 'players');
    const playerQuery = query(playersRef, where('__name__', '==', pickData.playerId));
    const playerSnap = await getDocs(playerQuery);

    if (playerSnap.empty) {
      return NextResponse.json({
        success: false,
        error: 'Player not found'
      }, { status: 404 });
    }

    const playerData = playerSnap.docs[0].data();

    // Check if player is already drafted
    if (playerData.draftStatus === 'drafted') {
      return NextResponse.json({
        success: false,
        error: 'Player has already been drafted'
      }, { status: 400 });
    }

    // Create the draft pick record
    const pickRecord: Omit<DraftPick, 'id'> = {
      sessionId,
      round: sessionData.currentRound,
      pickNumber: sessionData.currentPick,
      teamId: pickData.teamId,
      playerId: pickData.playerId,
      pickType: pickData.pickType || 'manual',
      pickedAt: Timestamp.now(),
      pickDurationSeconds: calculatePickDuration(sessionData.timerExpiresAt)
    };

    // Add pick to database
    await addDoc(collection(db, 'draft_picks'), pickRecord);

    // Update player status
    const playerRef = doc(db, 'players', pickData.playerId);
    await updateDoc(playerRef, {
      draftStatus: 'drafted',
      draftedBy: pickData.teamId,
      draftedAt: Timestamp.now(),
      draftRound: sessionData.currentRound,
      draftPick: sessionData.currentPick,
      updatedAt: Timestamp.now()
    });

    // Calculate next pick
    const nextPick = getNextPick(sessionData);
    let nextTeamId = sessionData.draftOrder[nextPick - 1];
    let nextTimerExpiresAt = null;

    if (nextPick <= sessionData.draftOrder.length) {
      nextTimerExpiresAt = new Date();
      nextTimerExpiresAt.setSeconds(nextTimerExpiresAt.getSeconds() + sessionData.pickTimerSeconds);
    }

    // Update session state
    const sessionUpdates: any = {
      currentPick: nextPick,
      currentTeamId: nextTeamId,
      timerExpiresAt: nextTimerExpiresAt,
      updatedAt: Timestamp.now()
    };

    // Check if round is complete
    const picksInRound = sessionData.draftOrder.length;
    if (nextPick > picksInRound) {
      // Start next round
      const nextRound = sessionData.currentRound + 1;
      sessionUpdates.currentRound = nextRound;
      sessionUpdates.currentPick = 1;

      if (nextRound <= sessionData.totalRounds) {
        sessionUpdates.currentTeamId = sessionData.draftOrder[0]; // First team in next round
        sessionUpdates.timerExpiresAt = nextTimerExpiresAt;
      } else {
        // Draft complete
        sessionUpdates.status = 'completed';
        sessionUpdates.currentTeamId = null;
        sessionUpdates.timerExpiresAt = null;
      }
    }

    await updateDoc(sessionRef, sessionUpdates);

    return NextResponse.json({
      success: true,
      pick: {
        id: 'temp-id', // Would be set by addDoc
        ...pickRecord
      },
      nextPick,
      nextTeamId,
      timeRemaining: nextTimerExpiresAt ?
        Math.floor((nextTimerExpiresAt.getTime() - Date.now()) / 1000) : 0,
      sessionStatus: sessionUpdates.status || 'active'
    });

  } catch (error: any) {
    console.error('Error making draft pick:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to make draft pick',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to calculate how long the pick took
function calculatePickDuration(timerExpiresAt: any): number {
  if (!timerExpiresAt) return 0;

  const expiresAt = timerExpiresAt.toDate ? timerExpiresAt.toDate() : new Date(timerExpiresAt);
  const duration = (expiresAt.getTime() - Date.now()) / 1000;
  return Math.max(0, Math.floor(duration));
}

// Helper function to get next pick number
function getNextPick(session: DraftSession): number {
  return session.currentPick + 1;
}
