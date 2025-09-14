import { NextRequest, NextResponse } from 'next/server';
import { COLLECTIONS } from '@/lib/firestore-schema';

export async function POST(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
    }

    const Stripe = await import('stripe').then(mod => mod.default);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } = await import('firebase/firestore');
    const body = await request.json();
    const { amount, reason } = body;

    // Get payment record
    const paymentRef = doc(db, COLLECTIONS.PAYMENTS, params.paymentId);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const paymentData = paymentSnap.data();
    
    if (!paymentData.stripeSessionId && !paymentData.stripeChargeId) {
      return NextResponse.json({ error: 'No Stripe charge ID found for this payment' }, { status: 400 });
    }

    // Get the charge ID - either from payment data or retrieve from session
    let chargeId = paymentData.stripeChargeId;
    
    if (!chargeId && paymentData.stripeSessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(paymentData.stripeSessionId);
        if (session.payment_intent && typeof session.payment_intent === 'string') {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, {
            expand: ['charges']
          }) as any;
          if (paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
            chargeId = paymentIntent.charges.data[0].id;
          }
        }
      } catch (error) {
        console.error('Error retrieving charge ID:', error);
        return NextResponse.json({ error: 'Could not retrieve charge information' }, { status: 400 });
      }
    }

    if (!chargeId) {
      return NextResponse.json({ error: 'No charge ID available for refund' }, { status: 400 });
    }

    // Create refund in Stripe
    const refundParams: any = {
      charge: chargeId,
      reason: reason || 'requested_by_customer'
    };

    if (amount && amount > 0) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundParams);

    // Update payment record with refund info
    await updateDoc(paymentRef, {
      refundStatus: refund.status,
      refundAmount: refund.amount / 100,
      refundReason: refund.reason,
      stripeRefundId: refund.id,
      stripeChargeId: chargeId,
      updatedAt: serverTimestamp()
    });

    // Create refund record
    const refundRecord = {
      stripeRefundId: refund.id,
      stripeChargeId: chargeId,
      paymentId: params.paymentId,
      amount: refund.amount / 100,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason,
      receiptNumber: refund.receipt_number,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const refundDoc = await addDoc(collection(db, 'refunds'), refundRecord);

    return NextResponse.json({
      success: true,
      refund: {
        id: refundDoc.id,
        stripeRefundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        reason: refund.reason
      }
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    
    if (error instanceof Error) {
      // Handle specific Stripe errors
      if (error.message.includes('charge_already_refunded')) {
        return NextResponse.json({ error: 'This payment has already been refunded' }, { status: 400 });
      }
      if (error.message.includes('amount_too_large')) {
        return NextResponse.json({ error: 'Refund amount exceeds the original payment amount' }, { status: 400 });
      }
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process refund'
    }, { status: 500 });
  }
}
