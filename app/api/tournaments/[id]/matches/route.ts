import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PATCH /api/tournaments/[id]/matches - Update match result
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { match } = await request.json();

    if (!match) {
      return NextResponse.json({
        success: false,
        error: 'Match data is required'
      }, { status: 400 });
    }

    const { db } = await import('../../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    
    const tournamentRef = doc(db, 'tournaments', id);
    const tournamentSnap = await getDoc(tournamentRef);
    
    if (!tournamentSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Tournament not found'
      }, { status: 404 });
    }

    const tournament = tournamentSnap.data();
    const updatedMatches = tournament.matches.map((m: any) => 
      m.id === match.id ? match : m
    );

    await updateDoc(tournamentRef, {
      matches: updatedMatches,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Match updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating match:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update match',
      details: error.message
    }, { status: 500 });
  }
}
