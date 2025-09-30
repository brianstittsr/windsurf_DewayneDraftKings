import { NextRequest, NextResponse } from 'next/server';

// GET /api/coupons - Get all coupons
export async function GET(request: NextRequest) {
  try {
    // Dynamic import to avoid build issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      console.log('Firebase unavailable, returning empty coupons list');
      return NextResponse.json({
        success: true,
        coupons: []
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    // Fetch coupons from Firebase
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const coupons = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Helper function to convert dates safely
      const convertDate = (dateField: any) => {
        if (!dateField) return null;
        if (typeof dateField === 'string') return dateField;
        if (dateField.toDate) return dateField.toDate().toISOString();
        if (dateField instanceof Date) return dateField.toISOString();
        return null;
      };
      
      return {
        id: doc.id,
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
        createdAt: convertDate(data.createdAt),
        updatedAt: convertDate(data.updatedAt),
        startDate: convertDate(data.startDate),
        expirationDate: convertDate(data.expirationDate)
      };
    });

    return NextResponse.json({
      success: true,
      coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ 
      success: false, 
      coupons: [],
      error: 'Failed to fetch coupons' 
    }, { status: 500 });
  }
}

// POST /api/coupons - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Dynamic import to avoid build issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    // Prepare coupon data
    const couponData = {
      ...data,
      startDate: data.startDate ? Timestamp.fromDate(new Date(data.startDate)) : Timestamp.now(),
      expirationDate: data.expirationDate ? Timestamp.fromDate(new Date(data.expirationDate)) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      usedCount: 0,
      isActive: data.isActive !== undefined ? data.isActive : true
    };
    
    // Save to Firebase
    const couponsRef = collection(db, 'coupons');
    const docRef = await addDoc(couponsRef, couponData);
    
    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      couponId: docRef.id
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create coupon' 
    }, { status: 500 });
  }
}

// PUT /api/coupons - Update coupon
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Coupon ID is required' 
      }, { status: 400 });
    }
    
    // Dynamic import to avoid build issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    
    // Prepare update data
    const couponUpdateData = {
      ...updateData,
      startDate: updateData.startDate ? Timestamp.fromDate(new Date(updateData.startDate)) : undefined,
      expirationDate: updateData.expirationDate ? Timestamp.fromDate(new Date(updateData.expirationDate)) : undefined,
      updatedAt: Timestamp.now()
    };
    
    // Remove undefined values
    Object.keys(couponUpdateData).forEach(key => {
      if (couponUpdateData[key] === undefined) {
        delete couponUpdateData[key];
      }
    });
    
    // Update in Firebase
    const couponRef = doc(db, 'coupons', id);
    await updateDoc(couponRef, couponUpdateData);
    
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

// DELETE /api/coupons - Delete coupon
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Coupon ID is required' 
      }, { status: 400 });
    }
    
    // Dynamic import to avoid build issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    
    // Delete from Firebase
    const couponRef = doc(db, 'coupons', id);
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
