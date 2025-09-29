import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Alternative products API using multiple Firebase connection methods
export async function GET() {
  console.log('Products Server API: Starting fetch...');
  
  // Method 1: Try Firebase Admin SDK
  try {
    const { getAdminDb } = await import('../../../../lib/firebase-admin');
    const adminDb = getAdminDb();
    
    if (adminDb) {
      console.log('Using Firebase Admin SDK...');
      const snapshot = await adminDb.collection('products').orderBy('displayOrder', 'asc').get();
      const products = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Products Server API: Found ${products.length} products via Admin SDK`);
      return NextResponse.json({ products, method: 'admin-sdk' });
    }
  } catch (adminError) {
    console.log('Admin SDK failed, trying client SDK:', adminError);
  }

  // Method 2: Try Client SDK (fallback)
  try {
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (db) {
      console.log('Using Firebase Client SDK...');
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('displayOrder', 'asc'));
      const snapshot = await getDocs(q);
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Products Server API: Found ${products.length} products via Client SDK`);
      return NextResponse.json({ products, method: 'client-sdk' });
    }
  } catch (clientError) {
    console.log('Client SDK failed:', clientError);
  }

  // Method 3: Direct REST API call to Firebase (last resort)
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId) {
      console.log('Using Firebase REST API...');
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const products = data.documents?.map((doc: any) => {
          const id = doc.name.split('/').pop();
          const fields = doc.fields || {};
          
          // Convert Firestore field format to regular object
          const product: any = { id };
          Object.keys(fields).forEach(key => {
            const field = fields[key];
            if (field.stringValue !== undefined) product[key] = field.stringValue;
            else if (field.integerValue !== undefined) product[key] = parseInt(field.integerValue);
            else if (field.doubleValue !== undefined) product[key] = parseFloat(field.doubleValue);
            else if (field.booleanValue !== undefined) product[key] = field.booleanValue;
            else if (field.arrayValue) product[key] = field.arrayValue.values?.map((v: any) => v.stringValue) || [];
          });
          
          return product;
        }) || [];

        console.log(`Products Server API: Found ${products.length} products via REST API`);
        return NextResponse.json({ products, method: 'rest-api' });
      }
    }
  } catch (restError) {
    console.log('REST API failed:', restError);
  }

  // All methods failed
  console.error('All Firebase connection methods failed');
  return NextResponse.json({ 
    error: 'All Firebase connection methods failed',
    debug: {
      environment: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    }
  }, { status: 500 });
}
