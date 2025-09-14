import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Dynamic import to prevent build-time execution
    const Stripe = await import('stripe').then(mod => mod.default);
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Extract player data from metadata
    const playerData = session.metadata?.registrationData 
      ? JSON.parse(session.metadata.registrationData)
      : null;

      // Try to get additional player data from Firebase if available
      let playerProfile = null;
      try {
        const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
        if (db) {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const playersRef = collection(db, 'players');
          const q = query(playersRef, where('stripeSessionId', '==', session.id));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            playerProfile = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
          }
        }
      } catch (error) {
        console.log('Could not fetch player profile from Firebase:', error);
      }

      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_email,
          playerData: session.metadata.registrationData ? JSON.parse(session.metadata.registrationData) : null,
          playerProfile: playerProfile,
          metadata: session.metadata
        }
      });

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
