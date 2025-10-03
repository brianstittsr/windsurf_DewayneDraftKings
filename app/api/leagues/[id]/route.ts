import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/leagues/[id] - Get specific league
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
    
    const leagueDoc = await getDoc(doc(db, 'leagues', params.id));
    
    if (!leagueDoc.exists()) {
      return NextResponse.json({ 
        success: false, 
        error: 'League not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      league: { id: leagueDoc.id, ...leagueDoc.data() }
    });
  } catch (error) {
    console.error('Error fetching league:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch league' 
    }, { status: 500 });
  }
}

// PUT /api/leagues/[id] - Update league
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
      name: data.name,
      shortName: data.shortName || '',
      description: data.description || '',
      sport: data.sport,
      maxTeams: data.maxTeams || 12,
      minTeams: data.minTeams || 4,
      maxPlayersPerTeam: data.maxPlayersPerTeam || 15,
      gameLength: data.gameLength || 60,
      type: data.type || 'recreational',
      format: data.format || 'round-robin',
      seasonStartDate: data.seasonStartDate && data.seasonStartDate !== '' ? Timestamp.fromDate(new Date(data.seasonStartDate)) : null,
      seasonEndDate: data.seasonEndDate && data.seasonEndDate !== '' ? Timestamp.fromDate(new Date(data.seasonEndDate)) : null,
      registrationDeadline: data.registrationDeadline && data.registrationDeadline !== '' ? Timestamp.fromDate(new Date(data.registrationDeadline)) : null,
      registrationFee: data.registrationFee || 0,
      teamFee: data.teamFee || 0,
      playerFee: data.playerFee || 0,
      ageRestrictions: {
        minAge: data.minAge || null,
        maxAge: data.maxAge || null
      },
      isActive: data.isActive !== undefined ? data.isActive : true,
      isAcceptingRegistrations: data.isAcceptingRegistrations !== undefined ? data.isAcceptingRegistrations : true,
      organizerId: data.organizerId || '',
      location: data.location || '',
      website: data.website || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      updatedAt: Timestamp.now()
    };

    await updateDoc(doc(db, 'leagues', params.id), updateData);

    return NextResponse.json({
      success: true,
      message: 'League updated successfully'
    });
  } catch (error) {
    console.error('Error updating league:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update league' 
    }, { status: 500 });
  }
}

// DELETE /api/leagues/[id] - Delete league
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
    
    await deleteDoc(doc(db, 'leagues', params.id));

    return NextResponse.json({
      success: true,
      message: 'League deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting league:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete league' 
    }, { status: 500 });
  }
}
