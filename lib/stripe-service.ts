import Stripe from 'stripe';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from './firestore-schema';

class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  // Create payment intent for credit card payments
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    customerId?: string,
    metadata?: { [key: string]: string }
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Create Stripe customer
  async createCustomer(
    email: string,
    name: string,
    phone?: string,
    metadata?: { [key: string]: string }
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        phone,
        metadata,
      });

      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Create checkout session for hosted payment page
  async createCheckoutSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    successUrl: string,
    cancelUrl: string,
    customerId?: string,
    metadata?: { [key: string]: string }
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card', 'klarna', 'affirm'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer: customerId,
        metadata,
        payment_intent_data: {
          metadata,
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Create subscription for recurring payments
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: { [key: string]: string }
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhook(
    payload: string,
    signature: string,
    endpointSecret: string
  ): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPayment(event.data.object as Stripe.Invoice);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  // Handle successful payment
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const paymentData = {
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer as string,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'succeeded' as const,
        paidAt: Timestamp.now(),
        paymentMethod: {
          type: 'card' as const,
          last4: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
          brand: paymentIntent.charges.data[0]?.payment_method_details?.card?.brand,
        },
        metadata: paymentIntent.metadata,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Save payment record to Firestore
      await addDoc(collection(db, COLLECTIONS.PAYMENTS), paymentData);

      // Update player/coach payment status if applicable
      if (paymentIntent.metadata?.playerId) {
        await updateDoc(doc(db, COLLECTIONS.PLAYERS, paymentIntent.metadata.playerId), {
          paymentStatus: 'paid',
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  // Handle failed payment
  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const paymentData = {
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer as string,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'failed' as const,
        failureReason: paymentIntent.last_payment_error?.message,
        metadata: paymentIntent.metadata,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, COLLECTIONS.PAYMENTS), paymentData);
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  // Handle completed checkout session
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const paymentData = {
        stripeSessionId: session.id,
        stripeCustomerId: session.customer as string,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'USD',
        status: 'succeeded' as const,
        paidAt: Timestamp.now(),
        paymentMethod: {
          type: session.payment_method_types?.[0] as any || 'card',
        },
        metadata: session.metadata,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, COLLECTIONS.PAYMENTS), paymentData);
    } catch (error) {
      console.error('Error handling checkout completion:', error);
    }
  }

  // Handle subscription payment
  private async handleSubscriptionPayment(invoice: Stripe.Invoice): Promise<void> {
    try {
      const paymentData = {
        stripeCustomerId: invoice.customer as string,
        subscriptionId: invoice.subscription as string,
        amount: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'succeeded' as const,
        paidAt: Timestamp.now(),
        paymentType: 'monthly' as const,
        description: `Subscription payment - ${invoice.lines.data[0]?.description}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, COLLECTIONS.PAYMENTS), paymentData);
    } catch (error) {
      console.error('Error handling subscription payment:', error);
    }
  }

  // Refund payment
  async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason as Stripe.RefundCreateParams.Reason,
      });

      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Get payment details
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  // Get customer details
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
export default StripeService;
