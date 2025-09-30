import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PUT /api/facebook-links/[id] - Update Facebook link
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
        error: 'Link ID is required' 
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
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      facebookUrl: data.facebookUrl,
      isActive: data.isActive,
      notes: data.notes || '',
      updatedAt: Timestamp.now()
    };
    
    const linkRef = doc(db, 'facebook_links', id);
    await updateDoc(linkRef, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Facebook link updated successfully'
    });
  } catch (error) {
    console.error('Error updating Facebook link:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update Facebook link' 
    }, { status: 500 });
  }
}
