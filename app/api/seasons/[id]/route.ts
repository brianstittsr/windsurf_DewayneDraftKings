import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PUT /api/seasons/[id] - Update season
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Season ID is required' 
      }, { status: 400 });
    }
    
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    
    const updateData = {
      name: data.name,
      year: data.year,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      description: data.description || '',
      registrationOpen: data.registrationOpen,
      registrationDeadline: data.registrationDeadline || null,
      notes: data.notes || '',
      teamCount: data.teamCount || 0,
      gameCount: data.gameCount || 0,
      updatedAt: Timestamp.now()
    };
    
    const seasonRef = doc(db, 'seasons', id);
    await updateDoc(seasonRef, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Season updated successfully'
    });
  } catch (error) {
    console.error('Error updating season:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update season' 
    }, { status: 500 });
  }
}
