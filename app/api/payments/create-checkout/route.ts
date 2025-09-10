import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Dynamic import to prevent build-time execution
    const Stripe = await import('stripe').then(mod => mod.default);
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const body = await request.json();
    const { amount, currency = 'usd', paymentMethod = 'card', registrationData, planData } = body;

    if (!amount || !registrationData || !planData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel`;

    // Configure payment method types based on selection
    let paymentMethodTypes = ['card'];
    if (paymentMethod === 'klarna') {
      paymentMethodTypes = ['klarna'];
    } else if (paymentMethod === 'affirm') {
      paymentMethodTypes = ['affirm'];
    }

    const sessionConfig: any = {
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: planData?.title || 'All Pro Sports Registration',
              description: planData?.subtitle || 'Player registration and services',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        playerName: `${registrationData.firstName} ${registrationData.lastName}`,
        playerPhone: registrationData.phone,
        playerEmail: registrationData.email || '',
        planType: planData?.itemType || 'registration',
        paymentMethod: paymentMethod,
        registrationData: JSON.stringify(registrationData),
        planData: JSON.stringify(planData),
      },
      customer_email: registrationData.email,
    };

    // Add specific configurations for BNPL options
    if (paymentMethod === 'klarna') {
      sessionConfig.payment_method_options = {
        klarna: {
          preferred_locale: 'en-US',
        },
      };
    } else if (paymentMethod === 'affirm') {
      sessionConfig.payment_method_options = {
        affirm: {
          preferred_locale: 'en-US',
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Payment setup failed' 
    }, { status: 500 });
  }
}
