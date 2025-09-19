import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

// GET /api/pricing - Get all active pricing plans
export async function GET() {
  try {
    // Dynamic import to prevent build-time execution
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const pricingRef = collection(db, 'pricing');
    const q = query(pricingRef, where('isActive', '==', true));
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

// POST /api/pricing - Create a new pricing plan
export async function POST(request: NextRequest) {
  try {
    // Dynamic import to prevent build-time execution
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, addDoc } = await import('firebase/firestore');
    const body = await request.json();
    
    const pricingRef = collection(db, 'pricing');
    const docRef = await addDoc(pricingRef, {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ id: docRef.id, ...body }, { status: 201 });
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    return NextResponse.json({ error: 'Failed to create pricing plan' }, { status: 500 });
  }
}

// PUT /api/pricing/[id] - Update a pricing plan
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Dynamic import to prevent build-time execution
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, updateDoc } = await import('firebase/firestore');
    const body = await request.json();
    
    const pricingDoc = doc(db, 'pricing', params.id);
    await updateDoc(pricingDoc, {
      ...body,
      updatedAt: new Date()
    });

    return NextResponse.json({ id: params.id, ...body });
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    return NextResponse.json({ error: 'Failed to update pricing plan' }, { status: 500 });
  }
}

// DELETE /api/pricing/[id] - Delete a pricing plan (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Dynamic import to prevent build-time execution
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, updateDoc } = await import('firebase/firestore');
    
    const pricingDoc = doc(db, 'pricing', params.id);
    await updateDoc(pricingDoc, {
      isActive: false,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pricing plan:', error);
    return NextResponse.json({ error: 'Failed to delete pricing plan' }, { status: 500 });
  }
}
