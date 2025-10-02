import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/commissioners - Get all commissioners
export async function GET() {
  try {
    console.log('=== Commissioners GET endpoint called ===');
    
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      console.warn('⚠ Database unavailable');
      return NextResponse.json({ 
        success: true, 
        commissioners: [] 
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const commissRef = collection(db, 'commissioners');
    const q = query(commissRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const commissioners = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        ratePerPlayer: data.ratePerPlayer || 1.00,
        stripeAccountId: data.stripeAccountId || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        totalEarned: data.totalEarned || 0,
        totalPlayers: data.totalPlayers || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
      };
    });

    console.log('✓ Commissioners fetched:', commissioners.length);

    return NextResponse.json({
      success: true,
      commissioners
    });
  } catch (error) {
    console.error('✗ Error fetching commissioners:', error);
    return NextResponse.json({ 
      success: true, 
      commissioners: []
    });
  }
}

// POST /api/commissioners - Create new commissioner
export async function POST(request: NextRequest) {
  let data;
  
  try {
    console.log('=== Commissioners POST endpoint called ===');
    
    try {
      data = await request.json();
      console.log('✓ JSON parsed successfully');
    } catch (jsonError) {
      console.error('✗ JSON parse error:', jsonError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }
    
    // Validate required fields
    if (!data || !data.name || !data.email || !data.phone) {
      console.error('✗ Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, email, phone' 
      }, { status: 400 });
    }
    console.log('✓ Required fields validated');
    
    const { db } = await import('../../../lib/firebase').catch((err) => {
      console.error('✗ Firebase import error:', err);
      return { db: null };
    });
    
    if (!db) {
      console.error('✗ Database unavailable');
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }
    console.log('✓ Firebase database available');

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    const commissionerData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      ratePerPlayer: data.ratePerPlayer || 1.00,
      stripeAccountId: data.stripeAccountId || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      totalEarned: 0,
      totalPlayers: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    try {
      console.log('Creating commissioner document...');
      const commissRef = collection(db, 'commissioners');
      const docRef = await addDoc(commissRef, commissionerData);
      console.log('✓ Commissioner created with ID:', docRef.id);
      
      return NextResponse.json({
        success: true,
        message: 'Commissioner created successfully',
        commissionerId: docRef.id
      });
    } catch (firestoreError: any) {
      console.error('✗ Firestore error:', firestoreError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save to database',
        details: firestoreError?.message || 'Unknown error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('✗ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create commissioner',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/commissioners - Delete commissioner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Commissioner ID is required' 
      }, { status: 400 });
    }
    
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    
    const commissRef = doc(db, 'commissioners', id);
    await deleteDoc(commissRef);
    
    return NextResponse.json({
      success: true,
      message: 'Commissioner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting commissioner:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete commissioner' 
    }, { status: 500 });
  }
}
