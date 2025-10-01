import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PUT /api/player-transfers/[id] - Update transfer request
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
        error: 'Transfer ID is required' 
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
      status: data.status,
      approvedBy: data.approvedBy || null,
      approvedAt: data.approvedAt || null,
      notes: data.notes || '',
      updatedAt: Timestamp.now()
    };
    
    const transferRef = doc(db, 'player_transfers', id);
    await updateDoc(transferRef, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Transfer request updated successfully'
    });
  } catch (error) {
    console.error('Error updating transfer request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update transfer request' 
    }, { status: 500 });
  }
}
