import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/teams - Get all teams
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');
    const leagueId = searchParams.get('leagueId');
    const division = searchParams.get('division');
    
    // Dynamic import to avoid build issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        teams: [],
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    
    let teamsQuery = query(
      collection(db, 'teams'),
      orderBy('name', 'asc')
    );

    // Apply filters if provided
    if (seasonId) {
      teamsQuery = query(teamsQuery, where('seasonId', '==', seasonId));
    }
    if (leagueId) {
      teamsQuery = query(teamsQuery, where('leagueId', '==', leagueId));
    }
    if (division) {
      teamsQuery = query(teamsQuery, where('division', '==', division));
    }

    const snapshot = await getDocs(teamsQuery);
    const teams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ 
      success: false, 
      teams: [],
      error: 'Failed to fetch teams' 
    }, { status: 500 });
  }
}

// POST /api/teams - Create new team
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
    
    // Prepare team data
    const teamData = {
      name: data.name,
      shortName: data.shortName || '',
      division: data.division || 'mixed',
      coachId: data.coachId || '',
      coachName: data.coachName || '',
      description: data.description || '',
      
      // Roster Management
      players: [],
      coaches: data.coachId ? [data.coachId] : [],
      captainId: null,
      maxRosterSize: data.maxRosterSize || 15,
      currentRosterSize: 0,
      rosterLocked: false,
      
      // Team Performance
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
      
      // Season Information
      seasonId: data.seasonId || '2024-fall',
      leagueId: data.leagueId || 'default-league',
      
      // Team Settings
      ageGroup: data.ageGroup || 'adult',
      skillLevel: data.skillLevel || 'intermediate',
      
      // Location and Contact
      homeField: data.homeField || '',
      establishedDate: data.establishedDate ? Timestamp.fromDate(new Date(data.establishedDate)) : Timestamp.now(),
      
      // Status
      isActive: data.isActive !== undefined ? data.isActive : true,
      
      // Team Colors and Branding
      primaryColor: data.primaryColor || '#007bff',
      secondaryColor: data.secondaryColor || '#6c757d',
      logoUrl: data.logoUrl || '',
      
      // Draft Information
      draftOrder: 0,
      draftPicks: [],
      availableTrades: 3,
      
      // Social Media Integration
      facebookPageUrl: data.facebookPageUrl || '',
      socialMediaStats: {
        followers: 0,
        engagement: 0
      },
      
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'teams'), teamData);

    return NextResponse.json({
      success: true,
      message: 'Team created successfully',
      teamId: docRef.id,
      team: { id: docRef.id, ...teamData }
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create team' 
    }, { status: 500 });
  }
}
