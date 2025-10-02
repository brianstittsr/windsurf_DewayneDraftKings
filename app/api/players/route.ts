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
    
    // Mock response - replace with actual database creation
    return NextResponse.json({
      success: true,
      message: 'Player created successfully',
      playerId: 'mock-player-id'
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
    
    // Mock response - replace with actual database update
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
    
    // Mock response - replace with actual database deletion
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
