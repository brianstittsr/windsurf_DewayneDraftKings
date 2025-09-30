import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/products - Get all products
export async function GET() {
  try {
    console.log('Products API: Starting fetch...');
    console.log('Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    });
    
    // Dynamic import to prevent build-time execution
    const { db } = await import('../../../lib/firebase').catch((importError) => {
      console.error('Firebase import failed:', importError);
      return { db: null };
    });
    
    if (!db) {
      console.error('Products API: Database not available - db is null');
      return NextResponse.json({ 
        error: 'Database not available',
        message: 'Firebase database connection failed. Check your environment variables.',
        debug: {
          environment: process.env.NODE_ENV,
          isVercel: !!process.env.VERCEL,
          hasFirebaseConfig: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        }
      }, { status: 500 });
    }

    console.log('Products API: Database connected, fetching products...');

    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('displayOrder', 'asc'));
    
    console.log('Products API: Executing query...');
    const snapshot = await getDocs(q);
    console.log(`Products API: Query complete, processing ${snapshot.size} documents...`);
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Products API: Successfully returning ${products.length} products`);
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products - Full error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      debug: {
        environment: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
        hasFirebaseConfig: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      }
    }, { status: 500 });
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
