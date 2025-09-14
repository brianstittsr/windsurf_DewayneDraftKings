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
      
      case 'charge.dispute.created':
        const dispute = event.data.object;
        await handleDispute(dispute);
        break;
      
      case 'refund.created':
        const refund = event.data.object;
        await handleRefundCreated(refund);
        break;
      
      case 'refund.updated':
        const refundUpdate = event.data.object;
        await handleRefundUpdated(refundUpdate);
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

async function handleRefundCreated(refund: any) {
  console.log('Processing refund created:', refund.id);
  
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (db) {
      const { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
      
      // Find the original payment by charge ID
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('stripeChargeId', '==', refund.charge)
      );
      
      const paymentSnapshot = await getDocs(paymentsQuery);
      
      if (!paymentSnapshot.empty) {
        const paymentDoc = paymentSnapshot.docs[0];
        const paymentData = paymentDoc.data();
        
        // Update original payment status
        await updateDoc(doc(db, 'payments', paymentDoc.id), {
          refundStatus: refund.status,
          refundAmount: refund.amount / 100,
          refundReason: refund.reason,
          updatedAt: serverTimestamp()
        });
        
        console.log('Updated payment with refund info:', paymentDoc.id);
      }
      
      // Create refund record
      const refundRecord = {
        stripeRefundId: refund.id,
        stripeChargeId: refund.charge,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        receiptNumber: refund.receipt_number,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const refundDoc = await addDoc(collection(db, 'refunds'), refundRecord);
      console.log('Refund record saved:', refundDoc.id);
      
    } else {
      console.log('Firebase not available, refund processed but not stored');
    }
  } catch (error) {
    console.error('Error processing refund:', error);
  }
}

async function handleRefundUpdated(refund: any) {
  console.log('Processing refund updated:', refund.id);
  
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (db) {
      const { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
      
      // Find the refund record
      const refundsQuery = query(
        collection(db, 'refunds'),
        where('stripeRefundId', '==', refund.id)
      );
      
      const refundSnapshot = await getDocs(refundsQuery);
      
      if (!refundSnapshot.empty) {
        const refundDoc = refundSnapshot.docs[0];
        
        // Update refund record
        await updateDoc(doc(db, 'refunds', refundDoc.id), {
          status: refund.status,
          reason: refund.reason,
          updatedAt: serverTimestamp()
        });
        
        console.log('Updated refund record:', refundDoc.id);
        
        // Also update the original payment if needed
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('stripeChargeId', '==', refund.charge)
        );
        
        const paymentSnapshot = await getDocs(paymentsQuery);
        
        if (!paymentSnapshot.empty) {
          const paymentDoc = paymentSnapshot.docs[0];
          
          await updateDoc(doc(db, 'payments', paymentDoc.id), {
            refundStatus: refund.status,
            updatedAt: serverTimestamp()
          });
          
          console.log('Updated payment refund status:', paymentDoc.id);
        }
      }
    } else {
      console.log('Firebase not available, refund update not stored');
    }
  } catch (error) {
    console.error('Error updating refund:', error);
  }
}

async function handleDispute(dispute: any) {
  console.log('Processing dispute created:', dispute.id);
  
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (db) {
      const { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
      
      // Find the original payment by charge ID
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('stripeChargeId', '==', dispute.charge)
      );
      
      const paymentSnapshot = await getDocs(paymentsQuery);
      
      if (!paymentSnapshot.empty) {
        const paymentDoc = paymentSnapshot.docs[0];
        
        // Update original payment with dispute info
        await updateDoc(doc(db, 'payments', paymentDoc.id), {
          disputeStatus: dispute.status,
          disputeReason: dispute.reason,
          disputeAmount: dispute.amount / 100,
          updatedAt: serverTimestamp()
        });
        
        console.log('Updated payment with dispute info:', paymentDoc.id);
      }
      
      // Create dispute record
      const disputeRecord = {
        stripeDisputeId: dispute.id,
        stripeChargeId: dispute.charge,
        amount: dispute.amount / 100,
        currency: dispute.currency,
        status: dispute.status,
        reason: dispute.reason,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const disputeDoc = await addDoc(collection(db, 'disputes'), disputeRecord);
      console.log('Dispute record saved:', disputeDoc.id);
      
    } else {
      console.log('Firebase not available, dispute processed but not stored');
    }
  } catch (error) {
    console.error('Error processing dispute:', error);
  }
}
