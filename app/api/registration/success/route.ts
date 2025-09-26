import { NextRequest, NextResponse } from 'next/server';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const profileId = searchParams.get('profile_id');

    // If we have a Stripe session ID, we could retrieve session details
    if (sessionId) {
      try {
        // Dynamic import to avoid build issues
        const stripe = await import('stripe').then(m => 
          new m.default(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2023-10-16'
          })
        ).catch(() => null);

        if (stripe && sessionId.startsWith('cs_')) {
          // Retrieve Stripe checkout session
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          
          return NextResponse.json({
            success: true,
            sessionData: {
              paymentStatus: session.payment_status,
              customerEmail: session.customer_details?.email,
              amountTotal: session.amount_total ? session.amount_total / 100 : null,
              currency: session.currency,
              paymentMethod: session.payment_method_types?.[0],
              metadata: session.metadata
            }
          });
        }
      } catch (error) {
        console.error('Error retrieving Stripe session:', error);
        // Continue without Stripe data
      }
    }

    // If we have a profile ID, we could retrieve profile details
    if (profileId) {
      try {
        // Dynamic import to avoid build issues
        const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
        
        if (db) {
          const { doc, getDoc } = await import('firebase/firestore');
          
          // Try to get profile from players collection
          let profileDoc = await getDoc(doc(db, 'players', profileId));
          let collection = 'players';
          
          // If not found in players, try coaches
          if (!profileDoc.exists()) {
            profileDoc = await getDoc(doc(db, 'coaches', profileId));
            collection = 'coaches';
          }
          
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            return NextResponse.json({
              success: true,
              profileData: {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                role: collection === 'players' ? 'Player' : 'Coach',
                selectedPlan: profileData.selectedPlan,
                registrationDate: profileData.createdAt?.toDate?.()?.toISOString() || null
              }
            });
          }
        }
      } catch (error) {
        console.error('Error retrieving profile:', error);
        // Continue without profile data
      }
    }

    // Return basic success response
    return NextResponse.json({
      success: true,
      message: 'Registration completed successfully'
    });

  } catch (error) {
    console.error('Error in registration success API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve registration details'
    }, { status: 500 });
  }
}
