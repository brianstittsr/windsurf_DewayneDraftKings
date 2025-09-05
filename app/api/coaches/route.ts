import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/firestore-schema';

// GET - Fetch all coaches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    let coachesQuery = query(
      collection(db, COLLECTIONS.COACHES),
      orderBy('createdAt', 'desc')
    );

    // Filter by status if provided
    if (status) {
      coachesQuery = query(
        collection(db, COLLECTIONS.COACHES),
        where('registrationStatus', '==', status),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(coachesQuery);
    const coaches = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply limit if specified
    const limitedCoaches = limit ? coaches.slice(0, parseInt(limit)) : coaches;

    return NextResponse.json({
      success: true,
      coaches: limitedCoaches,
      total: coaches.length
    });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
}

// PUT - Update coach
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { coachId, ...updateData } = body;

    if (!coachId) {
      return NextResponse.json(
        { success: false, error: 'Coach ID is required' },
        { status: 400 }
      );
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    await updateDoc(doc(db, COLLECTIONS.COACHES, coachId), updateData);

    return NextResponse.json({
      success: true,
      message: 'Coach updated successfully'
    });
  } catch (error) {
    console.error('Error updating coach:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coach' },
      { status: 500 }
    );
  }
}

// DELETE - Delete coach
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('id');

    if (!coachId) {
      return NextResponse.json(
        { success: false, error: 'Coach ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, COLLECTIONS.COACHES, coachId));

    return NextResponse.json({
      success: true,
      message: 'Coach deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coach:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coach' },
      { status: 500 }
    );
  }
}
