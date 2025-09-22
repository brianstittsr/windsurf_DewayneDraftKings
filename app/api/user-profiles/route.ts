import { NextRequest, NextResponse } from 'next/server';

// GET /api/user-profiles - Get all user profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    
    // Mock data for now - replace with actual database queries
    const profiles = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        role: 'player',
        status: 'active',
        dateOfBirth: '1990-05-15',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+1-555-0124',
        medicalConditions: 'None',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1-555-0125',
        role: 'coach',
        status: 'active',
        dateOfBirth: '1985-08-22',
        emergencyContactName: 'Mike Johnson',
        emergencyContactPhone: '+1-555-0126',
        medicalConditions: 'Allergic to peanuts',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.wilson@example.com',
        phone: '+1-555-0127',
        role: 'player',
        status: 'inactive',
        dateOfBirth: '1992-12-03',
        emergencyContactName: 'Lisa Wilson',
        emergencyContactPhone: '+1-555-0128',
        medicalConditions: 'Asthma',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05')
      }
    ];

    // Apply filters
    let filteredProfiles = profiles;
    
    if (status && status !== 'all') {
      filteredProfiles = filteredProfiles.filter(profile => profile.status === status);
    }
    
    if (role && role !== 'all') {
      filteredProfiles = filteredProfiles.filter(profile => profile.role === role);
    }

    return NextResponse.json({
      success: true,
      profiles: filteredProfiles
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

// POST /api/user-profiles - Create new user profile
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Mock response - replace with actual database creation
    return NextResponse.json({
      success: true,
      message: 'User profile created successfully',
      profileId: 'mock-profile-id'
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create user profile' 
    }, { status: 500 });
  }
}

// PUT /api/user-profiles - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Mock response - replace with actual database update
    return NextResponse.json({
      success: true,
      message: 'User profile updated successfully'
    });
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
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile ID is required' 
      }, { status: 400 });
    }
    
    // Mock response - replace with actual database deletion
    return NextResponse.json({
      success: true,
      message: 'User profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete user profile' 
    }, { status: 500 });
  }
}
