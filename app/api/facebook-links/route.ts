import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/facebook-links - Get all Facebook links
export async function GET() {
  try {
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        links: [] 
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const linksRef = collection(db, 'facebook_links');
    const q = query(linksRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const links = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      links
    });
  } catch (error) {
    console.error('Error fetching Facebook links:', error);
    return NextResponse.json({ 
      success: false, 
      links: [],
      error: 'Failed to fetch Facebook links' 
    }, { status: 500 });
  }
}

// POST /api/facebook-links - Create new Facebook link
export async function POST(request: NextRequest) {
  let data;
  
  try {
    console.log('=== Facebook Links POST endpoint called ===');
    
    try {
      data = await request.json();
      console.log('✓ JSON parsed successfully');
      console.log('Received data:', { 
        entityType: data?.entityType,
        entityId: data?.entityId,
        entityName: data?.entityName,
        hasFacebookUrl: !!data?.facebookUrl,
        isActive: data?.isActive
      });
    } catch (jsonError) {
      console.error('✗ JSON parse error:', jsonError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }
    
    // Validate required fields
    if (!data || !data.entityType || !data.entityId || !data.entityName || !data.facebookUrl) {
      console.error('✗ Missing required fields:', {
        hasData: !!data,
        hasEntityType: !!data?.entityType,
        hasEntityId: !!data?.entityId,
        hasEntityName: !!data?.entityName,
        hasFacebookUrl: !!data?.facebookUrl
      });
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: entityType, entityId, entityName, facebookUrl' 
      }, { status: 400 });
    }
    console.log('✓ Required fields validated');
    
    console.log('Attempting Firebase import...');
    const { db } = await import('../../../lib/firebase').catch((err) => {
      console.error('✗ Firebase import error:', err);
      return { db: null };
    });
    
    if (!db) {
      console.error('✗ Database unavailable');
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable - Firebase not configured',
        hint: 'Check Firebase environment variables'
      }, { status: 503 });
    }
    console.log('✓ Firebase database available');

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    console.log('✓ Firestore functions imported');
    
    const linkData = {
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      facebookUrl: data.facebookUrl,
      isActive: data.isActive !== undefined ? data.isActive : true,
      notes: data.notes || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    console.log('✓ Link data prepared');
    
    try {
      console.log('Creating document in facebook_links collection...');
      const linksRef = collection(db, 'facebook_links');
      const docRef = await addDoc(linksRef, linkData);
      console.log('✓ Facebook link created with ID:', docRef.id);
      console.log('=== SUCCESS ===');
      
      return NextResponse.json({
        success: true,
        message: 'Facebook link created successfully',
        linkId: docRef.id
      });
    } catch (firestoreError: any) {
      console.error('✗ Firestore error:', firestoreError);
      console.error('Error code:', firestoreError?.code);
      console.error('Error message:', firestoreError?.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save to database',
        code: firestoreError?.code || 'unknown',
        details: firestoreError?.message || 'Unknown Firestore error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('✗ Unexpected error:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create Facebook link',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/facebook-links - Delete Facebook link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Link ID is required' 
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
    
    const linkRef = doc(db, 'facebook_links', id);
    await deleteDoc(linkRef);
    
    return NextResponse.json({
      success: true,
      message: 'Facebook link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Facebook link:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete Facebook link' 
    }, { status: 500 });
  }
}
