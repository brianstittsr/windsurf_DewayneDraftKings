import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// Define types for the request body
interface CheckoutRequest {
  amount: number;
  currency?: string;
  description?: string;
  customerEmail: string;
  customerName: string;
  paymentMethod?: string;
  appliedCoupon?: string;
  couponDiscount?: number;
  originalAmount?: number;
  metadata?: Record<string, any>;
  paymentMethods?: Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
  successUrl?: string;
  cancelUrl?: string;
}

// Define supported payment methods
const SUPPORTED_PAYMENT_METHODS: Array<Stripe.Checkout.SessionCreateParams.PaymentMethodType> = [
  'card',
  'acss_debit',
  'affirm',
  'afterpay_clearpay',
  'alipay',
  'au_becs_debit',
  'bacs_debit',
  'bancontact',
  'boleto',
  'paypal', // PayPal for smooth checkout experience
  'customer_balance',
  'eps',
  'fpx',
  'giropay',
  'grabpay',
  'ideal',
  'klarna',
  'konbini',
  'link',
  'oxxo',
  'p24',
  'paynow',
  'pix',
  'promptpay',
  'sepa_debit',
  'sofort',
  'us_bank_account',
  'wechat_pay',
] as const;

// Helper function to get payment method configurations
const getPaymentMethodOptions = (method: Stripe.Checkout.SessionCreateParams.PaymentMethodType): Stripe.Checkout.SessionCreateParams.PaymentMethodOptions => {
  const baseConfig: Record<string, any> = {
    card: {},
    klarna: { preferred_locale: 'en-US' },
    affirm: { preferred_locale: 'en-US' },
    paypal: { preferred_locale: 'en-US' }, // Removed invalid 'flow' parameter
    link: { setup_future_usage: 'on_session' },
    alipay: { setup_future_usage: 'off_session' },
    wechat_pay: { client: 'web' },
    afterpay_clearpay: { reference: `ORDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}` },
    boleto: { expires_after_days: 3 },
    oxxo: { expires_after_days: 1 },
  };

  const config = baseConfig[method];
  return config ? { [method]: config } : {};
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Create checkout endpoint called');
    const data: CheckoutRequest = await request.json();
    console.log('Checkout request data:', JSON.stringify(data, null, 2));

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
    
    console.log('Parsed payment method:', paymentMethod);
    console.log('Amount in cents:', amount);

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
      // Filter and validate payment methods
      // If paymentMethod is specified, use it, otherwise use paymentMethods array
      const methodsToEnable = paymentMethod === 'paypal' 
        ? ['paypal'] 
        : (Array.isArray(paymentMethods) 
            ? paymentMethods 
            : paymentMethod === 'klarna'
              ? ['klarna']
              : paymentMethod === 'affirm'
                ? ['affirm']
                : ['card']);
      
      const enabledPaymentMethods = methodsToEnable
        .filter((method): method is Stripe.Checkout.SessionCreateParams.PaymentMethodType =>
          SUPPORTED_PAYMENT_METHODS.includes(method as any)
        )
        .slice(0, 10) as Stripe.Checkout.SessionCreateParams.PaymentMethodType[]; // Ensure we don't exceed Stripe's limit

      console.log('Enabled payment methods:', enabledPaymentMethods);

      // Build payment method options
      const paymentMethodOptions = enabledPaymentMethods.reduce<Stripe.Checkout.SessionCreateParams.PaymentMethodOptions>(
        (acc, method) => {
          const options = getPaymentMethodOptions(method);
          return { ...acc, ...options };
        },
        {}
      );
      
      console.log('Payment method options:', JSON.stringify(paymentMethodOptions, null, 2));

      // Create checkout session with all supported payment methods
      const session = await stripe.checkout.sessions.create({
        payment_method_types: enabledPaymentMethods,
        payment_method_options: paymentMethodOptions,
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
        mode: 'payment' as const,
        payment_intent_data: {
          setup_future_usage: 'off_session',
          metadata: {
            customer_name: customerName,
            customer_email: customerEmail,
            ...(appliedCoupon ? { coupon_code: appliedCoupon } : {}),
            ...metadata
          },
        },
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'ES', 'IT', 'AU', 'JP'],
        },
        customer_email: customerEmail.toLowerCase().trim(),
        metadata: {
          customer_name: customerName,
          customer_email: customerEmail,
          ...(appliedCoupon && { applied_coupon: appliedCoupon }),
          ...(couponDiscount && { coupon_discount: String(couponDiscount) }),
          ...(originalAmount && { original_amount: String(originalAmount) }),
          payment_method: paymentMethod || 'card',
          ...metadata
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

    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError);
      console.error('Stripe error details:', {
        message: stripeError?.message,
        type: stripeError?.type,
        code: stripeError?.code,
        param: stripeError?.param,
        raw: stripeError?.raw
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to create payment session',
        details: stripeError?.message || 'Stripe error',
        stripeError: {
          type: stripeError?.type,
          code: stripeError?.code,
          param: stripeError?.param
        }
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
