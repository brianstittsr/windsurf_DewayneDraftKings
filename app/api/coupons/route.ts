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
    
    // Validate required fields
    if (!data.code || !data.name || !data.discountType || data.discountValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, discountType, discountValue' },
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
    if (data.discountType === 'percentage' && (data.discountValue < 0 || data.discountValue > 100)) {
      return NextResponse.json(
        { error: 'Percentage discount must be between 0 and 100' },
        { status: 400 }
      );
    }

    if ((data.discountType === 'fixed_amount' || data.discountType === 'set_price') && data.discountValue < 0) {
      return NextResponse.json(
        { error: 'Discount amount must be positive' },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const expirationDate = new Date(data.expirationDate);
    
    if (expirationDate <= startDate) {
      return NextResponse.json(
        { error: 'Expiration date must be after start date' },
        { status: 400 }
      );
    }

    // Create coupon object
    const couponData: Omit<Coupon, 'id'> = {
      code: data.code.toUpperCase(),
      name: data.name,
      description: data.description || '',
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses || undefined,
      usedCount: 0,
      maxUsesPerCustomer: data.maxUsesPerCustomer || undefined,
      startDate: Timestamp.fromDate(startDate),
      expirationDate: Timestamp.fromDate(expirationDate),
      applicableItems: data.applicableItems || {
        playerRegistration: true,
        coachRegistration: true,
        jamboreeOnly: true,
        completeSeason: true,
        jamboreeAndSeason: true,
      },
      minimumAmount: data.minimumAmount || undefined,
      isActive: data.isActive !== undefined ? data.isActive : true,
      usageHistory: [],
      createdBy: 'admin', // TODO: Get from auth context
      lastModifiedBy: 'admin',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, COLLECTIONS.COUPONS), couponData);
    
    return NextResponse.json(
      { id: docRef.id, ...couponData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
