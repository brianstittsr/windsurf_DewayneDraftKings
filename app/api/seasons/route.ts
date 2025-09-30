import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/seasons - Get all seasons
export async function GET() {
  try {
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        seasons: [] 
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const seasonsRef = collection(db, 'seasons');
    const q = query(seasonsRef, orderBy('year', 'desc'), orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    
    const seasons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      seasons
    });
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return NextResponse.json({ 
      success: false, 
      seasons: [],
      error: 'Failed to fetch seasons' 
    }, { status: 500 });
  }
}

// POST /api/seasons - Create new season
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    const seasonData = {
      name: data.name,
      year: data.year,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || 'upcoming',
      description: data.description || '',
      registrationOpen: data.registrationOpen !== undefined ? data.registrationOpen : true,
      registrationDeadline: data.registrationDeadline || null,
      notes: data.notes || '',
      teamCount: data.teamCount || 0,
      gameCount: data.gameCount || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const seasonsRef = collection(db, 'seasons');
    const docRef = await addDoc(seasonsRef, seasonData);
    
    return NextResponse.json({
      success: true,
      message: 'Season created successfully',
      seasonId: docRef.id
    });
  } catch (error) {
    console.error('Error creating season:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create season' 
    }, { status: 500 });
  }
}

// DELETE /api/seasons - Delete season
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Season ID is required' 
      }, { status: 400 });
    }
    
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    
    const seasonRef = doc(db, 'seasons', id);
    await deleteDoc(seasonRef);
    
    return NextResponse.json({
      success: true,
      message: 'Season deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting season:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete season' 
    }, { status: 500 });
  }
}
