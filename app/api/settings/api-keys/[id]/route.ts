import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function encryptKey(key: string): string {
  return Buffer.from(key).toString('base64');
}

// PUT /api/settings/api-keys/[id] - Update API key
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const { db } = await import('../../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    
    const keyRef = doc(db, 'api_keys', params.id);
    await updateDoc(keyRef, {
      name: data.name,
      service: data.service,
      keyValue: encryptKey(data.keyValue),
      isActive: data.isActive,
      description: data.description || '',
      updatedAt: Timestamp.now()
    });
    
    return NextResponse.json({ success: true, message: 'API key updated successfully' });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json({ success: false, error: 'Failed to update API key' }, { status: 500 });
  }
}

// DELETE /api/settings/api-keys/[id] - Delete API key
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await import('../../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    
    const keyRef = doc(db, 'api_keys', params.id);
    await deleteDoc(keyRef);
    
    return NextResponse.json({ success: true, message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete API key' }, { status: 500 });
  }
}
