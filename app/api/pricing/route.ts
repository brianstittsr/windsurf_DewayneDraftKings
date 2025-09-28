import { NextRequest, NextResponse } from 'next/server';

// GET /api/pricing - Get all active pricing plans
export async function GET() {
  try {
    // Dynamic import to prevent build-time execution
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef, 
      where('isActive', '==', true),
      where('isVisible', '==', true),
      orderBy('displayOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    
    const plans = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing plans' }, { status: 500 });
  }
}

// POST /api/pricing - Create new pricing plan
export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, addDoc } = await import('firebase/firestore');
    const data = await request.json();
    
    const pricingRef = collection(db, 'pricing');
    const docRef = await addDoc(pricingRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    return NextResponse.json({ error: 'Failed to create pricing plan' }, { status: 500 });
  }
}

// PUT /api/pricing - Update pricing plan
export async function PUT(request: NextRequest) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, updateDoc } = await import('firebase/firestore');
    const { id, ...data } = await request.json();
    
    const docRef = doc(db, 'pricing', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    return NextResponse.json({ error: 'Failed to update pricing plan' }, { status: 500 });
  }
}

// DELETE /api/pricing - Delete pricing plan (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, updateDoc } = await import('firebase/firestore');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }
    
    const docRef = doc(db, 'pricing', id);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pricing plan:', error);
    return NextResponse.json({ error: 'Failed to delete pricing plan' }, { status: 500 });
  }
}
