import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/tournaments - Get all tournaments
export async function GET() {
  try {
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        tournaments: [] 
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const tournamentsRef = collection(db, 'tournaments');
    const q = query(tournamentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const tournaments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate?.()?.toISOString() || null,
      endDate: doc.data().endDate?.toDate?.()?.toISOString() || null,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      tournaments
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json({ 
      success: true, 
      tournaments: []
    });
  }
}

// POST /api/tournaments - Create new tournament
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, description, leagueId, seasonId, type, startDate, endDate, teams, selectedTeams } = data;

    if (!name || !teams || teams.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Tournament name and at least 2 teams are required'
      }, { status: 400 });
    }

    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');

    // Assign seeds to teams
    const teamsWithSeeds = teams.map((team: any, index: number) => ({
      ...team,
      seed: index + 1
    }));

    // Generate bracket matches
    const numTeams = teamsWithSeeds.length;
    const numRounds = Math.ceil(Math.log2(numTeams));
    const totalSlots = Math.pow(2, numRounds);
    
    // Add byes if needed
    const teamsWithByes = [...teamsWithSeeds];
    while (teamsWithByes.length < totalSlots) {
      teamsWithByes.push({ id: `bye-${teamsWithByes.length}`, name: 'BYE', seed: 999 });
    }

    const matches: any[] = [];
    let matchId = 1;

    // Generate first round
    for (let i = 0; i < totalSlots / 2; i++) {
      const team1 = teamsWithByes[i * 2];
      const team2 = teamsWithByes[i * 2 + 1];
      
      matches.push({
        id: `match-${matchId}`,
        round: 1,
        matchNumber: i + 1,
        team1: team1.name !== 'BYE' ? team1 : null,
        team2: team2.name !== 'BYE' ? team2 : null,
        winner: team1.name === 'BYE' ? team2 : team2.name === 'BYE' ? team1 : null,
        score1: null,
        score2: null,
        completed: team1.name === 'BYE' || team2.name === 'BYE',
        scheduled: null
      });
      matchId++;
    }

    // Generate subsequent rounds
    for (let round = 2; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          id: `match-${matchId}`,
          round,
          matchNumber: i + 1,
          team1: null,
          team2: null,
          winner: null,
          score1: null,
          score2: null,
          completed: false,
          scheduled: null
        });
        matchId++;
      }
    }

    // Create tournament
    const tournamentsRef = collection(db, 'tournaments');
    const tournamentData = {
      name,
      description: description || '',
      leagueId: leagueId || null,
      seasonId: seasonId || null,
      type: type || 'single-elimination',
      status: 'draft',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      teams: teamsWithSeeds.filter((t: any) => t.name !== 'BYE'),
      matches,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(tournamentsRef, tournamentData);

    console.log(`✓ Tournament created with ID: ${docRef.id}`);

    return NextResponse.json({
      success: true,
      message: 'Tournament created successfully',
      tournamentId: docRef.id,
      matches: matches.length
    });

  } catch (error: any) {
    console.error('✗ Error creating tournament:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create tournament',
      details: error.message
    }, { status: 500 });
  }
}
