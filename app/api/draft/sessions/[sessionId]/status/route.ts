import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { DraftStatusResponse } from '@/lib/draft-types';

export const dynamic = 'force-dynamic';

// GET /api/draft/sessions/[sessionId]/status - Get real-time draft status
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

    const sessionData = sessionSnap.data();

    // Get recent picks (last 5 for real-time updates)
    const picksRef = collection(db, 'draft_picks');
    const recentPicksQuery = query(
      picksRef,
      where('sessionId', '==', sessionId),
      orderBy('pickedAt', 'desc'),
      limit(5)
    );
    const picksSnap = await getDocs(recentPicksQuery);
    const recentPicks = picksSnap.docs.map(doc => {
      const data = doc.data();
      return {
        round: data.round,
        pick: data.pickNumber,
        teamId: data.teamId,
        playerId: data.playerId,
        playerName: 'Unknown Player', // TODO: Fetch player name
        teamName: 'Unknown Team', // TODO: Fetch team name
        timestamp: data.pickedAt?.toDate ? data.pickedAt.toDate() : new Date(data.pickedAt)
      };
    });

    // Calculate time remaining
    let timeRemaining = 0;
    if (sessionData.timerExpiresAt && sessionData.status === 'active') {
      const expiresAt = sessionData.timerExpiresAt.toDate ? sessionData.timerExpiresAt.toDate() : new Date(sessionData.timerExpiresAt);
      timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    }

    // Get available players (simplified - in real implementation, this would filter out drafted players)
    // For now, return empty array - this would be implemented based on specific requirements
    const availablePlayers: any[] = [];

    const response: DraftStatusResponse = {
      sessionId,
      status: sessionData.status,
      currentRound: sessionData.currentRound,
      currentPick: sessionData.currentPick,
      timeRemaining,
      nextTeamId: sessionData.currentTeamId,
      timerExpiresAt: sessionData.timerExpiresAt?.toDate ? sessionData.timerExpiresAt.toDate() : new Date(sessionData.timerExpiresAt),
      recentPicks,
      availablePlayers
    };

    return NextResponse.json({
      success: true,
      ...response
    });

  } catch (error: any) {
    console.error('Error fetching draft status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch draft status',
      details: error.message
    }, { status: 500 });
  }
}
