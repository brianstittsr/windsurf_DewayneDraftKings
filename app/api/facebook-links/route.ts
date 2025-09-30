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
    
    const linksRef = collection(db, 'facebook_links');
    const docRef = await addDoc(linksRef, linkData);
    
    return NextResponse.json({
      success: true,
      message: 'Facebook link created successfully',
      linkId: docRef.id
    });
  } catch (error) {
    console.error('Error creating Facebook link:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create Facebook link' 
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
