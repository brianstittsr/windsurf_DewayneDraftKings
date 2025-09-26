import { NextRequest, NextResponse } from 'next/server';

// GET /api/user-profiles - Get all user profiles from Firebase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    
    // Dynamic import to avoid build-time issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      console.warn('Firebase not available, returning empty profiles');
      return NextResponse.json({
        success: true,
        profiles: [],
        message: 'Database connection unavailable'
      });
    }

    const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    
    let allProfiles: any[] = [];
    
    try {
      // Fetch players
      const playersRef = collection(db, 'players');
      const playersSnapshot = await getDocs(playersRef);
      const players = playersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          role: 'player',
          status: data.registrationStatus || 'pending',
          dateOfBirth: data.dateOfBirth?.toDate?.()?.toISOString()?.split('T')[0] || '',
          position: data.position || '',
          jerseySize: data.jerseySize || '',
          emergencyContactName: data.emergencyContact?.name || '',
          emergencyContactPhone: data.emergencyContact?.phone || '',
          emergencyContactRelation: data.emergencyContact?.relation || '',
          medicalConditions: data.medicalInfo?.conditions || 'None',
          medications: data.medicalInfo?.medications || '',
          allergies: data.medicalInfo?.allergies || '',
          selectedPlan: data.selectedPlan || null,
          paymentStatus: data.paymentStatus || 'pending',
          playerTag: data.playerTag || 'free-agent',
          preferences: data.preferences || {},
          agreements: data.agreements || {},
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          registrationDate: data.registrationDate?.toDate?.() || new Date()
        };
      });
      
      // Fetch coaches
      const coachesRef = collection(db, 'coaches');
      const coachesSnapshot = await getDocs(coachesRef);
      const coaches = coachesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          role: 'coach',
          status: data.isActive ? 'active' : 'inactive',
          dateOfBirth: data.dateOfBirth?.toDate?.()?.toISOString()?.split('T')[0] || '',
          experience: data.experience || '',
          coachingLevel: data.coachingLevel || '',
          certifications: data.certifications || [],
          specialties: data.specialties || [],
          emergencyContactName: data.emergencyContact?.name || '',
          emergencyContactPhone: data.emergencyContact?.phone || '',
          emergencyContactRelation: data.emergencyContact?.relation || '',
          medicalConditions: data.medicalInfo?.conditions || 'None',
          medications: data.medicalInfo?.medications || '',
          allergies: data.medicalInfo?.allergies || '',
          selectedPlan: data.selectedPlan || null,
          paymentStatus: data.paymentStatus || 'pending',
          preferences: data.preferences || {},
          agreements: data.agreements || {},
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          registrationDate: data.registrationDate?.toDate?.() || new Date()
        };
      });
      
      allProfiles = [...players, ...coaches];
      
    } catch (firebaseError) {
      console.error('Firebase query error:', firebaseError);
      // Return empty array if Firebase fails
      allProfiles = [];
    }

    // Apply filters
    let filteredProfiles = allProfiles;
    
    if (status && status !== 'all') {
      filteredProfiles = filteredProfiles.filter(profile => profile.status === status);
    }
    
    if (role && role !== 'all') {
      filteredProfiles = filteredProfiles.filter(profile => profile.role === role);
    }
    
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredProfiles = filteredProfiles.filter(profile => 
        profile.firstName.toLowerCase().includes(searchLower) ||
        profile.lastName.toLowerCase().includes(searchLower) ||
        profile.email.toLowerCase().includes(searchLower) ||
        profile.phone.toLowerCase().includes(searchLower)
      );
    }

    // Sort by registration date (newest first)
    filteredProfiles.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());

    return NextResponse.json({
      success: true,
      profiles: filteredProfiles,
      total: filteredProfiles.length,
      message: allProfiles.length === 0 ? 'No profiles found in database' : undefined
    });
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return NextResponse.json({ 
      success: false, 
      profiles: [],
      error: 'Failed to fetch user profiles' 
    }, { status: 500 });
  }
}

// PUT /api/user-profiles - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, role, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile ID is required' 
      }, { status: 400 });
    }
    
    // Dynamic import to avoid build-time issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database connection unavailable'
      }, { status: 503 });
    }

    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    
    try {
      const collectionName = role === 'coach' ? 'coaches' : 'players';
      const docRef = doc(db, collectionName, id);
      
      // Prepare update data with timestamp
      const updatePayload = {
        ...updateData,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, updatePayload);
      
      return NextResponse.json({
        success: true,
        message: 'User profile updated successfully'
      });
    } catch (firebaseError) {
      console.error('Firebase update error:', firebaseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update profile in database'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update user profile' 
    }, { status: 500 });
  }
}

// DELETE /api/user-profiles - Delete user profile
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const role = searchParams.get('role');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile ID is required' 
      }, { status: 400 });
    }
    
    if (!role) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile role is required' 
      }, { status: 400 });
    }
    
    // Dynamic import to avoid build-time issues
    const { db } = await import('../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database connection unavailable'
      }, { status: 503 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    
    try {
      const collectionName = role === 'coach' ? 'coaches' : 'players';
      const docRef = doc(db, collectionName, id);
      
      await deleteDoc(docRef);
      
      return NextResponse.json({
        success: true,
        message: 'User profile deleted successfully'
      });
    } catch (firebaseError) {
      console.error('Firebase delete error:', firebaseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete profile from database'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete user profile' 
    }, { status: 500 });
  }
}
