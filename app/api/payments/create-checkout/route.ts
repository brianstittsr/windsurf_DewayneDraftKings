import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe-service';
import { 
  checkoutUtils, 
  enhancedCheckoutSessionService,
  enhancedPlanSelectionService 
} from '@/lib/firebase-services';
import { Timestamp } from 'firebase/firestore';

const stripeService = new StripeService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      currency = 'usd',
      customerEmail,
      customerName,
      paymentMethods = ['card'], // Default to card, can include 'klarna', 'affirm'
      planDetails, // New: plan information from checkout
      registrationData, // New: temporary registration data storage
      metadata = {},
      successUrl,
      cancelUrl
    } = body;

    // Validate required fields
    if (!amount || !customerEmail || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, customerEmail, successUrl, cancelUrl' },
        { status: 400 }
      );
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Create or retrieve customer
    let customer;
    try {
      customer = await stripeService.createCustomer(customerEmail, customerName);
    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      return NextResponse.json(
        { error: 'Failed to process customer information' },
        { status: 500 }
      );
    }

    // Create checkout session with specified payment methods
    const session = await stripeService.createCheckoutSession(
      amountInCents,
      currency,
      successUrl,
      cancelUrl,
      customer.id,
      {
        customerName,
        planType: planDetails?.planType,
        planName: planDetails?.planName,
        ...metadata
      },
      paymentMethods as any
    );

    // Store checkout session in Firebase
    const checkoutSessionData = {
      sessionId: session.id!,
      sessionUrl: session.url!,
      customerEmail,
      customerName,
      selectedPlan: planDetails || {
        planType: 'jamboree' as const,
        planName: 'Default Plan',
        originalPrice: amount,
        serviceFee: 0,
        finalAmount: amount
      },
      paymentMethods,
      status: 'created' as const,
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours
      successUrl,
      cancelUrl,
      registrationData
    };

    const checkoutSessionId = await checkoutUtils.createCheckoutSession(checkoutSessionData);

    // Create plan selection record if plan details provided
    if (planDetails) {
      const planSelectionData = {
        customerEmail,
        planType: planDetails.planType,
        planName: planDetails.planName,
        role: planDetails.planType.includes('coach') ? 'coach' as const : 'player' as const,
        originalPrice: planDetails.originalPrice,
        serviceFee: planDetails.serviceFee,
        couponCode: planDetails.couponCode,
        couponDiscount: planDetails.couponDiscount,
        finalAmount: planDetails.finalAmount,
        selectedFrom: 'registration_wizard' as const,
        status: 'in_checkout' as const,
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        checkoutSessionId: session.id
      };

      await checkoutUtils.createPlanSelection(planSelectionData);
    }

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
      customerId: customer.id,
      checkoutSessionId
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
