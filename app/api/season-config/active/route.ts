import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

    const { collection, getDocs, query, where, limit, orderBy } = await import('firebase/firestore');
    
    const configsRef = collection(db, 'season_config');
    const q = query(
      configsRef, 
      where('displayOnHomepage', '==', true),
      where('isActive', '==', true),
      orderBy('seasonYear', 'desc'),
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
