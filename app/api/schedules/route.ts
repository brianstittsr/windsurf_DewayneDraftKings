import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/schedules - Get all schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const teamId = searchParams.get('teamId');
    const status = searchParams.get('status');
    const week = searchParams.get('week');
    
    // Dynamic import to avoid build issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        schedules: [],
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    
    let schedulesQuery = query(
      collection(db, 'schedules'),
      orderBy('gameDate', 'asc')
    );

    // Apply filters if provided
    if (leagueId) {
      schedulesQuery = query(schedulesQuery, where('leagueId', '==', leagueId));
    }
    if (teamId) {
      // Get games where team is either home or away
      // Note: Firestore doesn't support OR queries directly, so we'll filter in memory
    }
    if (status) {
      schedulesQuery = query(schedulesQuery, where('status', '==', status));
    }
    if (week) {
      schedulesQuery = query(schedulesQuery, where('week', '==', parseInt(week)));
    }

    const snapshot = await getDocs(schedulesQuery);
    let schedules = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by team if specified (since Firestore doesn't support OR queries)
    if (teamId) {
      schedules = schedules.filter((schedule: any) => 
        schedule.homeTeamId === teamId || schedule.awayTeamId === teamId
      );
    }

    return NextResponse.json({
      success: true,
      schedules
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ 
      success: false, 
      schedules: [],
      error: 'Failed to fetch schedules' 
    }, { status: 500 });
  }
}

// POST /api/schedules - Create new schedule
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
    
    // Validate required fields
    if (!data.homeTeamId || !data.awayTeamId || !data.leagueId || !data.gameDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: homeTeamId, awayTeamId, leagueId, gameDate' 
      }, { status: 400 });
    }

    // Prepare schedule data
    const scheduleData = {
      // Game Information
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      leagueId: data.leagueId,
      
      // Game Details
      gameDate: Timestamp.fromDate(new Date(data.gameDate)),
      gameTime: data.gameTime || '18:00',
      duration: data.duration || 60,
      
      // Location
      venue: data.venue || 'All Pro Sports Complex',
      field: data.field || '',
      address: data.address || '',
      
      // Game Status
      status: 'scheduled',
      
      // Scores (initially null)
      homeScore: null,
      awayScore: null,
      
      // Game Details
      week: data.week || null,
      round: data.round || null,
      gameType: data.gameType || 'regular',
      
      // Officials
      referees: data.referees || [],
      
      // Weather and Conditions
      weather: data.weather || '',
      temperature: data.temperature || null,
      fieldConditions: data.fieldConditions || 'Good',
      
      // Notifications
      notificationsSent: false,
      remindersSent: false,
      
      // Notes and Updates
      notes: data.notes || '',
      lastUpdated: Timestamp.now(),
      updatedBy: data.updatedBy || 'admin',
      
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'schedules'), scheduleData);

    return NextResponse.json({
      success: true,
      message: 'Game scheduled successfully',
      scheduleId: docRef.id,
      schedule: { id: docRef.id, ...scheduleData }
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create schedule' 
    }, { status: 500 });
  }
}
