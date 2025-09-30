import { NextRequest, NextResponse } from 'next/server';

// GET /api/payments - Get all payments from Stripe and Firebase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    let allPayments: any[] = [];
    
    // Fetch from Stripe if available
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = await import('stripe').then(m => 
          new m.default(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2023-10-16'
          })
        );

        console.log('Fetching payments from Stripe...');
        
        // Fetch payment intents from Stripe
        const paymentIntents = await stripe.paymentIntents.list({
          limit: limit
        });

        // Fetch checkout sessions
        const checkoutSessions = await stripe.checkout.sessions.list({
          limit: limit,
          expand: ['data.payment_intent']
        });

        console.log(`Found ${paymentIntents.data.length} payment intents from Stripe`);

        // Process payment intents
        const stripePayments = paymentIntents.data.map(intent => {
          // Find corresponding checkout session
          const session = checkoutSessions.data.find(s => s.payment_intent === intent.id);
          
          return {
            id: intent.id,
            amount: intent.amount / 100, // Convert from cents
            currency: intent.currency.toUpperCase(),
            status: intent.status === 'succeeded' ? 'succeeded' : 
                   intent.status === 'requires_payment_method' ? 'failed' : 
                   intent.status,
            paymentMethod: intent.payment_method_types?.[0] || 'card',
            customerName: session?.customer_details?.name || 
                         intent.metadata?.customerName || 
                         'Unknown Customer',
            customerEmail: session?.customer_details?.email || 
                          intent.metadata?.customerEmail || 
                          intent.receipt_email || '',
            description: intent.description || 
                        intent.metadata?.planTitle || 
                        'Registration Payment',
            stripePaymentIntentId: intent.id,
            sessionId: session?.id || '',
            createdAt: new Date(intent.created * 1000),
            updatedAt: new Date(intent.created * 1000),
            metadata: intent.metadata || {},
            source: 'stripe'
          };
        });

        allPayments = stripePayments;

      } catch (stripeError) {
        console.error('Error fetching from Stripe:', stripeError);
      }
    }
    
    // Fetch from Firebase and merge
    try {
      const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
      
      if (db) {
        const { collection, getDocs } = await import('firebase/firestore');
        
        const paymentsRef = collection(db, 'payments');
        const paymentsSnapshot = await getDocs(paymentsRef);
        
        const firebasePayments = paymentsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            amount: data.amount || 0,
            currency: data.currency || 'USD',
            status: data.status || 'pending',
            paymentMethod: data.paymentMethod || 'card',
            customerName: data.customerName || '',
            customerEmail: data.customerEmail || '',
            description: data.description || '',
            stripePaymentIntentId: data.stripePaymentIntentId || '',
            stripeSessionId: data.stripeSessionId || '',
            metadata: data.metadata || {},
            refunds: data.refunds || [],
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
            source: 'firebase'
          };
        });
        
        // Merge Firebase payments with Stripe payments (avoid duplicates)
        firebasePayments.forEach(fbPayment => {
          const existsInStripe = allPayments.find(p => 
            p.stripePaymentIntentId === fbPayment.stripePaymentIntentId && 
            fbPayment.stripePaymentIntentId
          );
          
          if (!existsInStripe) {
            allPayments.push(fbPayment);
          }
        });
      }
    } catch (firebaseError) {
      console.error('Firebase query error:', firebaseError);
    }

    // Apply filters
    let filteredPayments = allPayments;
    
    if (status && status !== 'all') {
      filteredPayments = filteredPayments.filter(payment => payment.status === status);
    }
    
    if (type && type !== 'all') {
      filteredPayments = filteredPayments.filter(payment => payment.paymentMethod === type);
    }
    
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredPayments = filteredPayments.filter(payment => 
        payment.customerName.toLowerCase().includes(searchLower) ||
        payment.customerEmail.toLowerCase().includes(searchLower) ||
        payment.description.toLowerCase().includes(searchLower) ||
        payment.id.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filteredPayments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Calculate summary
    const summary = {
      total: filteredPayments.length,
      totalAmount: filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
      successful: filteredPayments.filter(p => p.status === 'succeeded').length,
      failed: filteredPayments.filter(p => p.status === 'failed').length,
      successRate: filteredPayments.length > 0 ? 
        `${Math.round((filteredPayments.filter(p => p.status === 'succeeded').length / filteredPayments.length) * 100)}%` : 
        '0%'
    };

    return NextResponse.json({
      success: true,
      payments: filteredPayments,
      summary,
      message: `Found ${filteredPayments.length} payments`
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch payments',
      payments: [],
      summary: {
        total: 0,
        totalAmount: 0,
        successful: 0,
        failed: 0,
        successRate: '0%'
      }
    }, { status: 500 });
  }
}

// POST /api/payments - Create new payment record
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    const paymentData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const paymentsRef = collection(db, 'payments');
    const docRef = await addDoc(paymentsRef, paymentData);
    
    return NextResponse.json({
      success: true,
      paymentId: docRef.id,
      message: 'Payment record created successfully'
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create payment record'
    }, { status: 500 });
  }
}

// DELETE /api/payments - Delete payment record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');
    
    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required'
      }, { status: 400 });
    }
    
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
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
      message: 'Payment record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete payment record',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
