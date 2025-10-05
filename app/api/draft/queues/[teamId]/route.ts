import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { DraftQueue } from '../../../../../lib/draft-types';

export const dynamic = 'force-dynamic';

// POST /api/draft/queues/[teamId] - Update team draft queue
export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params;
    const { sessionId, playerQueue }: { sessionId: string, playerQueue: string[] } = await request.json();

    // Validate required fields
    if (!sessionId || !playerQueue || !Array.isArray(playerQueue)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: sessionId, playerQueue (array)'
      }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 503 });
    }

    // Verify session exists and is active
    const sessionRef = doc(db, 'draft_sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Draft session not found'
      }, { status: 404 });
    }

    const sessionData = sessionSnap.data();

    if (sessionData.status !== 'active' && sessionData.status !== 'scheduled') {
      return NextResponse.json({
        success: false,
        error: 'Draft session is not active or scheduled'
      }, { status: 400 });
    }

    // Verify team is part of the draft
    if (!sessionData.draftOrder.includes(teamId)) {
      return NextResponse.json({
        success: false,
        error: 'Team is not participating in this draft session'
      }, { status: 400 });
    }

    // Validate player queue (check if players exist and are available)
    for (const playerId of playerQueue) {
      const playerRef = doc(db, 'players', playerId);
      const playerSnap = await getDoc(playerRef);

      if (!playerSnap.exists()) {
        return NextResponse.json({
          success: false,
          error: `Player ${playerId} not found`
        }, { status: 400 });
      }

      // In a real implementation, you might want to check if players are still available
      // For now, we'll allow any valid player IDs
    }

    // Create or update draft queue
    const queueId = `${sessionId}_${teamId}`;
    const queueRef = doc(db, 'draft_queues', queueId);

    const queueData: Omit<DraftQueue, 'id'> = {
      sessionId,
      teamId,
      playerQueue,
      updatedAt: new Date()
    };

    await setDoc(queueRef, queueData, { merge: true });

    return NextResponse.json({
      success: true,
      queue: {
        id: queueId,
        ...queueData
      }
    });

  } catch (error: any) {
    console.error('Error updating draft queue:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update draft queue',
      details: error.message
    }, { status: 500 });
  }
}

// GET /api/draft/queues/[teamId] - Get team draft queue
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId query parameter is required'
      }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 503 });
    }

    // Get draft queue
    const queueId = `${sessionId}_${teamId}`;
    const queueRef = doc(db, 'draft_queues', queueId);
    const queueSnap = await getDoc(queueRef);

    if (!queueSnap.exists()) {
      return NextResponse.json({
        success: true,
        queue: null,
        message: 'No draft queue found for this team/session'
      });
    }

    return NextResponse.json({
      success: true,
      queue: {
        id: queueSnap.id,
        ...queueSnap.data()
      }
    });

  } catch (error: any) {
    console.error('Error fetching draft queue:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch draft queue',
      details: error.message
    }, { status: 500 });
  }
}
