import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Dynamic imports to prevent build-time execution
    const services = await import('@/lib/firebase').catch(() => null);
    if (!services?.db) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const { doc, updateDoc } = await import('firebase/firestore');
    const { COLLECTIONS } = await import('@/lib/firestore-schema');

    const body = await request.json();
    const { coachId, qrCode, qrCodeUrl } = body;

    if (!coachId || !qrCode || !qrCodeUrl) {
      return NextResponse.json(
        { success: false, error: 'Coach ID, QR code, and QR code URL are required' },
        { status: 400 }
      );
    }

    await updateDoc(doc(services.db, COLLECTIONS.COACHES, coachId), {
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
