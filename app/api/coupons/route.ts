import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all coupons
export async function GET(request: NextRequest) {
  try {
    // Dynamic import to avoid build errors
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const coupons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, coupons });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch coupons' 
    }, { status: 500 });
  }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, discountType, discountValue, description, isActive, usageLimit, expiryDate, minimumOrderValue, applicableItems } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: code, discountType, discountValue' 
      }, { status: 400 });
    }

    // Dynamic import to avoid build errors
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { collection, addDoc, query, where, getDocs, serverTimestamp } = await import('firebase/firestore');
    
    // Check if coupon code already exists
    const couponsRef = collection(db, 'coupons');
    const existingQuery = query(couponsRef, where('code', '==', code.toUpperCase()));
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      return NextResponse.json({ 
        error: 'Coupon code already exists' 
      }, { status: 400 });
    }

    const couponData = {
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      description: description || '',
      isActive: isActive !== false, // Default to true
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usedCount: 0,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      minimumOrderValue: minimumOrderValue ? Number(minimumOrderValue) : 0,
      applicableItems: applicableItems || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(couponsRef, couponData);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: 'Coupon created successfully' 
    });

  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ 
      error: 'Failed to create coupon' 
    }, { status: 500 });
  }
}

// PUT - Update existing coupon
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, code, discountType, discountValue, description, isActive, usageLimit, expiryDate, minimumOrderValue, applicableItems } = body;

    if (!id) {
      return NextResponse.json({ 
        error: 'Coupon ID is required' 
      }, { status: 400 });
    }

    // Dynamic import to avoid build errors
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    
    const couponRef = doc(db, 'coupons', id);
    
    const updateData: any = {
      updatedAt: serverTimestamp()
    };

    if (code) updateData.code = code.toUpperCase();
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (minimumOrderValue !== undefined) updateData.minimumOrderValue = Number(minimumOrderValue);
    if (applicableItems !== undefined) updateData.applicableItems = applicableItems;

    await updateDoc(couponRef, updateData);

    return NextResponse.json({ 
      success: true, 
      message: 'Coupon updated successfully' 
    });

  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ 
      error: 'Failed to update coupon' 
    }, { status: 500 });
  }
}

// DELETE - Delete coupon
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: 'Coupon ID is required' 
      }, { status: 400 });
    }

    // Dynamic import to avoid build errors
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    
    const couponRef = doc(db, 'coupons', id);
    await deleteDoc(couponRef);

    return NextResponse.json({ 
      success: true, 
      message: 'Coupon deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ 
      error: 'Failed to delete coupon' 
    }, { status: 500 });
  }
}
