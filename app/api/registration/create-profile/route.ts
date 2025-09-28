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

    // Determine role based on selected plan
    const userRole = selectedPlan?.category === 'coach' ? 'coach' : 'player';
    
    // Generate a unique ID based on role
    const userId = `${userRole}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create profile object with standard Date objects (no Firebase dependency)
    const now = new Date();
    const profile = {
      id: userId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      jerseySize,
      position: position || 'flex',
      experience: experience || '',
      
      // Role Assignment
      role: userRole,
      
      // Registration Information
      registrationDate: now,
      registrationStatus: 'pending' as const,
      paymentStatus: 'pending' as const,
      
      // Player Classification (for players only)
      ...(userRole === 'player' && {
        playerTag: 'free-agent' as const,
        isDrafted: false,
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
        referralLevel: 1,
        qrCode: '',
        qrCodeUrl: '',
        funnelStatus: {
          currentStep: 0,
          lastInteraction: now,
          isOptedOut: false
        }
      }),
      
      // Coach-specific fields
      ...(userRole === 'coach' && {
        isActive: true,
        coachingLevel: selectedPlan?.planType === 'coach_head' ? 'head' as const : 'assistant' as const,
        certifications: [],
        specialties: [],
        assignedTeams: [],
        qrCode: '',
        qrCodeUrl: ''
      }),
      
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
        lastUpdated: now
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
        acceptedAt: now
      },
      
      // Plan and Registration Info
      selectedPlan,
      registrationSource: registrationSource || 'registration_wizard',
      
      // Timestamps
      createdAt: now,
      updatedAt: now
    };

    // Save to Firebase
    try {
      console.log('Attempting to import Firebase...');
      console.log('Environment check - PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not set');
      
      // Dynamic import to avoid build-time issues
      const firebaseModule = await import('../../../../lib/firebase').catch((importError) => {
        console.error('Firebase import error:', importError);
        return { db: null };
      });
      
      const { db } = firebaseModule;
      
      if (!db) {
        console.error('Firebase database not available');
        // For now, let's continue without Firebase to test the flow
        console.log('Continuing without Firebase for testing...');
        
        return NextResponse.json({
          success: true,
          message: 'Profile created successfully (without database)',
          userId,
          profile: {
            id: userId,
            firstName,
            lastName,
            email,
            selectedPlan
          },
          warning: 'Database unavailable - profile not persisted'
        });
      }
      
      console.log('Firebase imported successfully');

      const { doc, setDoc, Timestamp } = await import('firebase/firestore');
      
      // Convert Date objects to Firestore Timestamps for Firebase storage
      const firebaseProfile = {
        ...profile,
        dateOfBirth: profile.dateOfBirth ? Timestamp.fromDate(profile.dateOfBirth) : null,
        registrationDate: Timestamp.fromDate(profile.registrationDate),
        createdAt: Timestamp.fromDate(profile.createdAt),
        updatedAt: Timestamp.fromDate(profile.updatedAt),
        ...(profile.medicalInfo && {
          medicalInfo: {
            ...profile.medicalInfo,
            lastUpdated: Timestamp.fromDate(profile.medicalInfo.lastUpdated)
          }
        }),
        ...(profile.agreements && {
          agreements: {
            ...profile.agreements,
            acceptedAt: Timestamp.fromDate(profile.agreements.acceptedAt)
          }
        }),
        ...(userRole === 'player' && profile.funnelStatus && {
          funnelStatus: {
            ...profile.funnelStatus,
            lastInteraction: Timestamp.fromDate(profile.funnelStatus.lastInteraction)
          }
        })
      };
      
      const collectionName = selectedPlan?.category === 'coach' ? 'coaches' : 'players';
      const docRef = doc(db, collectionName, userId);
      await setDoc(docRef, firebaseProfile);
      
      console.log(`${collectionName.slice(0, -1)} profile saved to Firebase:`, userId);
      
      // Complete registration with QR codes, PDF, and email
      try {
        const { completeUserRegistration } = await import('../../../../lib/registration-completion-service');
        
        const completionResult = await completeUserRegistration({
          playerId: userId,
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
      userId,
      profile: {
        id: userId,
        firstName,
        lastName,
        email,
        selectedPlan
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
