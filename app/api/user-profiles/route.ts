import { NextRequest, NextResponse } from 'next/server';
import { COLLECTIONS } from '@/lib/firestore-schema';

export async function GET(request: NextRequest) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, getDocs, query, orderBy, limit, where } = await import('firebase/firestore');
    const { searchParams } = new URL(request.url);
    
    const limitParam = searchParams.get('limit');
    const statusParam = searchParams.get('status');
    const roleParam = searchParams.get('role');

    let profileQuery = query(
      collection(db, COLLECTIONS.USER_PROFILES),
      orderBy('createdAt', 'desc')
    );

    // Add filters
    if (statusParam && statusParam !== 'all') {
      profileQuery = query(profileQuery, where('status', '==', statusParam));
    }

    if (roleParam && roleParam !== 'all') {
      profileQuery = query(profileQuery, where('role', '==', roleParam));
    }

    // Add limit
    if (limitParam) {
      const limitNum = parseInt(limitParam);
      if (!isNaN(limitNum) && limitNum > 0) {
        profileQuery = query(profileQuery, limit(limitNum));
      }
    }

    const querySnapshot = await getDocs(profileQuery);
    const profiles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      profiles,
      count: profiles.length
    });

  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch profiles'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const body = await request.json();

    const profileData = {
      ...body,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.USER_PROFILES), profileData);

    return NextResponse.json({
      success: true,
      profileId: docRef.id
    });

  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create profile'
    }, { status: 500 });
  }
}
