import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { DraftSession, CreateDraftSessionRequest } from '../../../../../lib/draft-types';

export const dynamic = 'force-dynamic';

// GET /api/draft/sessions - List draft sessions with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const seasonId = searchParams.get('seasonId');
    const status = searchParams.get('status');
    const limitParam = parseInt(searchParams.get('limit') || '50');

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 503 });
    }

    const sessionsRef = collection(db, 'draft_sessions');
    let q = query(sessionsRef, orderBy('createdAt', 'desc'), limit(limitParam));

    // Apply filters
    if (leagueId) {
      q = query(q, where('leagueId', '==', leagueId));
    }
    if (seasonId) {
      q = query(q, where('seasonId', '==', seasonId));
    }
    if (status) {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      sessions,
      total: sessions.length
    });

  } catch (error: any) {
    console.error('Error fetching draft sessions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch draft sessions',
      details: error.message
    }, { status: 500 });
  }
}

// POST /api/draft/sessions - Create new draft session
export async function POST(request: NextRequest) {
  try {
    const data: CreateDraftSessionRequest = await request.json();

    // Validate required fields
    if (!data.leagueId || !data.seasonId || !data.name || !data.teamIds || data.teamIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: leagueId, seasonId, name, teamIds'
      }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 503 });
    }

    // Generate draft order (simple snake draft for now)
    const draftOrder = generateDraftOrder(data.teamIds, data.totalRounds || 15);

    const sessionData: Omit<DraftSession, 'id'> = {
      leagueId: data.leagueId,
      seasonId: data.seasonId,
      name: data.name,
      status: 'scheduled',
      totalRounds: data.totalRounds || 15,
      currentRound: 0,
      currentPick: 0,
      pickTimerSeconds: data.pickTimerSeconds || 120, // 2 minutes default
      draftOrder: draftOrder,
      currentTeamId: draftOrder[0], // First team in draft order
      timerExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system' // TODO: Get from auth context
    };

    const docRef = await addDoc(collection(db, 'draft_sessions'), sessionData);

    return NextResponse.json({
      success: true,
      session: {
        id: docRef.id,
        ...sessionData
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating draft session:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create draft session',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to generate snake draft order
function generateDraftOrder(teamIds: string[], totalRounds: number): string[] {
  const order: string[] = [];
  const teams = [...teamIds];

  for (let round = 1; round <= totalRounds; round++) {
    if (round % 2 === 1) {
      // Odd rounds: normal order
      order.push(...teams);
    } else {
      // Even rounds: reverse order (snake draft)
      order.push(...teams.reverse());
      teams.reverse(); // Put back in original order for next round
    }
  }

  return order;
}
