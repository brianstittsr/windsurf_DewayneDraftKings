import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PUT /api/commissioners/[id] - Update commissioner
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
        error: 'Commissioner ID is required'
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
    
    const commissRef = doc(db, 'commissioners', id);
    
    const updateData: any = {
      updatedAt: Timestamp.now()
    };

    // Update only provided fields
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.ratePerPlayer !== undefined) updateData.ratePerPlayer = data.ratePerPlayer;
    if (data.stripeAccountId !== undefined) updateData.stripeAccountId = data.stripeAccountId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.totalEarned !== undefined) updateData.totalEarned = data.totalEarned;
    if (data.totalPlayers !== undefined) updateData.totalPlayers = data.totalPlayers;
    
    await updateDoc(commissRef, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Commissioner updated successfully'
    });
  } catch (error) {
    console.error('Error updating commissioner:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update commissioner' 
    }, { status: 500 });
  }
}
