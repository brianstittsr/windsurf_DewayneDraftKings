import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';

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

    // Create profile object with Firestore Timestamps
    const profile = {
      id: playerId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: dateOfBirth ? Timestamp.fromDate(new Date(dateOfBirth)) : null,
      jerseySize,
      position: position || 'flex',
      experience: experience || '',
      
      // Registration Information
      registrationDate: Timestamp.now(),
      registrationStatus: 'pending' as const,
      paymentStatus: 'pending' as const,
      
      // Player Classification
      playerTag: selectedPlan?.category === 'coach' ? 'client' as const : 'free-agent' as const,
      isDrafted: false,
      
      // Emergency Contact
      emergencyContact: emergencyContactName ? {
        name: emergencyContactName,
        phone: emergencyContactPhone,
        relation: emergencyContactRelation || ''
      } : undefined,
      
      // Medical Information
      medicalInfo: (medicalConditions || medications || allergies) ? {
        conditions: medicalConditions || '',
        medications: medications || '',
        allergies: allergies || '',
        lastUpdated: Timestamp.now()
      } : undefined,
      
      // Preferences
      preferences: {
        communication: preferredCommunication || 'email',
        marketingConsent: marketingConsent || false
      },
      
      // Agreements
      agreements: {
        waiverAccepted,
        termsAccepted,
        acceptedAt: Timestamp.now()
      },
      
      // Plan and Registration Info
      selectedPlan,
      registrationSource: registrationSource || 'registration_wizard',
      
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Save to Firebase
    try {
      const collectionName = selectedPlan?.category === 'coach' ? 'coaches' : 'players';
      const docRef = doc(db, collectionName, playerId);
      await setDoc(docRef, profile);
      
      console.log(`${collectionName.slice(0, -1)} profile saved to Firebase:`, playerId);
      
      // Complete registration with QR codes, PDF, and email
      try {
        const { completeUserRegistration } = await import('../../../../lib/registration-completion-service');
        
        const completionResult = await completeUserRegistration({
          playerId,
          firstName,
          lastName,
          email,
          phone,
          role: selectedPlan?.category === 'coach' ? 'coach' : 'player',
          selectedPlan,
          registrationData: {
            dateOfBirth,
            position,
            jerseySize,
            emergencyContactName,
            emergencyContactPhone,
            emergencyContactRelation,
            medicalConditions,
            medications,
            allergies
          }
        });
        
        if (completionResult.success) {
          console.log('Registration completion successful:', completionResult);
        } else {
          console.error('Registration completion failed:', completionResult.error);
          // Don't fail the registration if completion fails, just log it
        }
      } catch (completionError) {
        console.error('Registration completion service error:', completionError);
        // Continue with registration success even if completion fails
      }
      
    } catch (firebaseError) {
      console.error('Firebase save error:', firebaseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to save profile to database'
      }, { status: 500 });
    }

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
