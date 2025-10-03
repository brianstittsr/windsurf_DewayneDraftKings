import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PATCH /api/notifications/[id] - Update notification status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { doc, updateDoc } = await import('firebase/firestore');
    
    const notificationRef = doc(db, 'notifications', id);
    await updateDoc(notificationRef, {
      status: data.status,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update notification',
      details: error.message
    }, { status: 500 });
  }
}
