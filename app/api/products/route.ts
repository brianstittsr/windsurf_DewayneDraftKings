import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/products - Get all products
export async function GET() {
  try {
    // Dynamic import to prevent build-time execution
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Dynamic import to prevent build-time execution
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    // Prepare product data
    const productData = {
      ...data,
      totalPrice: (data.price || 0) + (data.serviceFee || 0),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      currentRegistrations: 0
    };

    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, productData);
    
    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: 'Product created successfully' 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
