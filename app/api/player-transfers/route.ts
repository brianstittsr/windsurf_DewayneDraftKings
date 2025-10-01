import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/player-transfers - Get all transfer requests
export async function GET() {
  try {
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        transfers: [] 
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const transfersRef = collection(db, 'player_transfers');
    const q = query(transfersRef, orderBy('requestedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const transfers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      transfers
    });
  } catch (error) {
    console.error('Error fetching player transfers:', error);
    return NextResponse.json({ 
      success: false, 
      transfers: [],
      error: 'Failed to fetch player transfers' 
    }, { status: 500 });
  }
}

// POST /api/player-transfers - Create new transfer request
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
    
    const transferData = {
      playerId: data.playerId,
      playerName: data.playerName,
      fromTeamId: data.fromTeamId,
      fromTeamName: data.fromTeamName,
      toTeamId: data.toTeamId,
      toTeamName: data.toTeamName,
      requestedBy: data.requestedBy,
      requestedAt: new Date().toISOString(),
      status: data.status || 'pending',
      notes: data.notes || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const transfersRef = collection(db, 'player_transfers');
    const docRef = await addDoc(transfersRef, transferData);
    
    return NextResponse.json({
      success: true,
      message: 'Transfer request created successfully',
      transferId: docRef.id
    });
  } catch (error) {
    console.error('Error creating transfer request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create transfer request' 
    }, { status: 500 });
  }
}

// DELETE /api/player-transfers - Delete transfer request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Transfer ID is required' 
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
    
    const transferRef = doc(db, 'player_transfers', id);
    await deleteDoc(transferRef);
    
    return NextResponse.json({
      success: true,
      message: 'Transfer request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transfer request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete transfer request' 
    }, { status: 500 });
  }
}
