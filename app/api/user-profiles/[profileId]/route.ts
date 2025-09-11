import { NextRequest, NextResponse } from 'next/server';
import { COLLECTIONS } from '@/lib/firestore-schema';

export async function GET(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, getDoc } = await import('firebase/firestore');
    const { profileId } = params;

    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, profileId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileData = {
      id: profileSnap.id,
      ...profileSnap.data()
    };

    return NextResponse.json({
      success: true,
      profile: profileData
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch profile'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const { profileId } = params;
    const body = await request.json();

    const updateData = {
      ...body,
      updatedAt: serverTimestamp()
    };

    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, profileId);
    await updateDoc(profileRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update profile'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    const { profileId } = params;

    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, profileId);
    await deleteDoc(profileRef);

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user profile:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete profile'
    }, { status: 500 });
  }
}
