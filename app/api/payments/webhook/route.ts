import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Dynamic imports to prevent build-time execution
    const Stripe = await import('stripe').then(mod => mod.default);
    
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleSuccessfulPayment(session);
        break;
      
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: any) {
  try {
    console.log('Processing successful payment:', session.id);
    
    // Extract player data from metadata
    const metadata = session.metadata;
    const playerData = JSON.parse(session.metadata.registrationData);
    
    console.log('Payment completed for player:', {
      name: metadata.playerName,
      phone: metadata.playerPhone,
      email: metadata.playerEmail,
      amount: session.amount_total / 100,
      sessionId: session.id
    });

    // Dynamically import Firebase services
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (db) {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      // Save payment record
      const paymentRecord = {
        sessionId: session.id,
        amount: session.amount_total / 100,
        currency: session.currency,
        status: 'completed',
        playerName: metadata.playerName,
        playerPhone: metadata.playerPhone,
        playerEmail: metadata.playerEmail,
        planType: metadata.planType,
        createdAt: serverTimestamp(),
        stripeData: {
          customerId: session.customer,
          paymentIntentId: session.payment_intent,
          paymentStatus: session.payment_status
        }
      };
      
      await addDoc(collection(db, 'payments'), paymentRecord);
      
      // Create player profile
      const playerProfile = {
        ...playerData,
        paymentStatus: 'paid',
        registrationDate: serverTimestamp(),
        stripeSessionId: session.id,
        planType: metadata.planType,
        qrCodeGenerated: false
      };
      
      const playerDoc = await addDoc(collection(db, 'players'), playerProfile);
      console.log('Player profile created:', playerDoc.id);
      
      // TODO: Generate QR code for player
      // TODO: Send confirmation SMS/email
    } else {
      console.log('Firebase not available, payment logged locally only');
    }
    
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}
