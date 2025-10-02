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
    const data = await request.json();
    
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    const keyData = {
      name: data.name,
      service: data.service,
      keyValue: encryptKey(data.keyValue), // Encrypt before storing
      isActive: data.isActive !== undefined ? data.isActive : true,
      description: data.description || '',
      createdAt: Timestamp.now(),
      lastUsed: null
    };
    
    const keysRef = collection(db, 'api_keys');
    const docRef = await addDoc(keysRef, keyData);
    
    return NextResponse.json({
      success: true,
      message: 'API key added successfully',
      keyId: docRef.id
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create API key' 
    }, { status: 500 });
  }
}
