import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      currency = 'usd', 
      description, 
      customerEmail, 
      customerName,
      appliedCoupon,
      metadata = {}
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Valid amount is required'
      }, { status: 400 });
    }

    // Dynamic import to avoid build issues
    const stripe = await import('stripe').then(mod => 
      new mod.default(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2023-10-16'
      })
    ).catch(() => null);

    if (!stripe) {
      return NextResponse.json({
        success: false,
        error: 'Payment processing unavailable - Stripe not configured'
      }, { status: 503 });
    }

    try {
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount in cents
        currency,
        description: description || 'All Pro Sports Registration',
        metadata: {
          customerEmail: customerEmail || '',
          customerName: customerName || '',
          appliedCoupon: appliedCoupon || '',
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return NextResponse.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });

    } catch (stripeError: any) {
      console.error('Stripe payment intent creation error:', stripeError);
      return NextResponse.json({
        success: false,
        error: stripeError.message || 'Failed to create payment intent'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Payment intent API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
