import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { DraftSession, DraftPick } from '@/lib/draft-types';

export const dynamic = 'force-dynamic';

// GET /api/draft/sessions/[sessionId] - Get specific draft session with current status
export async function GET(
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

    // Get recent picks (last 10)
    const picksRef = collection(db, 'draft_picks');
    const picksQuery = query(
      picksRef,
      where('sessionId', '==', sessionId),
      where('round', '==', sessionData.currentRound)
    );
    const picksSnap = await getDocs(picksQuery);
    const recentPicks = picksSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate time remaining
    let timeRemaining = 0;
    if (sessionData.timerExpiresAt && sessionData.status === 'active') {
      const expiresAt = sessionData.timerExpiresAt.toDate();
      timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    }

    return NextResponse.json({
      success: true,
      session: {
        id: sessionSnap.id,
        ...sessionData
      },
      timeRemaining,
      recentPicks,
      availablePlayers: [] // TODO: Implement player availability logic
    });

  } catch (error: any) {
    console.error('Error fetching draft session:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch draft session',
      details: error.message
    }, { status: 500 });
  }
}

// PUT /api/draft/sessions/[sessionId] - Update draft session
export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const updates = await request.json();

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 503 });
    }

    const sessionRef = doc(db, 'draft_sessions', sessionId);

    // Add updated timestamp
    updates.updatedAt = Timestamp.now();

    await updateDoc(sessionRef, updates);

    // Get updated session
    const updatedSnap = await getDoc(sessionRef);

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSnap.id,
        ...updatedSnap.data()
      }
    });

  } catch (error: any) {
    console.error('Error updating draft session:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update draft session',
      details: error.message
    }, { status: 500 });
  }
}

// POST /api/draft/sessions/[sessionId]/start - Start the draft session
export async function startDraft(sessionId: string) {
  try {
    const sessionRef = doc(db, 'draft_sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error('Draft session not found');
    }

    const sessionData = sessionSnap.data() as DraftSession;

    if (sessionData.status !== 'scheduled') {
      throw new Error('Draft session is not in scheduled status');
    }

    // Set timer for first pick
    const timerExpiresAt = new Date();
    timerExpiresAt.setSeconds(timerExpiresAt.getSeconds() + sessionData.pickTimerSeconds);

    await updateDoc(sessionRef, {
      status: 'active',
      currentRound: 1,
      currentPick: 1,
      currentTeamId: sessionData.draftOrder[0],
      timerExpiresAt,
      updatedAt: Timestamp.now()
    });

    return { success: true };

  } catch (error: any) {
    console.error('Error starting draft:', error);
    throw error;
  }
}
