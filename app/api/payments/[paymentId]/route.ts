import { NextRequest, NextResponse } from 'next/server';
import { COLLECTIONS } from '@/lib/firestore-schema';

export async function GET(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, getDoc } = await import('firebase/firestore');
    const paymentRef = doc(db, COLLECTIONS.PAYMENTS, params.paymentId);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentSnap.id,
        ...paymentSnap.data()
      }
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch payment'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const body = await request.json();

    const paymentRef = doc(db, COLLECTIONS.PAYMENTS, params.paymentId);
    
    await updateDoc(paymentRef, {
      ...body,
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully'
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update payment'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    const paymentRef = doc(db, COLLECTIONS.PAYMENTS, params.paymentId);
    
    await deleteDoc(paymentRef);

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete payment'
    }, { status: 500 });
  }
}
