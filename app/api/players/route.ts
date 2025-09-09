import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { COLLECTIONS, Player } from '@/lib/firestore-schema';
import QRCode from 'qrcode';

// Check Firebase connection
if (!db) {
  console.error('Firebase database not initialized');
}

// GET - Fetch all players
export async function GET(request: NextRequest) {
  try {
    // Check Firebase connection first
    if (!db) {
      console.error('Firebase database not available in GET');
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    let playersQuery = query(
      collection(db, COLLECTIONS.PLAYERS),
      orderBy('createdAt', 'desc')
    );

    // Filter by status if provided
    if (status) {
      playersQuery = query(
        collection(db, COLLECTIONS.PLAYERS),
        where('registrationStatus', '==', status),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(playersQuery);
    const players = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply limit if specified
    const limitedPlayers = limit ? players.slice(0, parseInt(limit)) : players;

    return NextResponse.json({
      success: true,
      players: limitedPlayers,
      total: players.length
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

// PUT - Update player
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, ...updateData } = body;

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID is required' },
        { status: 400 }
      );
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    await updateDoc(doc(db, COLLECTIONS.PLAYERS, playerId), updateData);

    return NextResponse.json({
      success: true,
      message: 'Player updated successfully'
    });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update player' },
      { status: 500 }
    );
  }
}

// DELETE - Delete player
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('id');

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, COLLECTIONS.PLAYERS, playerId));

    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete player' },
      { status: 500 }
    );
  }
}

// POST - Create new player
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/players - Starting player creation');
    
    // Check Firebase connection first
    if (!db) {
      console.error('Firebase database not available');
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      position,
      playerTag,
      emergencyContactName,
      emergencyContactPhone,
      medicalConditions,
      teamId
    } = body;

    console.log('Extracted fields:', { firstName, lastName, email, phone, dateOfBirth });

    if (!firstName || !lastName || !email || !phone || !dateOfBirth) {
      console.log('Missing required fields validation failed');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Creating player data object...');
    const playerData: Omit<Player, 'id'> = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: Timestamp.fromDate(new Date(dateOfBirth)),
      registrationDate: Timestamp.now(),
      registrationStatus: 'confirmed',
      paymentStatus: 'pending',
      playerTag: playerTag || 'free-agent',
      position: position || 'flex',
      teamId: teamId || null,
      isDrafted: false,
      emergencyContact: emergencyContactName && emergencyContactPhone ? {
        name: emergencyContactName,
        phone: emergencyContactPhone
      } : undefined,
      medicalInfo: medicalConditions ? {
        conditions: medicalConditions,
        lastUpdated: Timestamp.now()
      } : undefined,
      stats: {
        gamesPlayed: 0,
        touchdowns: 0,
        yards: 0,
        tackles: 0,
        interceptions: 0,
        attendance: 0
      },
      metrics: {
        currentWeight: 0,
        weighIns: [],
        workouts: [],
        totalWeightLoss: 0
      },
      referrals: [],
      referralRewards: 0,
      referralLevel: 0,
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

    console.log('Adding player to Firestore...');
    console.log('Firebase db object:', !!db);
    console.log('COLLECTIONS.PLAYERS:', COLLECTIONS.PLAYERS);
    console.log('Player data keys:', Object.keys(playerData));
    
    const docRef = await addDoc(collection(db, COLLECTIONS.PLAYERS), playerData);
    console.log('Player added with ID:', docRef.id);
    
    // Generate QR code
    console.log('Generating QR code...');
    const qrCodeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/player/${docRef.id}`;
    const qrCodeData = await QRCode.toDataURL(qrCodeUrl);
    console.log('QR code generated successfully');
    
    // Update player with QR code
    console.log('Updating player with QR code...');
    await updateDoc(doc(db, COLLECTIONS.PLAYERS, docRef.id), {
      qrCode: qrCodeData,
      qrCodeUrl: qrCodeUrl
    });
    console.log('Player updated with QR code successfully');

    return NextResponse.json({
      success: true,
      player: {
        id: docRef.id,
        ...playerData,
        qrCode: qrCodeData,
        qrCodeUrl: qrCodeUrl
      },
      message: 'Player created successfully'
    });
  } catch (error) {
    console.error('Error creating player:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: `Failed to create player: ${error.message}` },
      { status: 500 }
    );
  }
}
