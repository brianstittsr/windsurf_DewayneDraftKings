import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { DraftSession } from '../../../../../../lib/draft-types';

export const dynamic = 'force-dynamic';

// POST /api/draft/sessions/[sessionId]/start - Start the draft session
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 503 });
    }

    // Get session data
    const sessionRef = doc(db, 'draft_sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Draft session not found'
      }, { status: 404 });
    }

    const sessionData = sessionSnap.data() as DraftSession;

    // Validate session can be started
    if (sessionData.status !== 'scheduled') {
      return NextResponse.json({
        success: false,
        error: `Cannot start draft session with status: ${sessionData.status}`
      }, { status: 400 });
    }

    // Set timer for first pick
    const timerExpiresAt = new Date();
    timerExpiresAt.setSeconds(timerExpiresAt.getSeconds() + sessionData.pickTimerSeconds);

    // Update session to active
    await updateDoc(sessionRef, {
      status: 'active',
      currentRound: 1,
      currentPick: 1,
      currentTeamId: sessionData.draftOrder[0], // First team in draft order
      timerExpiresAt: Timestamp.fromDate(timerExpiresAt),
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Draft session started successfully',
      session: {
        id: sessionSnap.id,
        ...sessionData,
        status: 'active',
        currentRound: 1,
        currentPick: 1,
        currentTeamId: sessionData.draftOrder[0],
        timerExpiresAt
      }
    });

  } catch (error: any) {
    console.error('Error starting draft session:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to start draft session',
      details: error.message
    }, { status: 500 });
  }
}
