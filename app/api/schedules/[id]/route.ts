import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/schedules/[id] - Get specific schedule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { doc, getDoc } = await import('firebase/firestore');
    
    const scheduleDoc = await getDoc(doc(db, 'schedules', params.id));
    
    if (!scheduleDoc.exists()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Schedule not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      schedule: { id: scheduleDoc.id, ...scheduleDoc.data() }
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch schedule' 
    }, { status: 500 });
  }
}

// PUT /api/schedules/[id] - Update schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    
    // Prepare update data
    const updateData = {
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      leagueId: data.leagueId,
      gameDate: data.gameDate ? Timestamp.fromDate(new Date(data.gameDate)) : undefined,
      gameTime: data.gameTime,
      duration: data.duration || 60,
      venue: data.venue,
      field: data.field || '',
      address: data.address || '',
      status: data.status,
      homeScore: data.homeScore !== undefined ? data.homeScore : null,
      awayScore: data.awayScore !== undefined ? data.awayScore : null,
      week: data.week || null,
      round: data.round || null,
      gameType: data.gameType || 'regular',
      referees: data.referees || [],
      weather: data.weather || '',
      temperature: data.temperature || null,
      fieldConditions: data.fieldConditions || 'Good',
      notes: data.notes || '',
      lastUpdated: Timestamp.now(),
      updatedBy: data.updatedBy || 'admin',
      updatedAt: Timestamp.now()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(doc(db, 'schedules', params.id), updateData);

    return NextResponse.json({
      success: true,
      message: 'Schedule updated successfully'
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update schedule' 
    }, { status: 500 });
  }
}

// DELETE /api/schedules/[id] - Delete schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    
    await deleteDoc(doc(db, 'schedules', params.id));

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete schedule' 
    }, { status: 500 });
  }
}
