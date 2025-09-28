import { NextRequest, NextResponse } from 'next/server';

// GET /api/gohighlevel/sync-logs - Get sync logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const integrationId = searchParams.get('integrationId');
    
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        logs: [],
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { collection, getDocs, query, orderBy, where, limit: firestoreLimit } = await import('firebase/firestore');
    
    let logsQuery = query(
      collection(db, 'gohighlevel_sync_logs'),
      orderBy('startedAt', 'desc'),
      firestoreLimit(limit)
    );

    if (integrationId) {
      logsQuery = query(
        collection(db, 'gohighlevel_sync_logs'),
        where('integrationId', '==', integrationId),
        orderBy('startedAt', 'desc'),
        firestoreLimit(limit)
      );
    }

    const snapshot = await getDocs(logsQuery);
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error fetching GoHighLevel sync logs:', error);
    return NextResponse.json({ 
      success: false, 
      logs: [],
      error: 'Failed to fetch sync logs' 
    }, { status: 500 });
  }
}
