import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe-service';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/firestore-schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, amount, reason, paymentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Process refund through Stripe
    const refund = await stripeService.refundPayment(paymentIntentId, amount, reason);

    // Update payment record in Firestore
    if (paymentId) {
      const updateData: any = {
        status: amount ? 'partially_refunded' : 'refunded',
        refundAmount: refund.amount / 100,
        refundReason: reason,
        refundedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await updateDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId), updateData);
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        reason: refund.reason
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
