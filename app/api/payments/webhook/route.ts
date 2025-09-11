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
  console.log('Processing successful payment for session:', session.id);
  
  const metadata = session.metadata;
  console.log('Session metadata:', metadata);
  
  // Parse registration data from metadata
  let registrationData;
  try {
    registrationData = JSON.parse(session.metadata.registrationData);
  } catch (error) {
    console.error('Error parsing registration data:', error);
    return;
  }

  // Create payment record
  const paymentRecord = {
    stripeSessionId: session.id,
    amount: session.amount_total / 100,
    currency: session.currency,
    customerEmail: session.customer_email || session.customer_details?.email,
    customerName: metadata.playerName,
    paymentStatus: session.payment_status,
    paymentMethod: metadata.paymentMethod || session.payment_method_types?.[0] || 'card',
    createdAt: new Date(),
    metadata: {
      planType: metadata.planType,
      playerPhone: metadata.playerPhone,
      playerEmail: metadata.playerEmail
    }
  };

  // Save to Firebase if available
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (db) {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      // Save payment record
      const paymentDoc = await addDoc(collection(db, 'payments'), {
        ...paymentRecord,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Payment record saved:', paymentDoc.id);
      
      // Create user profile with PDF generation and email
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/registration/create-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registrationData,
            paymentId: paymentDoc.id,
            stripeSessionId: session.id
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('User profile created successfully:', result.profileId);
        } else {
          console.error('Failed to create user profile:', await response.text());
        }
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
      
      console.log('Successfully processed payment and initiated profile creation');
    } else {
      console.log('Firebase not available, payment processed but not stored');
    }
  } catch (error) {
    console.error('Error saving to Firebase:', error);
  }
}
