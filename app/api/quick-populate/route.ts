import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Quick populate: Starting...');
    
    // Try to get Firebase connection
    const { db } = await import('../../../lib/firebase').catch((error) => {
      console.error('Firebase import failed:', error);
      return { db: null };
    });
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Firebase not available',
        debug: {
          environment: process.env.NODE_ENV,
          isVercel: !!process.env.VERCEL,
          hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        }
      }, { status: 500 });
    }

    console.log('Quick populate: Firebase connected');

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    // Add just 3 essential products for testing
    const testProducts = [
      {
        title: 'Player Registration',
        subtitle: 'Individual Player',
        price: 150.00,
        serviceFee: 15.00,
        totalPrice: 165.00,
        features: ['Full season participation', 'Team jersey included', 'Professional coaching'],
        itemType: 'season',
        category: 'player',
        popular: true,
        buttonText: 'Register Now',
        buttonClass: 'btn-primary',
        displayOrder: 1,
        isActive: true,
        isVisible: true,
        maxCapacity: 100,
        currentRegistrations: 0,
        tags: ['season', 'player'],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        title: 'Jamboree Entry',
        subtitle: 'Single Event',
        price: 75.00,
        serviceFee: 7.50,
        totalPrice: 82.50,
        features: ['Weekend tournament entry', 'Multiple games guaranteed'],
        itemType: 'jamboree',
        category: 'player',
        popular: false,
        buttonText: 'Enter Tournament',
        buttonClass: 'btn-success',
        displayOrder: 2,
        isActive: true,
        isVisible: true,
        maxCapacity: 50,
        currentRegistrations: 0,
        tags: ['tournament', 'jamboree'],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        title: 'Head Coach',
        subtitle: 'Team Leadership',
        price: 150.00,
        serviceFee: 15.00,
        totalPrice: 165.00,
        features: ['Advanced coaching certification', 'Complete training package'],
        itemType: 'head_coach',
        category: 'coach',
        popular: true,
        buttonText: 'Lead a Team',
        buttonClass: 'btn-primary',
        displayOrder: 3,
        isActive: true,
        isVisible: true,
        maxCapacity: 10,
        currentRegistrations: 0,
        tags: ['coach', 'head'],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    console.log('Quick populate: Adding products...');
    const results = [];
    
    for (const product of testProducts) {
      try {
        const docRef = await addDoc(collection(db, 'products'), product);
        results.push({ id: docRef.id, title: product.title, status: 'success' });
        console.log(`Quick populate: Added ${product.title}`);
      } catch (error) {
        results.push({ title: product.title, status: 'error', error: error.message });
        console.error(`Quick populate: Failed to add ${product.title}:`, error);
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    
    return NextResponse.json({ 
      success: true, 
      message: `Quick populate completed: ${successCount}/${testProducts.length} products added`,
      results: results,
      debug: {
        environment: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Quick populate error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Quick populate failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        environment: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL
      }
    }, { status: 500 });
  }
}
