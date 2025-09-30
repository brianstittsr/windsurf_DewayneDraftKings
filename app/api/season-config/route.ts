import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/season-config - Get all season configurations
export async function GET() {
  try {
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        configs: [] 
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const configsRef = collection(db, 'season_config');
    const q = query(configsRef, orderBy('seasonYear', 'desc'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const configs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      configs
    });
  } catch (error) {
    console.error('Error fetching season configs:', error);
    return NextResponse.json({ 
      success: false, 
      configs: [],
      error: 'Failed to fetch season configurations' 
    }, { status: 500 });
  }
}

// POST /api/season-config - Create new season configuration
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
    
    const configData = {
      seasonName: data.seasonName,
      seasonYear: data.seasonYear,
      startDate: data.startDate,
      endDate: data.endDate,
      registrationDeadline: data.registrationDeadline,
      registrationFee: data.registrationFee,
      setupFee: data.setupFee,
      jerseyFee: data.jerseyFee,
      menLeagueActive: data.menLeagueActive !== undefined ? data.menLeagueActive : true,
      womenLeagueActive: data.womenLeagueActive !== undefined ? data.womenLeagueActive : true,
      registrationOpen: data.registrationOpen !== undefined ? data.registrationOpen : true,
      displayOnHomepage: data.displayOnHomepage !== undefined ? data.displayOnHomepage : false,
      announcementText: data.announcementText || '',
      trialGameAllowed: data.trialGameAllowed !== undefined ? data.trialGameAllowed : true,
      notes: data.notes || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const configsRef = collection(db, 'season_config');
    const docRef = await addDoc(configsRef, configData);
    
    return NextResponse.json({
      success: true,
      message: 'Season configuration created successfully',
      configId: docRef.id
    });
  } catch (error) {
    console.error('Error creating season config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create season configuration' 
    }, { status: 500 });
  }
}

// DELETE /api/season-config - Delete season configuration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration ID is required' 
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
    
    const configRef = doc(db, 'season_config', id);
    await deleteDoc(configRef);
    
    return NextResponse.json({
      success: true,
      message: 'Season configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting season config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete season configuration' 
    }, { status: 500 });
  }
}
