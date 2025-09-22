import { NextRequest, NextResponse } from 'next/server';

// POST /api/registration/create-profile - Create player/coach profile from registration wizard
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Extract form data
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      jerseySize,
      position,
      experience,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      medicalConditions,
      medications,
      allergies,
      preferredCommunication,
      marketingConsent,
      waiverAccepted,
      termsAccepted,
      selectedPlan,
      registrationSource
    } = data;

    // Basic validation
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({
        success: false,
        error: 'Required fields missing: firstName, lastName, email, phone'
      }, { status: 400 });
    }

    if (!waiverAccepted || !termsAccepted) {
      return NextResponse.json({
        success: false,
        error: 'Waiver and terms must be accepted'
      }, { status: 400 });
    }

    // Generate a unique player ID
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create profile object
    const profile = {
      id: playerId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      jerseySize,
      position: position || 'flex',
      experience: experience || '',
      emergencyContact: {
        name: emergencyContactName,
        phone: emergencyContactPhone,
        relation: emergencyContactRelation || ''
      },
      medicalInfo: {
        conditions: medicalConditions || '',
        medications: medications || '',
        allergies: allergies || ''
      },
      preferences: {
        communication: preferredCommunication || 'email',
        marketingConsent: marketingConsent || false
      },
      agreements: {
        waiverAccepted,
        termsAccepted,
        acceptedAt: new Date().toISOString()
      },
      selectedPlan,
      registrationSource: registrationSource || 'registration_wizard',
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Save to Firebase/database
    // For now, we'll just log it and return success
    console.log('Profile created:', profile);

    // In a real implementation, you would:
    // 1. Save profile to Firebase
    // 2. Generate QR code
    // 3. Send confirmation email
    // 4. Create SMS opt-in record if phone provided

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      playerId,
      profile: {
        id: playerId,
        firstName,
        lastName,
        email,
        selectedPlan
      }
    });

  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create profile'
    }, { status: 500 });
  }
}
