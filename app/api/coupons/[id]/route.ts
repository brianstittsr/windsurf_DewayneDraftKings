import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { Coupon, COLLECTIONS } from '../../../../lib/firestore-schema';

// GET /api/coupons/[id] - Get specific coupon
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const couponDoc = await getDoc(doc(db, COLLECTIONS.COUPONS, params.id));
    
    if (!couponDoc.exists()) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    const coupon = { id: couponDoc.id, ...couponDoc.data() } as Coupon;
    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
      { status: 500 }
    );
  }
}

// PUT /api/coupons/[id] - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    // Check if coupon exists
    const couponDoc = await getDoc(doc(db, COLLECTIONS.COUPONS, params.id));
    if (!couponDoc.exists()) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    const existingCoupon = couponDoc.data() as Coupon;

    // If code is being changed, check for duplicates
    if (data.code && data.code.toUpperCase() !== existingCoupon.code) {
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
    }

    // Validate discount value if provided
    if (data.discountType && data.discountValue !== undefined) {
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
    }

    // Validate dates if provided
    if (data.startDate && data.expirationDate) {
      const startDate = new Date(data.startDate);
      const expirationDate = new Date(data.expirationDate);
      
      if (expirationDate <= startDate) {
        return NextResponse.json(
          { error: 'Expiration date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Partial<Coupon> = {
      lastModifiedBy: 'admin', // TODO: Get from auth context
      updatedAt: Timestamp.now(),
    };

    // Update fields if provided
    if (data.code) updateData.code = data.code.toUpperCase();
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.discountType) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses || undefined;
    if (data.maxUsesPerCustomer !== undefined) updateData.maxUsesPerCustomer = data.maxUsesPerCustomer || undefined;
    if (data.startDate) updateData.startDate = Timestamp.fromDate(new Date(data.startDate));
    if (data.expirationDate) updateData.expirationDate = Timestamp.fromDate(new Date(data.expirationDate));
    if (data.applicableItems) updateData.applicableItems = data.applicableItems;
    if (data.minimumAmount !== undefined) updateData.minimumAmount = data.minimumAmount || undefined;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Update in Firestore
    await updateDoc(doc(db, COLLECTIONS.COUPONS, params.id), updateData);
    
    // Fetch updated coupon
    const updatedDoc = await getDoc(doc(db, COLLECTIONS.COUPONS, params.id));
    const updatedCoupon = { id: updatedDoc.id, ...updatedDoc.data() } as Coupon;

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if coupon exists
    const couponDoc = await getDoc(doc(db, COLLECTIONS.COUPONS, params.id));
    if (!couponDoc.exists()) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    const coupon = couponDoc.data() as Coupon;

    // Check if coupon has been used
    if (coupon.usedCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete coupon that has been used. Deactivate it instead.' },
        { status: 400 }
      );
    }

    // Delete from Firestore
    await deleteDoc(doc(db, COLLECTIONS.COUPONS, params.id));
    
    return NextResponse.json(
      { message: 'Coupon deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
