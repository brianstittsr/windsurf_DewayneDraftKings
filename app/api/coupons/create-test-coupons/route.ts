import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Dynamic import to avoid build issues
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp, query, where, getDocs } = await import('firebase/firestore');
    
    // Test coupons to create
    const testCoupons = [
      {
        code: 'SAVE20',
        name: '20% Off Discount',
        description: 'Get 20% off your registration',
        discountType: 'percentage',
        discountValue: 20,
        startDate: Timestamp.now(),
        expirationDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        applicableItems: {
          playerRegistration: true,
          coachRegistration: true,
          jamboreeOnly: true,
          completeSeason: true,
          jamboreeAndSeason: true
        },
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        usedCount: 0
      },
      {
        code: 'SAVE15',
        name: '$15 Off Discount',
        description: 'Get $15 off your registration',
        discountType: 'fixed_amount',
        discountValue: 15,
        startDate: Timestamp.now(),
        expirationDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        applicableItems: {
          playerRegistration: true,
          coachRegistration: true,
          jamboreeOnly: true,
          completeSeason: true,
          jamboreeAndSeason: true
        },
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        usedCount: 0
      },
      {
        code: 'SPECIAL50',
        name: 'Special $50 Price',
        description: 'Pay only $50 regardless of original price',
        discountType: 'set_price',
        discountValue: 50,
        startDate: Timestamp.now(),
        expirationDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        applicableItems: {
          playerRegistration: true,
          coachRegistration: true,
          jamboreeOnly: true,
          completeSeason: true,
          jamboreeAndSeason: true
        },
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        usedCount: 0
      },
      {
        code: 'SAVE10',
        name: '10% Off Discount',
        description: 'Get 10% off your registration',
        discountType: 'percentage',
        discountValue: 10,
        startDate: Timestamp.now(),
        expirationDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        applicableItems: {
          playerRegistration: true,
          coachRegistration: true,
          jamboreeOnly: true,
          completeSeason: true,
          jamboreeAndSeason: true
        },
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        usedCount: 0
      }
    ];

    const couponsRef = collection(db, 'coupons');
    const createdCoupons = [];
    const skippedCoupons = [];

    for (const coupon of testCoupons) {
      // Check if coupon already exists
      const existingQuery = query(couponsRef, where('code', '==', coupon.code));
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        skippedCoupons.push(coupon.code);
        continue;
      }

      // Create the coupon
      const docRef = await addDoc(couponsRef, coupon);
      createdCoupons.push({
        id: docRef.id,
        code: coupon.code,
        type: coupon.discountType,
        value: coupon.discountValue
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Test coupons creation completed',
      created: createdCoupons,
      skipped: skippedCoupons,
      summary: {
        total: testCoupons.length,
        created: createdCoupons.length,
        skipped: skippedCoupons.length
      }
    });

  } catch (error) {
    console.error('Error creating test coupons:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test coupons'
    }, { status: 500 });
  }
}
