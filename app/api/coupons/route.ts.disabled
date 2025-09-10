import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { Coupon, COLLECTIONS } from '../../../lib/firestore-schema';

// GET /api/coupons - Fetch all coupons
export async function GET() {
  try {
    const couponsRef = collection(db, COLLECTIONS.COUPONS);
    const q = query(couponsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const coupons: Coupon[] = [];
    querySnapshot.forEach((doc) => {
      coupons.push({ id: doc.id, ...doc.data() } as Coupon);
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST /api/coupons - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Received coupon data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.code || !data.discountType || data.discountValue === undefined) {
      console.log('Validation failed:', { 
        code: data.code, 
        discountType: data.discountType, 
        discountValue: data.discountValue 
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields: code, discountType, discountValue' },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCouponQuery = query(
      collection(db, COLLECTIONS.COUPONS),
      where('code', '==', data.code.toUpperCase())
    );
    const existingCoupons = await getDocs(existingCouponQuery);
    
    if (!existingCoupons.empty) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    // Validate discount value
    const discountValue = parseFloat(data.discountValue);
    if (isNaN(discountValue)) {
      return NextResponse.json(
        { success: false, error: 'Invalid discount value - must be a number' },
        { status: 400 }
      );
    }

    if (data.discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { success: false, error: 'Percentage discount must be between 0 and 100' },
        { status: 400 }
      );
    }

    if ((data.discountType === 'fixed_amount' || data.discountType === 'set_price') && discountValue < 0) {
      return NextResponse.json(
        { success: false, error: 'Discount amount must be positive' },
        { status: 400 }
      );
    }

    // Validate dates if provided
    let startDate = new Date();
    let expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year
    
    if (data.startDate) {
      startDate = new Date(data.startDate);
    }
    
    if (data.expirationDate) {
      expirationDate = new Date(data.expirationDate);
    }
    
    if (expirationDate <= startDate) {
      return NextResponse.json(
        { error: 'Expiration date must be after start date' },
        { status: 400 }
      );
    }

    // Create coupon object
    const couponData: Omit<Coupon, 'id'> = {
      code: data.code.toUpperCase(),
      name: data.displayName || data.name || data.code,
      description: data.description || '',
      discountType: data.discountType,
      discountValue: parseFloat(data.discountValue),
      maxUses: data.maxTotalUses && data.maxTotalUses !== '' ? parseInt(data.maxTotalUses) : null,
      usedCount: 0,
      maxUsesPerCustomer: data.maxUsesPerCustomer && data.maxUsesPerCustomer !== '' ? parseInt(data.maxUsesPerCustomer) : null,
      startDate: Timestamp.fromDate(startDate),
      expirationDate: Timestamp.fromDate(expirationDate),
      applicableItems: data.applicableItems || {
        playerRegistration: true,
        coachRegistration: true,
        jamboreeOnly: true,
        completeSeason: true,
        jamboreeAndSeason: true,
      },
      minimumAmount: data.minimumOrderAmount && data.minimumOrderAmount !== '' ? parseFloat(data.minimumOrderAmount) : null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      usageHistory: [],
      createdBy: 'admin',
      lastModifiedBy: 'admin',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, COLLECTIONS.COUPONS), couponData);
    
    return NextResponse.json(
      { success: true, id: docRef.id, ...couponData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating coupon:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: `Failed to create coupon: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
