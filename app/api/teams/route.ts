import { NextRequest, NextResponse } from 'next/server';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS, Team } from '@/lib/firestore-schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');
    const leagueId = searchParams.get('leagueId');

    let snapshot;
    
    if (seasonId) {
      const teamsQuery = query(
        collection(db, COLLECTIONS.TEAMS),
        where('seasonId', '==', seasonId),
        orderBy('name')
      );
      snapshot = await getDocs(teamsQuery);
    } else if (leagueId) {
      const teamsQuery = query(
        collection(db, COLLECTIONS.TEAMS),
        where('leagueId', '==', leagueId),
        orderBy('name')
      );
      snapshot = await getDocs(teamsQuery);
    } else {
      snapshot = await getDocs(collection(db, COLLECTIONS.TEAMS));
    }

    const teams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      division,
      coachId,
      coachName,
      seasonId,
      leagueId,
      maxRosterSize = 12,
      primaryColor = '#007bff',
      secondaryColor = '#6c757d'
    } = body;

    if (!name || !division || !coachId || !seasonId || !leagueId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const teamData: Omit<Team, 'id'> = {
      name,
      division,
      coachId,
      coachName,
      seasonId,
      leagueId,
      players: [],
      maxRosterSize,
      currentRosterSize: 0,
      rosterLocked: false,
      stats: {
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        gamesPlayed: 0,
        winPercentage: 0,
        pointsDifferential: 0
      },
      socialMediaStats: {
        followers: 0,
        engagement: 0
      },
      draftOrder: 0,
      draftPicks: [],
      availableTrades: 3,
      primaryColor,
      secondaryColor,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.TEAMS), teamData);
    
    return NextResponse.json({
      id: docRef.id,
      ...teamData
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const teamRef = doc(db, COLLECTIONS.TEAMS, id);
    await updateDoc(teamRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, COLLECTIONS.TEAMS, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}
