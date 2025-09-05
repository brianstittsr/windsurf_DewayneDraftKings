import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      description, 
      customerId, 
      customerEmail, 
      customerName,
      paymentType = 'registration',
      playerId,
      coachId,
      successUrl,
      cancelUrl 
    } = body;

    if (!amount || !description) {
      return NextResponse.json(
        { success: false, error: 'Amount and description are required' },
        { status: 400 }
      );
    }

    // Create or get customer
    let stripeCustomerId = customerId;
    if (!stripeCustomerId && customerEmail && customerName) {
      const customer = await stripeService.createCustomer(
        customerEmail,
        customerName,
        undefined,
        { playerId, coachId, paymentType }
      );
      stripeCustomerId = customer.id;
    }

    // Create line items for checkout
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: description,
            description: `${paymentType} payment for All Pro Sports`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      lineItems,
      successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancelled`,
      stripeCustomerId,
      { 
        paymentType, 
        playerId, 
        coachId,
        customerEmail,
        customerName 
      }
    );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      customerId: stripeCustomerId
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
