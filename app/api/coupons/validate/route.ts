import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { couponCode } = await request.json();

    if (!couponCode || typeof couponCode !== 'string') {
      return NextResponse.json({ 
        error: 'Coupon code is required' 
      }, { status: 400 });
    }

    // Dynamic import to avoid build errors
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Coupon validation unavailable' 
      }, { status: 503 });
    }

    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('code', '==', couponCode.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return NextResponse.json({ 
        error: 'Invalid coupon code' 
      }, { status: 404 });
    }

    const couponDoc = snapshot.docs[0];
    const coupon = { id: couponDoc.id, ...couponDoc.data() } as any;
    
    // Validate coupon
    const now = new Date();
    const expiryDate = coupon.expiryDate?.toDate();
    
    if (expiryDate && expiryDate < now) {
      return NextResponse.json({ 
        error: 'Coupon has expired' 
      }, { status: 400 });
    }
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ 
        error: 'Coupon usage limit reached' 
      }, { status: 400 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ 
        error: 'Coupon is not active' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        minimumOrderValue: coupon.minimumOrderValue || 0,
        applicableItems: coupon.applicableItems || []
      }
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
