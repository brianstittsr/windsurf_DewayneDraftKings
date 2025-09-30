import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PUT /api/season-config/[id] - Update season configuration
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
        error: 'Configuration ID is required' 
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
      seasonName: data.seasonName,
      seasonYear: data.seasonYear,
      startDate: data.startDate,
      endDate: data.endDate,
      registrationDeadline: data.registrationDeadline,
      registrationFee: data.registrationFee,
      setupFee: data.setupFee,
      jerseyFee: data.jerseyFee,
      menLeagueActive: data.menLeagueActive,
      womenLeagueActive: data.womenLeagueActive,
      registrationOpen: data.registrationOpen,
      displayOnHomepage: data.displayOnHomepage,
      announcementText: data.announcementText || '',
      trialGameAllowed: data.trialGameAllowed,
      notes: data.notes || '',
      isActive: data.isActive,
      updatedAt: Timestamp.now()
    };
    
    const configRef = doc(db, 'season_config', id);
    await updateDoc(configRef, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Season configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating season config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update season configuration' 
    }, { status: 500 });
  }
}

// GET /api/season-config/active - Get active configuration for homepage
export async function GET() {
  try {
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false,
        config: null
      });
    }

    const { collection, getDocs, query, where, limit } = await import('firebase/firestore');
    
    const configsRef = collection(db, 'season_config');
    const q = query(
      configsRef, 
      where('displayOnHomepage', '==', true),
      where('isActive', '==', true),
      limit(1)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return NextResponse.json({
        success: false,
        config: null,
        message: 'No active season configuration found'
      });
    }

    const doc = snapshot.docs[0];
    const config = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
    };

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error fetching active season config:', error);
    return NextResponse.json({ 
      success: false, 
      config: null,
      error: 'Failed to fetch active season configuration' 
    }, { status: 500 });
  }
}
