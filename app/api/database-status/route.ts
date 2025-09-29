import { NextResponse } from 'next/server';

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    databases: {}
  };

  // Check production Firebase
  try {
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (db) {
      const { collection, getDocs } = await import('firebase/firestore');
      const snapshot = await getDocs(collection(db, 'products'));
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        category: doc.data().category,
        price: doc.data().totalPrice,
        isActive: doc.data().isActive,
        isVisible: doc.data().isVisible
      }));

      status.databases.production = {
        connected: true,
        productCount: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        visibleProducts: products.filter(p => p.isVisible).length,
        activeAndVisible: products.filter(p => p.isActive && p.isVisible).length,
        products: products
      };
    } else {
      status.databases.production = {
        connected: false,
        error: 'Database not available'
      };
    }
  } catch (error) {
    status.databases.production = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Check if using emulator (local only)
  if (process.env.NODE_ENV === 'development') {
    status.databases.emulator = {
      note: 'Emulator status only available in local development',
      usingEmulator: process.env.USE_FIREBASE_EMULATOR === 'true'
    };
  }

  const productionDb = status.databases.production;
  const hasProducts = productionDb.connected && productionDb.productCount > 0;
  const hasVisibleProducts = productionDb.connected && productionDb.activeAndVisible > 0;

  status.summary = {
    databaseConnected: productionDb.connected,
    hasProducts: hasProducts,
    hasVisibleProducts: hasVisibleProducts,
    pricingPageWillWork: hasVisibleProducts,
    recommendation: !hasProducts ? 
      'No products found. Run /api/populate-products to add sample data.' :
      !hasVisibleProducts ?
      'Products exist but none are active and visible. Check product settings in admin panel.' :
      'Database is properly configured with visible products!'
  };

  return NextResponse.json(status);
}
