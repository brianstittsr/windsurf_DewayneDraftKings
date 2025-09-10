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
import { COLLECTIONS, Game } from '@/lib/firestore-schema';
import { StandingsService } from '@/lib/standings-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');
    const status = searchParams.get('status');
    const teamId = searchParams.get('teamId');

    let snapshot;
    
    if (seasonId && status) {
      const gamesQuery = query(
        collection(db, COLLECTIONS.GAMES),
        where('seasonId', '==', seasonId),
        where('status', '==', status),
        orderBy('scheduledDate', 'desc')
      );
      snapshot = await getDocs(gamesQuery);
    } else if (seasonId) {
      const gamesQuery = query(
        collection(db, COLLECTIONS.GAMES),
        where('seasonId', '==', seasonId),
        orderBy('scheduledDate', 'desc')
      );
      snapshot = await getDocs(gamesQuery);
    } else if (teamId) {
      // Get games for a specific team (either home or away)
      const homeGamesQuery = query(
        collection(db, COLLECTIONS.GAMES),
        where('homeTeamId', '==', teamId),
        orderBy('scheduledDate', 'desc')
      );
      const awayGamesQuery = query(
        collection(db, COLLECTIONS.GAMES),
        where('awayTeamId', '==', teamId),
        orderBy('scheduledDate', 'desc')
      );
      
      const [homeSnapshot, awaySnapshot] = await Promise.all([
        getDocs(homeGamesQuery),
        getDocs(awayGamesQuery)
      ]);
      
      const games = [
        ...homeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...awaySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ].sort((a: any, b: any) => b.scheduledDate.seconds - a.scheduledDate.seconds);
      
      return NextResponse.json({ games });
    } else {
      snapshot = await getDocs(collection(db, COLLECTIONS.GAMES));
    }

    const games = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      gameNumber,
      week,
      seasonId,
      leagueId,
      homeTeamId,
      awayTeamId,
      homeTeamName,
      awayTeamName,
      scheduledDate,
      venue = 'All Pro Sports Complex'
    } = body;

    if (!gameNumber || !week || !seasonId || !leagueId || !homeTeamId || !awayTeamId || !scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const gameData: Omit<Game, 'id'> = {
      gameNumber,
      week,
      seasonId,
      leagueId,
      homeTeamId,
      awayTeamId,
      homeTeamName,
      awayTeamName,
      scheduledDate: Timestamp.fromDate(new Date(scheduledDate)),
      venue,
      status: 'scheduled',
      score: {
        home: 0,
        away: 0
      },
      stats: {
        homeTeamStats: {
          totalYards: 0,
          passingYards: 0,
          rushingYards: 0,
          touchdowns: 0,
          fieldGoals: 0,
          turnovers: 0,
          penalties: 0,
          penaltyYards: 0
        },
        awayTeamStats: {
          totalYards: 0,
          passingYards: 0,
          rushingYards: 0,
          touchdowns: 0,
          fieldGoals: 0,
          turnovers: 0,
          penalties: 0,
          penaltyYards: 0
        }
      },
      recordedBy: 'system',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.GAMES), gameData);
    
    return NextResponse.json({
      id: docRef.id,
      ...gameData
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
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
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    // If updating game status to completed, recalculate standings
    const shouldRecalculateStandings = updateData.status === 'completed';
    let seasonId = updateData.seasonId;

    const gameRef = doc(db, COLLECTIONS.GAMES, id);
    
    // If we don't have seasonId in updateData, get it from the existing game
    if (shouldRecalculateStandings && !seasonId) {
      const gameDoc = await getDocs(query(
        collection(db, COLLECTIONS.GAMES),
        where('__name__', '==', id)
      ));
      if (!gameDoc.empty) {
        seasonId = gameDoc.docs[0].data().seasonId;
      }
    }

    await updateDoc(gameRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
      ...(updateData.status === 'completed' && { actualDate: Timestamp.now() })
    });

    // Recalculate standings if game was completed
    if (shouldRecalculateStandings && seasonId) {
      try {
        await StandingsService.calculateStandings(seasonId);
      } catch (standingsError) {
        console.error('Error recalculating standings:', standingsError);
        // Don't fail the game update if standings calculation fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
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
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, COLLECTIONS.GAMES, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
}
