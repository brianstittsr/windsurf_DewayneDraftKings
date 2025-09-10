import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all coaches
export async function GET(request: NextRequest) {
  try {
    // Dynamic imports to prevent build-time execution
    const services = await import('@/lib/firebase').catch(() => null);
    if (!services?.db) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const { collection, getDocs, query, orderBy, where } = await import('firebase/firestore');
    const { COLLECTIONS } = await import('@/lib/firestore-schema');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    let coachesQuery = query(
      collection(services.db, COLLECTIONS.COACHES),
      orderBy('createdAt', 'desc')
    );

    // Filter by status if provided
    if (status) {
      coachesQuery = query(
        collection(services.db, COLLECTIONS.COACHES),
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
    // Dynamic imports to prevent build-time execution
    const services = await import('@/lib/firebase').catch(() => null);
    if (!services?.db) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const { doc, updateDoc } = await import('firebase/firestore');
    const { COLLECTIONS } = await import('@/lib/firestore-schema');

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

    await updateDoc(doc(services.db, COLLECTIONS.COACHES, coachId), updateData);

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
    // Dynamic imports to prevent build-time execution
    const services = await import('@/lib/firebase').catch(() => null);
    if (!services?.db) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    const { COLLECTIONS } = await import('@/lib/firestore-schema');

    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('id');

    if (!coachId) {
      return NextResponse.json(
        { success: false, error: 'Coach ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(services.db, COLLECTIONS.COACHES, coachId));

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

// POST - Create new coach
export async function POST(request: NextRequest) {
  try {
    // Dynamic imports to prevent build-time execution
    const services = await import('@/lib/firebase').catch(() => null);
    if (!services?.db) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const { doc, addDoc, updateDoc, collection, Timestamp } = await import('firebase/firestore');
    const { COLLECTIONS } = await import('@/lib/firestore-schema');
    const QRCode = await import('qrcode');

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      experience,
      certifications,
      specialties,
      coachingLevel,
      emergencyContactName,
      emergencyContactPhone,
      maxTeams
    } = body;

    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !experience) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const coachData = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: Timestamp.fromDate(new Date(dateOfBirth)),
      registrationDate: Timestamp.now(),
      registrationStatus: 'confirmed',
      isActive: true,
      experience,
      certifications: certifications || [],
      specialties: specialties || [],
      coachingLevel: coachingLevel || 'assistant',
      assignedTeams: [],
      maxTeams: maxTeams || 2,
      emergencyContact: emergencyContactName && emergencyContactPhone ? {
        name: emergencyContactName,
        phone: emergencyContactPhone
      } : undefined,
      stats: {
        seasonsCoached: 0,
        teamsCoached: 0,
        totalWins: 0,
        totalLosses: 0,
        championshipsWon: 0
      },
      qrCode: '',
      qrCodeUrl: '',
      funnelStatus: {
        currentStep: 0,
        lastInteraction: Timestamp.now(),
        isOptedOut: false
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(services.db, COLLECTIONS.COACHES), coachData);
    
    // Generate QR code
    const qrCodeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/coach/${docRef.id}`;
    const qrCodeData = await QRCode.toDataURL(qrCodeUrl);
    
    // Update coach with QR code
    await updateDoc(doc(services.db, COLLECTIONS.COACHES, docRef.id), {
      qrCode: qrCodeData,
      qrCodeUrl: qrCodeUrl
    });

    return NextResponse.json({
      success: true,
      coach: {
        id: docRef.id,
        ...coachData,
        qrCode: qrCodeData,
        qrCodeUrl: qrCodeUrl
      },
      message: 'Coach created successfully'
    });
  } catch (error) {
    console.error('Error creating coach:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create coach' },
      { status: 500 }
    );
  }
}
