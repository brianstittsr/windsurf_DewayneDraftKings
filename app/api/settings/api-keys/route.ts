import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple encryption (in production, use proper encryption library)
function encryptKey(key: string): string {
  // In production, use crypto library with proper encryption
  return Buffer.from(key).toString('base64');
}

function decryptKey(encrypted: string): string {
  // In production, use crypto library with proper decryption
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

// GET /api/settings/api-keys - Get all API keys
export async function GET() {
  try {
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        keys: [] 
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const keysRef = collection(db, 'api_keys');
    const q = query(keysRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const keys = snapshot.docs.map(doc => {
      const data = doc.data();
      try {
        return {
          id: doc.id,
          name: data.name || '',
          service: data.service || 'other',
          keyValue: data.keyValue ? decryptKey(data.keyValue) : '', // Decrypt for display
          isActive: data.isActive !== undefined ? data.isActive : false,
          description: data.description || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastUsed: data.lastUsed?.toDate?.()?.toISOString() || null
        };
      } catch (decryptError) {
        console.error('Error decrypting key:', decryptError);
        return {
          id: doc.id,
          name: data.name || '',
          service: data.service || 'other',
          keyValue: '***DECRYPTION_ERROR***',
          isActive: false,
          description: data.description || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastUsed: null
        };
      }
    });

    return NextResponse.json({
      success: true,
      keys
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    // Return empty array instead of error to prevent UI crash
    return NextResponse.json({ 
      success: true, 
      keys: []
    });
  }
}

// POST /api/settings/api-keys - Create new API key
export async function POST(request: NextRequest) {
  let data;
  
  try {
    console.log('=== API Keys POST endpoint called ===');
    
    try {
      data = await request.json();
      console.log('✓ JSON parsed successfully');
      console.log('Received data:', { 
        name: data?.name, 
        service: data?.service, 
        hasKey: !!data?.keyValue,
        hasDescription: !!data?.description,
        isActive: data?.isActive
      });
    } catch (jsonError) {
      console.error('✗ JSON parse error:', jsonError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }
    
    // Validate required fields
    if (!data || !data.name || !data.service || !data.keyValue) {
      console.error('✗ Missing required fields:', {
        hasData: !!data,
        hasName: !!data?.name,
        hasService: !!data?.service,
        hasKeyValue: !!data?.keyValue
      });
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, service, keyValue' 
      }, { status: 400 });
    }
    console.log('✓ Required fields validated');
    
    // Try to encrypt the key
    let encryptedKey;
    try {
      encryptedKey = encryptKey(data.keyValue);
      console.log('✓ Key encrypted successfully');
    } catch (encryptError) {
      console.error('✗ Encryption error:', encryptError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to encrypt API key',
        details: encryptError instanceof Error ? encryptError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Try Firebase import
    console.log('Attempting Firebase import...');
    const firebaseModule = await import('../../../../lib/firebase').catch((err) => {
      console.error('✗ Firebase import error:', err);
      return { db: null };
    });
    
    const { db } = firebaseModule;
    
    if (!db) {
      console.error('✗ Database unavailable - Firebase not initialized');
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable - Firebase not configured',
        hint: 'Check Firebase environment variables in Vercel'
      }, { status: 503 });
    }
    console.log('✓ Firebase database available');

    // Import Firestore functions
    console.log('Importing Firestore functions...');
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    console.log('✓ Firestore functions imported');
    
    // Prepare data
    const keyData = {
      name: data.name,
      service: data.service,
      keyValue: encryptedKey,
      isActive: data.isActive !== undefined ? data.isActive : true,
      description: data.description || '',
      createdAt: Timestamp.now(),
      lastUsed: null
    };
    console.log('✓ Key data prepared');
    
    // Save to Firestore
    try {
      console.log('Creating document in api_keys collection...');
      const keysRef = collection(db, 'api_keys');
      const docRef = await addDoc(keysRef, keyData);
      console.log('✓ API key created with ID:', docRef.id);
      console.log('=== SUCCESS ===');
      
      return NextResponse.json({
        success: true,
        message: 'API key added successfully',
        keyId: docRef.id
      });
    } catch (firestoreError: any) {
      console.error('✗ Firestore error:', firestoreError);
      console.error('Error code:', firestoreError?.code);
      console.error('Error message:', firestoreError?.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save to database',
        code: firestoreError?.code || 'unknown',
        details: firestoreError?.message || 'Unknown Firestore error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('✗ Unexpected error:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create API key',
      details: error?.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}
