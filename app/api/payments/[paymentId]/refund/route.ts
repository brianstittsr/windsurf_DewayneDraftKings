import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;
    const body = await request.json();
    const { amount, reason } = body;

    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required'
      }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({
        success: false,
        error: 'Refund reason is required'
      }, { status: 400 });
    }

    // Dynamic import to avoid build issues
    const stripe = await import('stripe').then(mod => 
      new mod.default(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2023-10-16'
      })
    ).catch(() => null);

    if (!stripe) {
      return NextResponse.json({
        success: false,
        error: 'Payment processing unavailable - Stripe not configured'
      }, { status: 503 });
    }

    // Dynamic Firebase import
    const { db } = await import('../../../../../lib/firebase').catch(() => ({ db: null }));

    try {
      // First, get the payment from Firebase to get the Stripe payment intent ID
      let stripePaymentIntentId = paymentId;
      
      if (db) {
        const { doc, getDoc } = await import('firebase/firestore');
        const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
        
        if (paymentDoc.exists()) {
          const paymentData = paymentDoc.data();
          stripePaymentIntentId = paymentData.stripePaymentIntentId || paymentData.stripeSessionId || paymentId;
        }
      }

      // Create refund in Stripe
      const refundData: any = {
        payment_intent: stripePaymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          refund_reason: reason,
          processed_by: 'admin',
          processed_at: new Date().toISOString()
        }
      };

      // Add amount if specified (partial refund)
      if (amount && amount > 0) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);

      // Update payment record in Firebase if available
      if (db) {
        const { doc, updateDoc, Timestamp, arrayUnion } = await import('firebase/firestore');
        
        try {
          const paymentRef = doc(db, 'payments', paymentId);
          await updateDoc(paymentRef, {
            status: refund.amount === refund.charge ? 'refunded' : 'partially_refunded',
            refunds: arrayUnion({
              stripeRefundId: refund.id,
              amount: refund.amount / 100, // Convert back to dollars
              reason: reason,
              status: refund.status,
              processedAt: Timestamp.now(),
              processedBy: 'admin'
            }),
            updatedAt: Timestamp.now()
          });
        } catch (firebaseError) {
          console.error('Firebase update error (non-critical):', firebaseError);
          // Continue even if Firebase update fails
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Refund processed successfully',
        refund: {
          stripeRefundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          reason: reason
        }
      });

    } catch (stripeError: any) {
      console.error('Stripe refund error:', stripeError);
      
      // Handle common Stripe errors
      let errorMessage = 'Failed to process refund';
      if (stripeError.code === 'charge_already_refunded') {
        errorMessage = 'This payment has already been fully refunded';
      } else if (stripeError.code === 'amount_too_large') {
        errorMessage = 'Refund amount exceeds the original payment amount';
      } else if (stripeError.message) {
        errorMessage = stripeError.message;
      }

      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Refund API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
