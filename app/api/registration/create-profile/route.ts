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
    
    // Create comprehensive profile object
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
        qrCodeUrl: ''
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
        waiverAccepted: waiverAccepted || false,
        termsAccepted: termsAccepted || false,
        acceptedAt: now
      },
      
      // Plan and Registration Info
      selectedPlan,
      registrationSource: registrationSource || 'registration_wizard',
      
      // PDF Storage (will be updated after generation)
      registrationPdfUrl: '',
      
      // Timestamps
      createdAt: now,
      updatedAt: now
    };

    // Save to Firebase
    try {
      console.log('Attempting to save profile to Firebase...');
      
      // Dynamic import to avoid build-time issues
      const firebaseModule = await import('../../../../lib/firebase').catch((importError) => {
        console.error('Firebase import error:', importError);
        return { db: null };
      });
      
      const { db } = firebaseModule;
      
      if (db) {
        const { doc, setDoc, Timestamp } = await import('firebase/firestore');
        
        // Convert Date objects to Firestore Timestamps
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
          })
        };
        
        const collectionName = selectedPlan?.category === 'coach' ? 'coaches' : 'players';
        const docRef = doc(db, collectionName, userId);
        await setDoc(docRef, firebaseProfile);
        
        console.log(`Profile saved to Firebase: ${collectionName}/${userId}`);
      } else {
        console.warn('Firebase not available - profile not saved to database');
      }
    } catch (firebaseError) {
      console.error('Firebase save error:', firebaseError);
      // Don't fail the registration if Firebase fails
    }

    // Store references for PDF update
    let savedDb = null;
    let savedCollectionName = '';
    try {
      const firebaseModule = await import('../../../../lib/firebase').catch(() => ({ db: null }));
      savedDb = firebaseModule.db;
      savedCollectionName = selectedPlan?.category === 'coach' ? 'coaches' : 'players';
    } catch (error) {
      console.log('Firebase not available for PDF update');
    }

    // Generate PDF and send welcome email
    try {
      console.log('Generating registration PDF...');
      
      // Dynamic import to avoid build issues
      const { PDFService } = await import('../../../../lib/pdf-service').catch(() => ({ PDFService: null }));
      
      let pdfData = null;
      let pdfFileName = null;
      
      if (PDFService) {
        try {
          pdfData = PDFService.generateRegistrationPDF({
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            role: userRole,
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
            registrationDate: now,
            playerId: userId
          });
          
          pdfFileName = PDFService.generateFileName({
            firstName,
            lastName,
            registrationDate: now,
            playerId: userId
          } as any);
          
          console.log('PDF generated successfully');
          
          // Update Firebase profile with PDF data
          if (savedDb) {
            try {
              const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
              const docRef = doc(savedDb, savedCollectionName, userId);
              await updateDoc(docRef, {
                registrationPdfUrl: pdfData,
                updatedAt: Timestamp.now()
              });
              console.log('Profile updated with PDF data');
            } catch (updateError) {
              console.error('Error updating profile with PDF:', updateError);
            }
          }
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError);
          // Continue without PDF if generation fails
        }
      }
      
      console.log('Attempting to send welcome email...');
      
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Welcome to All Pro Sports NC - Registration Confirmation',
          ...(pdfData && pdfFileName && {
            attachments: [{
              filename: pdfFileName,
              content: pdfData.split(',')[1], // Remove data:application/pdf;base64, prefix
              contentType: 'application/pdf'
            }]
          }),
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
                <h1>🏈 Welcome to All Pro Sports NC!</h1>
              </div>
              
              <div style="padding: 20px; background-color: #f8f9fa;">
                <h2>Registration Confirmed</h2>
                <p>Hi ${firstName},</p>
                <p>Thank you for registering with All Pro Sports NC! Your registration has been successfully submitted.</p>
                
                <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>Registration Details:</h3>
                  <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Phone:</strong> ${phone}</p>
                  <p><strong>Player ID:</strong> ${userId}</p>
                  <p><strong>Plan:</strong> ${selectedPlan?.title || 'Registration Plan'}</p>
                  <p><strong>Category:</strong> ${selectedPlan?.category || 'player'}</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>Next Steps:</h3>
                  <ol>
                    <li>Complete your payment to finalize registration</li>
                    <li>Check your email for payment confirmation</li>
                    <li>Save your Player ID for future reference</li>
                    ${pdfData ? '<li><strong>Review your registration form (attached as PDF)</strong></li>' : ''}
                    <li>Contact us if you have any questions</li>
                  </ol>
                </div>
                
                ${pdfData ? `
                <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>📄 Registration Form Attached</h3>
                  <p>Your complete registration form has been attached to this email as a PDF. Please:</p>
                  <ul>
                    <li>Save the PDF for your records</li>
                    <li>Review all information for accuracy</li>
                    <li>Bring a copy to your first session if required</li>
                  </ul>
                </div>
                ` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <p><strong>Questions?</strong></p>
                  <p>Contact us at <a href="mailto:info@allprosportsnc.com">info@allprosportsnc.com</a></p>
                  <p>Visit us at All Pro Sports Complex</p>
                </div>
              </div>
              
              <div style="background-color: #343a40; color: white; padding: 20px; text-align: center;">
                <p>&copy; 2024 All Pro Sports NC. All rights reserved.</p>
              </div>
            </div>
          `
        }),
      });

      if (emailResponse.ok) {
        console.log('Welcome email sent successfully');
      } else {
        console.error('Failed to send welcome email:', await emailResponse.text());
      }
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail the registration if email fails
    }

    console.log('Profile creation completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      playerId: userId, // Use playerId for compatibility with checkout page
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
