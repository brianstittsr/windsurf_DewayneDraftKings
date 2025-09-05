import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, limit } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/firestore-schema';
import { stripeService } from '@/lib/stripe-service';

// GET - Fetch payments with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentType = searchParams.get('type');
    const customerId = searchParams.get('customerId');
    const limitParam = searchParams.get('limit');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let paymentsQuery = query(
      collection(db, COLLECTIONS.PAYMENTS),
      orderBy('createdAt', 'desc')
    );

    // Apply filters
    if (status) {
      paymentsQuery = query(
        collection(db, COLLECTIONS.PAYMENTS),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    }

    if (paymentType) {
      paymentsQuery = query(
        collection(db, COLLECTIONS.PAYMENTS),
        where('paymentType', '==', paymentType),
        orderBy('createdAt', 'desc')
      );
    }

    if (customerId) {
      paymentsQuery = query(
        collection(db, COLLECTIONS.PAYMENTS),
        where('stripeCustomerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
    }

    // Apply limit
    if (limitParam) {
      paymentsQuery = query(paymentsQuery, limit(parseInt(limitParam)));
    }

    const querySnapshot = await getDocs(paymentsQuery);
    const payments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate summary statistics
    const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const successfulPayments = payments.filter(p => p.status === 'succeeded');
    const failedPayments = payments.filter(p => p.status === 'failed');

    return NextResponse.json({
      success: true,
      payments,
      summary: {
        total: payments.length,
        totalAmount,
        successful: successfulPayments.length,
        failed: failedPayments.length,
        successRate: payments.length > 0 ? (successfulPayments.length / payments.length * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// PUT - Update payment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, ...updateData } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    await updateDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId), updateData);

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId));

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
