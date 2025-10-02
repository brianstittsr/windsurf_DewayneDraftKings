import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/players/swap - Swap player between teams/coaches
export async function POST(request: NextRequest) {
  try {
    const { playerId, fromTeamId, toTeamId, reason } = await request.json();

    if (!playerId || !toTeamId) {
      return NextResponse.json({
        success: false,
        error: 'Player ID and target team ID are required'
      }, { status: 400 });
    }

    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { doc, getDoc, updateDoc, addDoc, collection, Timestamp } = await import('firebase/firestore');
    
    // Get player data
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);
    
    if (!playerSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Player not found'
      }, { status: 404 });
    }

    // Get target team data
    const teamRef = doc(db, 'teams', toTeamId);
    const teamSnap = await getDoc(teamRef);
    
    if (!teamSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Target team not found'
      }, { status: 404 });
    }

    const playerData = playerSnap.data();
    const teamData = teamSnap.data();

    // Update player's team assignment
    await updateDoc(playerRef, {
      currentTeamId: toTeamId,
      currentTeamName: teamData.name,
      currentCoachId: teamData.coachId,
      currentCoachName: teamData.coachName,
      lastSwapDate: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Log the swap in transfer history
    const transferData = {
      playerId,
      playerName: `${playerData.firstName} ${playerData.lastName}`,
      fromTeamId: fromTeamId || null,
      fromTeamName: playerData.currentTeamName || 'Unassigned',
      toTeamId,
      toTeamName: teamData.name,
      fromCoachId: playerData.currentCoachId || null,
      fromCoachName: playerData.currentCoachName || 'N/A',
      toCoachId: teamData.coachId,
      toCoachName: teamData.coachName,
      reason: reason || '',
      swappedBy: 'admin', // TODO: Get from auth
      swappedAt: Timestamp.now()
    };

    await addDoc(collection(db, 'player_transfers'), transferData);

    return NextResponse.json({
      success: true,
      message: 'Player swapped successfully',
      transfer: transferData
    });

  } catch (error) {
    console.error('Error swapping player:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to swap player',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
