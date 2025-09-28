import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/teams/[id] - Get specific team
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
    
    const teamDoc = await getDoc(doc(db, 'teams', params.id));
    
    if (!teamDoc.exists()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      team: { id: teamDoc.id, ...teamDoc.data() }
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch team' 
    }, { status: 500 });
  }
}

// PUT /api/teams/[id] - Update team
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
      division: data.division,
      coachId: data.coachId || '',
      coachName: data.coachName || '',
      description: data.description || '',
      maxRosterSize: data.maxRosterSize || 15,
      ageGroup: data.ageGroup || 'adult',
      skillLevel: data.skillLevel || 'intermediate',
      homeField: data.homeField || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      primaryColor: data.primaryColor || '#007bff',
      secondaryColor: data.secondaryColor || '#6c757d',
      updatedAt: Timestamp.now()
    };

    await updateDoc(doc(db, 'teams', params.id), updateData);

    return NextResponse.json({
      success: true,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update team' 
    }, { status: 500 });
  }
}

// DELETE /api/teams/[id] - Delete team
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
    
    await deleteDoc(doc(db, 'teams', params.id));

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete team' 
    }, { status: 500 });
  }
}
