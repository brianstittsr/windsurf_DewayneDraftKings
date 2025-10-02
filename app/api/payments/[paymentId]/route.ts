import { NextRequest, NextResponse } from 'next/server';

// GET /api/payments/[paymentId] - Get single payment
export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;
    
    // Try Stripe first
    if (process.env.STRIPE_SECRET_KEY && paymentId.startsWith('pi_')) {
      try {
        const stripe = await import('stripe').then(m => 
          new m.default(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2023-10-16'
          })
        );

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        
        return NextResponse.json({
          success: true,
          payment: {
            id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            status: paymentIntent.status,
            paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
            description: paymentIntent.description || '',
            metadata: paymentIntent.metadata || {},
            createdAt: new Date(paymentIntent.created * 1000),
            source: 'stripe'
          }
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
      }
    }
    
    // Try Firebase
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { doc, getDoc } = await import('firebase/firestore');
    
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentSnap = await getDoc(paymentRef);
    
    if (!paymentSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Payment not found'
      }, { status: 404 });
    }

    const data = paymentSnap.data();
    
    return NextResponse.json({
      success: true,
      payment: {
        id: paymentSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        source: 'firebase'
      }
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch payment'
    }, { status: 500 });
  }
}

// PUT /api/payments/[paymentId] - Update payment
export async function PUT(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;
    const data = await request.json();
    
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { doc, getDoc, setDoc, updateDoc, Timestamp } = await import('firebase/firestore');
    
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentSnap = await getDoc(paymentRef);
    
    // If payment doesn't exist in Firebase (e.g., Stripe payment), create it
    if (!paymentSnap.exists()) {
      console.log(`Payment ${paymentId} doesn't exist in Firebase, creating it...`);
      
      // Create a new document with the update data
      const newPaymentData = {
        id: paymentId,
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(paymentRef, newPaymentData);
      
      return NextResponse.json({
        success: true,
        message: 'Payment created and updated successfully'
      });
    }
    
    // Payment exists, update it
    const updateData = {
      ...data,
      updatedAt: Timestamp.now()
    };
    
    // Remove id from update data
    delete updateData.id;
    
    await updateDoc(paymentRef, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully'
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/payments/[paymentId] - Delete payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;
    
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    
    const paymentRef = doc(db, 'payments', paymentId);
    await deleteDoc(paymentRef);
    
    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete payment'
    }, { status: 500 });
  }
}
