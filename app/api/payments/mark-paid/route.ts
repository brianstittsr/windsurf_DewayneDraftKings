import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { paymentId, adminNote } = await request.json();

    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required'
      }, { status: 400 });
    }

    try {
      const paymentRef = adminDb.collection('payments').doc(paymentId);
      const paymentDoc = await paymentRef.get();

      if (!paymentDoc.exists) {
        return NextResponse.json({
          success: false,
          error: 'Payment not found'
        }, { status: 404 });
      }

      const paymentData = paymentDoc.data();

      // Update payment status
      await paymentRef.update({
        status: 'succeeded',
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        adminNote: adminNote || 'Payment confirmed by admin',
      });

      console.log('Payment marked as paid:', paymentId);

      // Send confirmation email
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-payment-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: paymentData?.customerEmail,
            customerName: paymentData?.customerName,
            amount: paymentData?.amount,
            paymentReference: paymentData?.paymentReference,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the whole request if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Payment marked as paid successfully'
      });

    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update payment',
        details: firebaseError instanceof Error ? firebaseError.message : 'Firebase error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Mark paid error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark payment as paid',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
