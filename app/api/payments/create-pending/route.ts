import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

// Initialize Firebase client SDK for this API route
function getFirestoreClient() {
  const apps = getApps();
  let app;
  
  if (apps.length === 0) {
    app = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  } else {
    app = apps[0];
  }
  
  return getFirestore(app);
}

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
      // Filter out undefined values to avoid Firestore errors
      const paymentData: any = {
        amount,
        status: 'pending',
        paymentMethod,
        paymentReference,
        customerEmail,
        customerName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        instructions: {
          cashtag: process.env.CASHAPP_CASHTAG || '$AllProSportsNC',
          message: `Please send $${amount.toFixed(2)} to ${process.env.CASHAPP_CASHTAG || '$AllProSportsNC'} with reference: ${paymentReference}`,
        },
      };

      // Only add optional fields if they have values
      if (customerPhone) paymentData.customerPhone = customerPhone;
      if (planId) paymentData.planId = planId;
      if (planName) paymentData.planName = planName;
      if (playerId) paymentData.playerId = playerId;
      if (appliedCoupon) paymentData.appliedCoupon = appliedCoupon;
      if (couponDiscount) paymentData.couponDiscount = couponDiscount;

      const db = getFirestoreClient();
      
      console.log('About to save payment data:', JSON.stringify(paymentData, null, 2));
      
      const paymentRef = await addDoc(collection(db, 'payments'), paymentData);
      
      console.log('Pending payment created successfully:', paymentRef.id);

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
      console.error('Firebase error stack:', firebaseError instanceof Error ? firebaseError.stack : 'No stack trace');
      console.error('Firebase error details:', JSON.stringify(firebaseError, null, 2));
      return NextResponse.json({
        success: false,
        error: 'Failed to save payment record',
        details: firebaseError instanceof Error ? firebaseError.message : String(firebaseError)
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
