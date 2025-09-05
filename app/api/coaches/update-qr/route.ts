import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/firestore-schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coachId, qrCode, qrCodeUrl } = body;

    if (!coachId || !qrCode || !qrCodeUrl) {
      return NextResponse.json(
        { success: false, error: 'Coach ID, QR code, and QR code URL are required' },
        { status: 400 }
      );
    }

    await updateDoc(doc(db, COLLECTIONS.COACHES, coachId), {
      qrCode,
      qrCodeUrl,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Coach QR code updated successfully'
    });
  } catch (error) {
    console.error('Error updating coach QR code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coach QR code' },
      { status: 500 }
    );
  }
}
