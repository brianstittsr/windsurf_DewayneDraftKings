import { NextRequest, NextResponse } from 'next/server';

// POST /api/coupons/increment-usage - Increment coupon usage count
export async function POST(request: NextRequest) {
  try {
    const { couponCode } = await request.json();
    
    if (!couponCode) {
      return NextResponse.json({
        success: false,
        error: 'Coupon code is required'
      }, { status: 400 });
    }

    // Special handling for REGISTER coupon - it doesn't exist in database
    // We'll track it separately or just skip incrementing
    if (couponCode.toUpperCase() === 'REGISTER') {
      console.log('REGISTER coupon used - no database increment needed');
      return NextResponse.json({
        success: true,
        message: 'REGISTER coupon usage logged',
        couponCode: 'REGISTER'
      });
    }

    // Dynamic import to avoid build issues
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      console.warn('Firebase unavailable - coupon usage not tracked');
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { collection, query, where, getDocs, doc, updateDoc, increment, Timestamp } = await import('firebase/firestore');
    
    // Find coupon by code
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('code', '==', couponCode.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn(`Coupon not found: ${couponCode}`);
      return NextResponse.json({
        success: false,
        error: 'Coupon not found'
      }, { status: 404 });
    }
    
    const couponDoc = snapshot.docs[0];
    const couponRef = doc(db, 'coupons', couponDoc.id);
    
    // Increment the usedCount
    await updateDoc(couponRef, {
      usedCount: increment(1),
      lastUsedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    const currentCount = couponDoc.data().usedCount || 0;
    const newCount = currentCount + 1;
    
    console.log(`Coupon ${couponCode} usage incremented: ${currentCount} -> ${newCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'Coupon usage incremented',
      couponCode: couponCode.toUpperCase(),
      previousCount: currentCount,
      newCount: newCount
    });
    
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to increment coupon usage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
