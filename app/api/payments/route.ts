import { NextRequest, NextResponse } from 'next/server';

// GET /api/payments - Get all payments from Firebase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    
    // Dynamic import to avoid build-time issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      console.warn('Firebase not available, returning empty payments');
      return NextResponse.json({
        success: true,
        payments: [],
        summary: {
          total: 0,
          totalAmount: 0,
          successful: 0,
          failed: 0,
          successRate: '0%'
        },
        message: 'Database connection unavailable'
      });
    }

    const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    
    let allPayments: any[] = [];
    
    try {
      // Fetch payments from Firebase
      const paymentsRef = collection(db, 'payments');
      const paymentsSnapshot = await getDocs(paymentsRef);
      
      allPayments = paymentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          amount: data.amount || 0,
          currency: data.currency || 'usd',
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
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
      });
      
    } catch (firebaseError) {
      console.error('Firebase query error:', firebaseError);
      allPayments = [];
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

    // Calculate summary statistics
    const totalAmount = allPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const successful = allPayments.filter(p => p.status === 'succeeded').length;
    const failed = allPayments.filter(p => p.status === 'failed').length;
    const successRate = allPayments.length > 0 ? ((successful / allPayments.length) * 100).toFixed(1) + '%' : '0%';

    const summary = {
      total: allPayments.length,
      totalAmount,
      successful,
      failed,
      successRate
    };

    // Sort by creation date (newest first)
    filteredPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      payments: filteredPayments,
      summary,
      total: filteredPayments.length
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ 
      success: false, 
      payments: [],
      summary: null,
      error: 'Failed to fetch payments' 
    }, { status: 500 });
  }
}

// POST /api/payments - Create new payment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Mock response - replace with actual payment processing
    return NextResponse.json({
      success: true,
      message: 'Payment created successfully',
      paymentId: 'mock-payment-id'
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create payment' 
    }, { status: 500 });
  }
}
