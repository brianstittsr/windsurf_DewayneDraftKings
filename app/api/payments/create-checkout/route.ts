import { NextRequest, NextResponse } from 'next/server';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Create checkout endpoint called');
    const data = await request.json();
    console.log('Checkout request data:', Object.keys(data));

    const {
      amount,
      currency = 'usd',
      description,
      customerEmail,
      customerName,
      paymentMethod = 'card',
      appliedCoupon,
      couponDiscount,
      originalAmount,
      metadata = {},
      paymentMethods = ['card'],
      successUrl,
      cancelUrl
    } = data;

    // Validate required fields
    if (!amount || !customerEmail || !customerName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: amount, customerEmail, customerName'
      }, { status: 400 });
    }

    // Check if Stripe is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured');
      return NextResponse.json({
        success: false,
        error: 'Payment processing unavailable - Stripe not configured'
      }, { status: 503 });
    }

    try {
      // Dynamic import of Stripe
      const stripe = await import('stripe').then(m => 
        new m.default(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2023-10-16'
        })
      );

      console.log('Creating Stripe checkout session...');

      // Create checkout session
      // Add 'cashapp' to the payment methods if not already included
      const paymentMethodsWithCashApp = (() => {
        if (Array.isArray(paymentMethods)) {
          // Use a Set to ensure no duplicates, then convert back to array
          const methods = new Set([...paymentMethods, 'cashapp']);
          return Array.from(methods);
        }
        return ['card', 'cashapp'];
      })();

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: paymentMethodsWithCashApp,
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: description || 'All Pro Sports Registration',
                description: `Registration for ${customerName}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: customerEmail,
        metadata: {
          ...metadata,
          customerName,
          customerEmail,
          appliedCoupon: appliedCoupon || '',
          couponDiscount: couponDiscount ? String(couponDiscount) : '',
          originalAmount: originalAmount ? String(originalAmount) : '',
          paymentMethod
        },
        success_url: successUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/register?cancelled=true`,
        automatic_tax: {
          enabled: false,
        },
        billing_address_collection: 'required',
        phone_number_collection: {
          enabled: true,
        },
      });

      console.log('Checkout session created:', session.id);

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        url: session.url,
        message: 'Checkout session created successfully'
      });

    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create payment session',
        details: stripeError instanceof Error ? stripeError.message : 'Stripe error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
