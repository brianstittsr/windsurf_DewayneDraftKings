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
  try {
    console.log('API Keys POST endpoint called');
    const data = await request.json();
    console.log('Received data:', { name: data.name, service: data.service, hasKey: !!data.keyValue });
    
    // Validate required fields
    if (!data.name || !data.service || !data.keyValue) {
      console.error('Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, service, keyValue' 
      }, { status: 400 });
    }
    
    const { db } = await import('../../../../lib/firebase').catch((err) => {
      console.error('Firebase import error:', err);
      return { db: null };
    });
    
    if (!db) {
      console.error('Database unavailable');
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    try {
      const encryptedKey = encryptKey(data.keyValue);
      console.log('Key encrypted successfully');
      
      const keyData = {
        name: data.name,
        service: data.service,
        keyValue: encryptedKey,
        isActive: data.isActive !== undefined ? data.isActive : true,
        description: data.description || '',
        createdAt: Timestamp.now(),
        lastUsed: null
      };
      
      console.log('Creating document in api_keys collection');
      const keysRef = collection(db, 'api_keys');
      const docRef = await addDoc(keysRef, keyData);
      console.log('API key created with ID:', docRef.id);
      
      return NextResponse.json({
        success: true,
        message: 'API key added successfully',
        keyId: docRef.id
      });
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save to database',
        details: firestoreError instanceof Error ? firestoreError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create API key',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
