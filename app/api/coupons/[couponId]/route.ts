import { NextRequest, NextResponse } from 'next/server';

// Helper function to convert dates safely
const convertDate = (dateField: any) => {
  if (!dateField) return null;
  if (typeof dateField === 'string') return dateField;
  if (dateField.toDate) return dateField.toDate().toISOString();
  if (dateField instanceof Date) return dateField.toISOString();
  return null;
};

// GET /api/coupons/[couponId] - Get single coupon
export async function GET(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const { couponId } = params;
    
    // Dynamic import to avoid build issues
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { doc, getDoc } = await import('firebase/firestore');
    
    const couponRef = doc(db, 'coupons', couponId);
    const couponSnap = await getDoc(couponRef);
    
    if (!couponSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Coupon not found'
      }, { status: 404 });
    }

    const data = couponSnap.data();
    const coupon = {
      id: couponSnap.id,
      code: data.code,
      name: data.name,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      isActive: data.isActive,
      maxUses: data.maxUses,
      usedCount: data.usedCount || 0,
      applicableItems: data.applicableItems || [],
      minimumOrderAmount: data.minimumOrderAmount || 0,
      maxUsesPerCustomer: data.maxUsesPerCustomer,
      minimumAmount: data.minimumAmount || 0,
      createdAt: convertDate(data.createdAt),
      updatedAt: convertDate(data.updatedAt),
      startDate: convertDate(data.startDate),
      expirationDate: convertDate(data.expirationDate)
    };

    return NextResponse.json({
      success: true,
      coupon
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch coupon'
    }, { status: 500 });
  }
}

// PUT /api/coupons/[couponId] - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const { couponId } = params;
    const data = await request.json();
    
    // Dynamic import to avoid build issues
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    
    // Prepare update data
    const updateData: any = { ...data };
    delete updateData.id; // Remove id from update data
    
    // Convert dates to Firestore Timestamps
    if (updateData.startDate) {
      updateData.startDate = Timestamp.fromDate(new Date(updateData.startDate));
    }
    if (updateData.expirationDate) {
      updateData.expirationDate = Timestamp.fromDate(new Date(updateData.expirationDate));
    }
    updateData.updatedAt = Timestamp.now();
    
    // Update in Firebase
    const couponRef = doc(db, 'coupons', couponId);
    await updateDoc(couponRef, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully'
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update coupon'
    }, { status: 500 });
  }
}

// DELETE /api/coupons/[couponId] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const { couponId } = params;
    
    // Dynamic import to avoid build issues
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database unavailable'
      }, { status: 503 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    
    // Delete from Firebase
    const couponRef = doc(db, 'coupons', couponId);
    await deleteDoc(couponRef);
    
    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete coupon'
    }, { status: 500 });
  }
}
