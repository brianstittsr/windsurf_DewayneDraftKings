import { NextRequest, NextResponse } from 'next/server';

// GET /api/players - Get all players with full registration data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        players: [] 
      });
    }

    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    
    const playersRef = collection(db, 'players');
    const q = query(playersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const players = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // Personal Information (from registration)
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        
        // Player Specific
        position: data.position || '',
        jerseySize: data.jerseySize || '',
        jerseyNumber: data.jerseyNumber || '',
        
        // Emergency Contact (from registration)
        emergencyContactName: data.emergencyContact?.name || '',
        emergencyContactRelationship: data.emergencyContact?.relationship || '',
        emergencyContactPhone: data.emergencyContact?.phone || '',
        
        // Medical Info (from registration)
        allergies: data.medicalInfo?.allergies || '',
        medications: data.medicalInfo?.medications || '',
        medicalConditions: data.medicalInfo?.conditions || '',
        
        // Current Assignment
        currentTeamId: data.currentTeamId || null,
        currentTeamName: data.currentTeamName || null,
        currentCoachId: data.currentCoachId || null,
        currentCoachName: data.currentCoachName || null,
        
        // Registration Info
        registrationDate: data.createdAt?.toDate?.()?.toISOString() || null,
        paymentStatus: data.paymentStatus || 'pending',
        planType: data.selectedPlan?.title || 'N/A',
        
        // Additional fields
        status: data.status || 'active',
        role: data.role || 'player'
      };
    });

    return NextResponse.json({
      success: true,
      players
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ 
      success: false, 
      players: [],
      error: 'Failed to fetch players' 
    }, { status: 500 });
  }
}

// POST /api/players - Create new player
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: firstName, lastName, email'
      }, { status: 400 });
    }

    const playerData = {
      // Personal Information
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || '',
      dateOfBirth: data.dateOfBirth || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zipCode: data.zipCode || '',
      
      // Player Specific
      position: data.position || '',
      jerseySize: data.jerseySize || '',
      jerseyNumber: data.jerseyNumber || '',
      
      // Emergency Contact
      emergencyContact: {
        name: data.emergencyContactName || '',
        relationship: data.emergencyContactRelationship || '',
        phone: data.emergencyContactPhone || ''
      },
      
      // Medical Info
      medicalInfo: {
        allergies: data.allergies || '',
        medications: data.medications || '',
        conditions: data.medicalConditions || ''
      },
      
      // Team Assignment
      currentTeamId: data.currentTeamId || null,
      currentTeamName: data.currentTeamName || null,
      currentCoachId: data.currentCoachId || null,
      currentCoachName: data.currentCoachName || null,
      
      // Registration Info
      paymentStatus: data.paymentStatus || 'pending',
      selectedPlan: data.selectedPlan || null,
      
      // Player Stats (initialized)
      stats: {
        games: 0,
        touchdowns: 0,
        yards: 0,
        tackles: 0,
        interceptions: 0,
        attendance: 0
      },
      
      // Metadata
      role: 'player',
      status: data.status || 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const playersRef = collection(db, 'players');
    const docRef = await addDoc(playersRef, playerData);
    
    return NextResponse.json({
      success: true,
      message: 'Player created successfully',
      playerId: docRef.id
    });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create player' 
    }, { status: 500 });
  }
}

// PUT /api/players - Update player
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({
        success: false,
        error: 'Player ID is required'
      }, { status: 400 });
    }

    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    
    const playerRef = doc(db, 'players', data.id);
    
    const updateData: any = {
      updatedAt: Timestamp.now()
    };

    // Update only provided fields
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.zipCode !== undefined) updateData.zipCode = data.zipCode;
    
    // Player specific
    if (data.position !== undefined) updateData.position = data.position;
    if (data.jerseySize !== undefined) updateData.jerseySize = data.jerseySize;
    if (data.jerseyNumber !== undefined) updateData.jerseyNumber = data.jerseyNumber;
    
    // Emergency Contact
    if (data.emergencyContactName !== undefined || 
        data.emergencyContactRelationship !== undefined || 
        data.emergencyContactPhone !== undefined) {
      updateData['emergencyContact'] = {
        name: data.emergencyContactName || '',
        relationship: data.emergencyContactRelationship || '',
        phone: data.emergencyContactPhone || ''
      };
    }
    
    // Medical Info
    if (data.allergies !== undefined || 
        data.medications !== undefined || 
        data.medicalConditions !== undefined) {
      updateData['medicalInfo'] = {
        allergies: data.allergies || '',
        medications: data.medications || '',
        conditions: data.medicalConditions || ''
      };
    }
    
    // Team Assignment
    if (data.currentTeamId !== undefined) updateData.currentTeamId = data.currentTeamId;
    if (data.currentTeamName !== undefined) updateData.currentTeamName = data.currentTeamName;
    if (data.currentCoachId !== undefined) updateData.currentCoachId = data.currentCoachId;
    if (data.currentCoachName !== undefined) updateData.currentCoachName = data.currentCoachName;
    
    // Status
    if (data.status !== undefined) updateData.status = data.status;
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
    
    await updateDoc(playerRef, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Player updated successfully'
    });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update player' 
    }, { status: 500 });
  }
}

// DELETE /api/players - Delete player
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Player ID is required' 
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
    
    const playerRef = doc(db, 'players', id);
    await deleteDoc(playerRef);
    
    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete player' 
    }, { status: 500 });
  }
}
