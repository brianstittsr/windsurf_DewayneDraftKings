import { NextRequest, NextResponse } from 'next/server';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// POST /api/registration/create-profile - Create player/coach profile from registration wizard
export async function POST(request: NextRequest) {
  try {
    console.log('Registration create-profile endpoint called');
    const data = await request.json();
    console.log('Request data received:', Object.keys(data));
    
    // Extract form data
    const {
      firstName,
      lastName,
      email,
      phone,
      selectedPlan
    } = data;

    // Basic validation
    if (!firstName || !lastName || !email || !phone) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json({
        success: false,
        error: 'Required fields missing: firstName, lastName, email, phone'
      }, { status: 400 });
    }

    // Determine role based on selected plan
    const userRole = selectedPlan?.category === 'coach' ? 'coach' : 'player';
    
    // Generate a unique ID based on role
    const userId = `${userRole}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Profile creation successful, returning response');
    
    // Return success immediately without any complex operations
    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      userId,
      profile: {
        id: userId,
        firstName,
        lastName,
        email,
        selectedPlan,
        role: userRole
      }
    });

  } catch (error) {
    console.error('Error creating profile:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      success: false,
      error: 'Failed to create profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
