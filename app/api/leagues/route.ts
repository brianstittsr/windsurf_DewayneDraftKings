import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/leagues - Get all leagues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const isActive = searchParams.get('isActive');
    
    // Dynamic import to avoid build issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        leagues: [],
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    
    let leaguesQuery = query(
      collection(db, 'leagues'),
      orderBy('name', 'asc')
    );

    // Apply filters if provided
    if (sport) {
      leaguesQuery = query(leaguesQuery, where('sport', '==', sport));
    }
    if (isActive !== null) {
      leaguesQuery = query(leaguesQuery, where('isActive', '==', isActive === 'true'));
    }

    const snapshot = await getDocs(leaguesQuery);
    const leagues = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      leagues
    });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json({ 
      success: false, 
      leagues: [],
      error: 'Failed to fetch leagues' 
    }, { status: 500 });
  }
}

// POST /api/leagues - Create new league
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Dynamic import to avoid build issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    // Prepare league data
    const leagueData = {
      name: data.name,
      shortName: data.shortName || '',
      description: data.description || '',
      sport: data.sport || 'flag_football',
      
      // League Configuration
      maxTeams: data.maxTeams || 12,
      minTeams: data.minTeams || 4,
      maxPlayersPerTeam: data.maxPlayersPerTeam || 15,
      gameLength: data.gameLength || 60,
      type: data.type || 'recreational',
      format: data.format || 'round-robin',
      
      // Season Information
      currentSeasonId: null,
      seasonStartDate: data.seasonStartDate ? Timestamp.fromDate(new Date(data.seasonStartDate)) : null,
      seasonEndDate: data.seasonEndDate ? Timestamp.fromDate(new Date(data.seasonEndDate)) : null,
      registrationDeadline: data.registrationDeadline ? Timestamp.fromDate(new Date(data.registrationDeadline)) : null,
      
      // Pricing and Registration
      registrationFee: data.registrationFee || 0,
      teamFee: data.teamFee || 0,
      playerFee: data.playerFee || 0,
      
      // League Rules
      rules: {
        overtimeRules: data.overtimeRules || '',
        scoringSystem: data.scoringSystem || 'Standard',
        playerEligibility: data.playerEligibility || 'Open'
      },
      
      // Age Restrictions
      ageRestrictions: {
        minAge: data.minAge || null,
        maxAge: data.maxAge || null
      },
      
      // Status
      isActive: data.isActive !== undefined ? data.isActive : true,
      isAcceptingRegistrations: data.isAcceptingRegistrations !== undefined ? data.isAcceptingRegistrations : true,
      
      // Contact and Location
      organizerId: data.organizerId || '',
      location: data.location || '',
      website: data.website || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      
      // League Statistics
      stats: {
        totalSeasons: 0,
        totalGamesPlayed: 0,
        totalTeams: 0,
        allTimeWins: {},
        allTimeLosses: {}
      },
      
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'leagues'), leagueData);

    return NextResponse.json({
      success: true,
      message: 'League created successfully',
      leagueId: docRef.id,
      league: { id: docRef.id, ...leagueData }
    });
  } catch (error) {
    console.error('Error creating league:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create league' 
    }, { status: 500 });
  }
}
