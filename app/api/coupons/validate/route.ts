import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount, applicableItems } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ 
        error: 'Coupon code is required' 
      }, { status: 400 });
    }

    if (typeof orderAmount !== 'number' || orderAmount <= 0) {
      return NextResponse.json({ 
        error: 'Valid order amount is required' 
      }, { status: 400 });
    }

    // Check if Firebase environment variables are configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.error('Firebase not configured - missing NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      return NextResponse.json({ 
        error: 'Coupon validation service not available' 
      }, { status: 503 });
    }

    // Dynamic import with better error handling
    let db;
    try {
      const firebaseModule = await import('@/lib/firebase');
      db = firebaseModule.db;
      
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
    } catch (firebaseError) {
      console.error('Firebase initialization error:', firebaseError);
      return NextResponse.json({ 
        error: 'Database connection failed' 
      }, { status: 503 });
    }

    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('code', '==', code.toUpperCase()));
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

    // Check minimum order value
    if (coupon.minimumOrderValue && orderAmount < coupon.minimumOrderValue) {
      return NextResponse.json({ 
        error: `Minimum order value of $${coupon.minimumOrderValue} required` 
      }, { status: 400 });
    }

    // Check applicable items
    if (coupon.applicableItems && coupon.applicableItems.length > 0 && applicableItems) {
      const hasApplicableItem = applicableItems.some((item: string) => 
        coupon.applicableItems.includes(item)
      );
      if (!hasApplicableItem) {
        return NextResponse.json({ 
          error: 'Coupon not applicable to selected items' 
        }, { status: 400 });
      }
    }

    // Calculate discount based on coupon type
    let discount = 0;
    let finalAmount = orderAmount;

    switch (coupon.discountType) {
      case 'percentage':
        discount = (orderAmount * coupon.discountValue) / 100;
        finalAmount = orderAmount - discount;
        break;
      case 'fixed_amount':
        discount = Math.min(coupon.discountValue, orderAmount);
        finalAmount = orderAmount - discount;
        break;
      case 'set_price':
        discount = Math.max(0, orderAmount - coupon.discountValue);
        finalAmount = coupon.discountValue;
        break;
      default:
        return NextResponse.json({ 
          error: 'Invalid coupon type' 
        }, { status: 400 });
    }

    // Ensure final amount is not negative
    finalAmount = Math.max(0, finalAmount);

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
      },
      discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
      finalAmount: Math.round(finalAmount * 100) / 100,
      orderAmount: orderAmount
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
