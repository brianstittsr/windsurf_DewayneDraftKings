import { NextRequest, NextResponse } from 'next/server';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// POST /api/registration/complete-free - Complete free registration with REGISTER coupon
export async function POST(request: NextRequest) {
  try {
    console.log('Free registration endpoint called');
    const data = await request.json();
    const { customerData, planData, couponCode } = data;
    
    // Verify REGISTER coupon code
    if (couponCode !== 'REGISTER') {
      return NextResponse.json({
        success: false,
        error: 'Invalid coupon code for free registration'
      }, { status: 400 });
    }

    // Validate required customer data
    if (!customerData?.firstName || !customerData?.lastName || !customerData?.email || !customerData?.phone) {
      return NextResponse.json({
        success: false,
        error: 'Required customer information missing'
      }, { status: 400 });
    }

    // Determine role based on plan
    const userRole = planData?.category === 'coach' ? 'coach' : 'player';
    
    // Generate unique ID
    const userId = `${userRole}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create profile object
    const now = new Date();
    const profile = {
      id: userId,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      
      // Role Assignment
      role: userRole,
      
      // Registration Information
      registrationDate: now,
      registrationStatus: 'completed' as const, // Mark as completed since no payment needed
      paymentStatus: 'free_registration' as const, // Special status for free registrations
      
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
        coachingLevel: planData?.planType === 'coach_head' ? 'head' as const : 'assistant' as const,
        certifications: [],
        specialties: [],
        assignedTeams: [],
        qrCode: '',
        qrCodeUrl: ''
      }),
      
      // Plan and Registration Info
      selectedPlan: planData,
      registrationSource: 'free_registration_coupon',
      couponUsed: 'REGISTER',
      
      // Timestamps
      createdAt: now,
      updatedAt: now
    };

    // Save to Firebase
    try {
      console.log('Saving free registration profile to Firebase...');
      
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
          registrationDate: Timestamp.fromDate(profile.registrationDate),
          createdAt: Timestamp.fromDate(profile.createdAt),
          updatedAt: Timestamp.fromDate(profile.updatedAt)
        };
        
        const collectionName = userRole === 'coach' ? 'coaches' : 'players';
        const docRef = doc(db, collectionName, userId);
        await setDoc(docRef, firebaseProfile);
        
        console.log(`Free registration profile saved to Firebase: ${collectionName}/${userId}`);
      } else {
        console.warn('Firebase not available - profile not saved to database');
        return NextResponse.json({
          success: false,
          error: 'Database unavailable'
        }, { status: 503 });
      }
    } catch (firebaseError) {
      console.error('Firebase save error:', firebaseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to save registration to database'
      }, { status: 500 });
    }

    // Send confirmation email
    try {
      console.log('Sending free registration confirmation email...');
      
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: customerData.email,
          subject: 'All Pro Sports NC - Free Registration Confirmed',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
                <h1>🏈 Welcome to All Pro Sports NC!</h1>
              </div>
              
              <div style="padding: 20px; background-color: #f8f9fa;">
                <h2>Free Registration Confirmed</h2>
                <p>Hi ${customerData.firstName},</p>
                <p>Congratulations! Your free registration with All Pro Sports NC has been successfully completed.</p>
                
                <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>Registration Details:</h3>
                  <p><strong>Name:</strong> ${customerData.firstName} ${customerData.lastName}</p>
                  <p><strong>Email:</strong> ${customerData.email}</p>
                  <p><strong>Phone:</strong> ${customerData.phone}</p>
                  <p><strong>Profile ID:</strong> ${userId}</p>
                  <p><strong>Plan:</strong> ${planData?.title || 'Registration Plan'}</p>
                  <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">✓ Completed - No Payment Required</span></p>
                </div>
                
                <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                  <h3>✓ You're All Set!</h3>
                  <p>Your registration is complete and active. No payment is required thanks to your special registration code.</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>Next Steps:</h3>
                  <ol>
                    <li>Save this email for your records</li>
                    <li>Note your Profile ID: <strong>${userId}</strong></li>
                    <li>Watch for upcoming schedule and event information</li>
                    <li>Contact us if you have any questions</li>
                  </ol>
                </div>
                
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
        console.log('Free registration confirmation email sent successfully');
      } else {
        console.error('Failed to send confirmation email:', await emailResponse.text());
      }
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail the registration if email fails
    }

    // Increment coupon usage count
    try {
      console.log('Incrementing coupon usage count...');
      const incrementResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/coupons/increment-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponCode: couponCode
        }),
      });

      if (incrementResponse.ok) {
        const incrementResult = await incrementResponse.json();
        console.log('Coupon usage incremented:', incrementResult);
      } else {
        console.warn('Failed to increment coupon usage:', await incrementResponse.text());
      }
    } catch (incrementError) {
      console.error('Error incrementing coupon usage:', incrementError);
      // Don't fail the registration if increment fails
    }

    console.log('Free registration completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Free registration completed successfully',
      profileId: userId,
      profile: {
        id: userId,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        role: userRole,
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Error completing free registration:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      success: false,
      error: 'Failed to complete free registration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
