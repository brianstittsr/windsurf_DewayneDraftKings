import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe-service';
import { 
  enhancedCheckoutSessionService,
  enhancedPaymentService,
  enhancedPlanSelectionService,
  enhancedPlayerService,
  enhancedCoachService,
  checkoutUtils 
} from '@/lib/firebase-services';
import { Timestamp } from 'firebase/firestore';
import Stripe from 'stripe';

const stripeService = new StripeService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      return NextResponse.json(
        { success: false, error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Construct and verify webhook event
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

// Handle successful checkout session completion
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    // Find the checkout session in Firebase
    const checkoutSession = await enhancedCheckoutSessionService.getByStripeSessionId(session.id);
    
    if (!checkoutSession) {
      console.error('Checkout session not found:', session.id);
      return;
    }

    // Create payment record
    const paymentData = {
      customerEmail: checkoutSession.customerEmail,
      customerName: checkoutSession.customerName,
      amount: (session.amount_total || 0) / 100,
      currency: 'USD' as const,
      description: `Registration: ${checkoutSession.selectedPlan.planName}`,
      paymentType: 'registration' as const,
      paymentMethod: {
        type: session.payment_method_types?.[0] as any || 'card',
        bnplAccountVerified: checkoutSession.bnplAccountVerified
      },
      stripeSessionId: session.id,
      stripeCustomerId: session.customer as string,
      bnplAccountStatus: checkoutSession.bnplAccountVerified ? 'verified' as const : undefined,
      status: 'succeeded' as const,
      paidAt: Timestamp.now(),
      planDetails: checkoutSession.selectedPlan
    };

    const paymentId = await enhancedPaymentService.create(paymentData);

    // Complete the checkout session
    await enhancedCheckoutSessionService.completeSession(session.id, paymentId);

    // Update plan selection status
    const planSelections = await enhancedPlanSelectionService.getByEmail(checkoutSession.customerEmail);
    const activePlan = planSelections.find(p => p.checkoutSessionId === session.id);
    
    if (activePlan) {
      await enhancedPlanSelectionService.markAsPaid(activePlan.id, paymentId, session.id);
    }

    // Update player/coach payment status if registration data exists
    if (checkoutSession.registrationData) {
      const role = checkoutSession.selectedPlan.planType.includes('coach') ? 'coach' : 'player';
      
      if (role === 'player') {
        const player = await enhancedPlayerService.getByEmail(checkoutSession.customerEmail);
        if (player) {
          await enhancedPlayerService.updatePaymentStatus(player.id, 'paid');
        }
      } else {
        const coach = await enhancedCoachService.getByEmail(checkoutSession.customerEmail);
        if (coach) {
          // Update coach record as needed
        }
      }
    }

    console.log('Checkout completed successfully:', session.id);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

// Handle successful payment intent
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status if exists
    const payment = await enhancedPaymentService.getByStripeSessionId(paymentIntent.id);
    if (payment) {
      await enhancedPaymentService.updatePaymentStatus(payment.id, 'succeeded');
    }
    
    console.log('Payment succeeded:', paymentIntent.id);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle failed payment intent
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status if exists
    const payment = await enhancedPaymentService.getByStripeSessionId(paymentIntent.id);
    if (payment) {
      await enhancedPaymentService.updatePaymentStatus(payment.id, 'failed', {
        failureReason: paymentIntent.last_payment_error?.message
      });
    }
    
    console.log('Payment failed:', paymentIntent.id);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
