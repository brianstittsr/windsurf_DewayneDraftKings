import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/firestore-schema';

export async function POST(request: NextRequest) {
  try {
    const { playerId, qrCode, qrCodeUrl } = await request.json();

    if (!playerId || !qrCode || !qrCodeUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: playerId, qrCode, qrCodeUrl' },
        { status: 400 }
      );
    }

    // Update player document with QR code information
    const playerRef = doc(db, COLLECTIONS.PLAYERS, playerId);
    await updateDoc(playerRef, {
      qrCode,
      qrCodeUrl,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Player QR code updated successfully',
      playerId,
      qrCodeUrl
    });

  } catch (error) {
    console.error('Error updating player QR code:', error);
    return NextResponse.json(
      { error: 'Failed to update player QR code' },
      { status: 500 }
    );
  }
}
