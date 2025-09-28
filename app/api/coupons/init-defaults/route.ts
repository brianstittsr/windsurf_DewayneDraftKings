import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const defaultCoupons = [
  {
    code: 'SAVE100',
    name: 'Save $10 Discount',
    description: 'Get $10 off your registration',
    discountType: 'fixed_amount' as const,
    discountValue: 10,
    maxUses: 100,
    maxUsesPerCustomer: 1,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    applicableItems: {
      playerRegistration: true,
      coachRegistration: true,
      jamboreeOnly: true,
      completeSeason: true,
      jamboreeAndSeason: true,
    },
    minimumAmount: 25,
    isActive: true,
    usedCount: 0
  },
  {
    code: 'EARLYBIRD',
    name: 'Early Bird 15% Off',
    description: 'Early registration discount - 15% off',
    discountType: 'percentage' as const,
    discountValue: 15,
    maxUses: 50,
    maxUsesPerCustomer: 1,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    applicableItems: {
      playerRegistration: true,
      coachRegistration: false,
      jamboreeOnly: false,
      completeSeason: true,
      jamboreeAndSeason: true,
    },
    minimumAmount: 50,
    isActive: true,
    usedCount: 0
  },
  {
    code: 'COACH50',
    name: 'Coach Special - $5 Off',
    description: 'Special discount for coaches',
    discountType: 'fixed_amount' as const,
    discountValue: 5,
    maxUses: 25,
    maxUsesPerCustomer: 1,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    applicableItems: {
      playerRegistration: false,
      coachRegistration: true,
      jamboreeOnly: false,
      completeSeason: false,
      jamboreeAndSeason: false,
    },
    minimumAmount: 20,
    isActive: true,
    usedCount: 0
  },
  {
    code: 'JAMBOREE25',
    name: 'Jamboree Special - $2.50 Off',
    description: 'Special discount for Jamboree registration',
    discountType: 'fixed_amount' as const,
    discountValue: 2.5,
    maxUses: 75,
    maxUsesPerCustomer: 1,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    applicableItems: {
      playerRegistration: true,
      coachRegistration: false,
      jamboreeOnly: true,
      completeSeason: false,
      jamboreeAndSeason: true,
    },
    minimumAmount: 15,
    isActive: true,
    usedCount: 0
  },
  {
    code: 'BUNDLE20',
    name: 'Bundle Deal - 20% Off',
    description: 'Get 20% off Jamboree + Season bundle',
    discountType: 'percentage' as const,
    discountValue: 20,
    maxUses: 30,
    maxUsesPerCustomer: 1,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months
    applicableItems: {
      playerRegistration: true,
      coachRegistration: false,
      jamboreeOnly: false,
      completeSeason: false,
      jamboreeAndSeason: true,
    },
    minimumAmount: 75,
    isActive: true,
    usedCount: 0
  }
];

// POST /api/coupons/init-defaults - Initialize default coupons
export async function POST(request: NextRequest) {
  try {
    // Dynamic import to prevent build-time execution
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, addDoc, query, where, getDocs, Timestamp } = await import('firebase/firestore');
    
    const results = [];
    const couponsRef = collection(db, 'coupons');

    for (const coupon of defaultCoupons) {
      try {
        // Check if coupon already exists
        const existingQuery = query(couponsRef, where('code', '==', coupon.code));
        const existingSnapshot = await getDocs(existingQuery);
        
        if (!existingSnapshot.empty) {
          results.push({
            code: coupon.code,
            status: 'skipped',
            message: 'Coupon already exists'
          });
          continue;
        }

        // Prepare coupon data with Firestore timestamps
        const couponData = {
          ...coupon,
          startDate: Timestamp.fromDate(coupon.startDate),
          expirationDate: Timestamp.fromDate(coupon.expirationDate),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(couponsRef, couponData);
        
        results.push({
          code: coupon.code,
          status: 'created',
          id: docRef.id,
          message: 'Coupon created successfully'
        });
      } catch (error) {
        results.push({
          code: coupon.code,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const created = results.filter(r => r.status === 'created').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      message: `Initialized default coupons: ${created} created, ${skipped} skipped, ${errors} errors`,
      results,
      summary: { created, skipped, errors }
    });
  } catch (error) {
    console.error('Error initializing default coupons:', error);
    return NextResponse.json({ error: 'Failed to initialize default coupons' }, { status: 500 });
  }
}
