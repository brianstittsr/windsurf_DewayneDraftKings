import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/firestore-schema';

// GET - Fetch all players
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    let playersQuery = query(
      collection(db, COLLECTIONS.PLAYERS),
      orderBy('createdAt', 'desc')
    );

    // Filter by status if provided
    if (status) {
      playersQuery = query(
        collection(db, COLLECTIONS.PLAYERS),
        where('registrationStatus', '==', status),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(playersQuery);
    const players = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply limit if specified
    const limitedPlayers = limit ? players.slice(0, parseInt(limit)) : players;

    return NextResponse.json({
      success: true,
      players: limitedPlayers,
      total: players.length
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

// PUT - Update player
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, ...updateData } = body;

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID is required' },
        { status: 400 }
      );
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    await updateDoc(doc(db, COLLECTIONS.PLAYERS, playerId), updateData);

    return NextResponse.json({
      success: true,
      message: 'Player updated successfully'
    });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update player' },
      { status: 500 }
    );
  }
}

// DELETE - Delete player
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('id');

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, COLLECTIONS.PLAYERS, playerId));

    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete player' },
      { status: 500 }
    );
  }
}
