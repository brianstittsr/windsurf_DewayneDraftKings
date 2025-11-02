import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

interface PendingPaymentRequest {
  amount: number;
  planId: string;
  planName: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  playerId?: string;
  paymentMethod: string;
  paymentReference: string;
  appliedCoupon?: string | null;
  couponDiscount?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Creating pending payment...');
    const data: PendingPaymentRequest = await request.json();

    const {
      amount,
      planId,
      planName,
      customerEmail,
      customerName,
      customerPhone,
      playerId,
      paymentMethod,
      paymentReference,
      appliedCoupon,
      couponDiscount = 0,
    } = data;

    // Validate required fields
    if (!amount || !customerEmail || !customerName || !paymentReference) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    try {
      // Create payment record in Firebase
      const paymentData = {
        amount,
        status: 'pending',
        paymentMethod,
        paymentReference,
        customerEmail,
        customerName,
        customerPhone,
        planId,
        planName,
        playerId: playerId || null,
        appliedCoupon: appliedCoupon || null,
        couponDiscount: couponDiscount || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        instructions: {
          cashtag: process.env.CASHAPP_CASHTAG || '$YourCashTag',
          message: `Please send $${amount.toFixed(2)} to ${process.env.CASHAPP_CASHTAG || '$YourCashTag'} with reference: ${paymentReference}`,
        },
      };

      const paymentRef = await adminDb.collection('payments').add(paymentData);
      
      console.log('Pending payment created:', paymentRef.id);

      // Send email with payment instructions
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-payment-instructions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customerEmail,
            customerName,
            amount,
            paymentReference,
            cashtag: process.env.CASHAPP_CASHTAG || '$YourCashTag',
          }),
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the whole request if email fails
      }

      return NextResponse.json({
        success: true,
        paymentId: paymentRef.id,
        paymentReference,
        message: 'Pending payment created successfully'
      });

    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to save payment record',
        details: firebaseError instanceof Error ? firebaseError.message : 'Firebase error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Create pending payment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create pending payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
