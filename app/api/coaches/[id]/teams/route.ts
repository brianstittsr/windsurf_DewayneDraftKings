import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/coaches/[id]/teams - Get teams for a specific coach
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: coachId } = params;

    const { db } = await import('../../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: true,
        teams: []
      });
    }

    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    // Get teams where this coach is assigned
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('coachId', '==', coachId));
    const teamsSnapshot = await getDocs(q);
    
    const teams = [];
    
    for (const teamDoc of teamsSnapshot.docs) {
      const teamData = teamDoc.data();
      
      // Get players for this team
      const playersRef = collection(db, 'players');
      const playersQuery = query(playersRef, where('teamId', '==', teamDoc.id));
      const playersSnapshot = await getDocs(playersQuery);
      
      const players = playersSnapshot.docs.map(playerDoc => ({
        id: playerDoc.id,
        ...playerDoc.data(),
        createdAt: playerDoc.data().createdAt?.toDate?.()?.toISOString() || null
      }));
      
      teams.push({
        id: teamDoc.id,
        ...teamData,
        players,
        createdAt: teamData.createdAt?.toDate?.()?.toISOString() || null
      });
    }

    return NextResponse.json({
      success: true,
      teams,
      count: teams.length
    });

  } catch (error: any) {
    console.error('Error fetching coach teams:', error);
    return NextResponse.json({
      success: true,
      teams: [],
      error: error.message
    });
  }
}
