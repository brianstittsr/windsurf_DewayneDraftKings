import { NextRequest, NextResponse } from 'next/server';
import { COLLECTIONS } from '@/lib/firestore-schema';

export async function GET(request: NextRequest) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, getDocs, query, orderBy, limit, where } = await import('firebase/firestore');
    const { searchParams } = new URL(request.url);
    
    const limitParam = searchParams.get('limit');
    const statusParam = searchParams.get('status');
    const typeParam = searchParams.get('type');

    let paymentQuery = query(
      collection(db, COLLECTIONS.PAYMENTS),
      orderBy('createdAt', 'desc')
    );

    // Add filters
    if (statusParam && statusParam !== 'all') {
      paymentQuery = query(paymentQuery, where('paymentStatus', '==', statusParam));
    }

    if (typeParam && typeParam !== 'all') {
      paymentQuery = query(paymentQuery, where('paymentMethod', '==', typeParam));
    }

    // Add limit
    if (limitParam) {
      const limitNum = parseInt(limitParam);
      if (!isNaN(limitNum) && limitNum > 0) {
        paymentQuery = query(paymentQuery, limit(limitNum));
      }
    }

    const querySnapshot = await getDocs(paymentQuery);
    const payments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Calculate summary statistics
    const summary = {
      total: payments.length,
      totalAmount: payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0),
      successful: payments.filter((p: any) => p.paymentStatus === 'paid').length,
      failed: payments.filter((p: any) => p.paymentStatus === 'failed').length,
      successRate: payments.length > 0 
        ? ((payments.filter((p: any) => p.paymentStatus === 'paid').length / payments.length) * 100).toFixed(1) + '%'
        : '0%'
    };

    return NextResponse.json({
      success: true,
      payments,
      summary,
      count: payments.length
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch payments'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const body = await request.json();

    const paymentData = {
      ...body,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), paymentData);

    return NextResponse.json({
      success: true,
      paymentId: docRef.id
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create payment'
    }, { status: 500 });
  }
}
