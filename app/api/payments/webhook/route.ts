import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Stripe webhook received');
    
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Dynamic import of Stripe
    const stripe = await import('stripe').then(m => 
      new m.default(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-10-16'
      })
    );

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Webhook event type:', event.type);

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      console.log('Payment successful for session:', session.id);

      // Extract player/customer information from metadata
      const playerId = session.metadata?.playerId;
      const customerEmail = session.customer_details?.email;
      const appliedCoupon = session.metadata?.appliedCoupon;
      const couponDiscount = session.metadata?.couponDiscount;
      const originalAmount = session.metadata?.originalAmount;

      // Save payment record to Firebase with coupon information
      try {
        const firebaseModule = await import('../../../../lib/firebase').catch(() => ({ db: null }));
        const { db } = firebaseModule;
        
        if (db) {
          const { collection, addDoc, Timestamp } = await import('firebase/firestore');
          
          const paymentData = {
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent,
            amount: session.amount_total / 100, // Convert from cents
            originalAmount: originalAmount ? parseFloat(originalAmount) : session.amount_total / 100,
            currency: session.currency || 'usd',
            status: 'succeeded',
            paymentMethod: session.payment_method_types?.[0] || 'card',
            
            // Customer Info
            customerName: session.customer_details?.name || '',
            customerEmail: customerEmail || '',
            customerPhone: session.customer_details?.phone || '',
            
            // Coupon Information
            couponCode: appliedCoupon || null,
            couponDiscount: couponDiscount ? parseFloat(couponDiscount) : null,
            couponApplied: !!appliedCoupon,
            
            // Player/Registration Info
            playerId: playerId || null,
            description: session.metadata?.description || 'Registration Payment',
            
            // Metadata
            metadata: session.metadata || {},
            createdAt: Timestamp.now(),
            paidAt: Timestamp.now()
          };
          
          const paymentsRef = collection(db, 'payments');
          const paymentDoc = await addDoc(paymentsRef, paymentData);
          console.log('Payment record saved with ID:', paymentDoc.id, 'Coupon:', appliedCoupon);
        }
      } catch (paymentSaveError) {
        console.error('Error saving payment record:', paymentSaveError);
      }

      // Increment coupon usage if a coupon was used
      if (appliedCoupon && appliedCoupon.toUpperCase() !== 'REGISTER') {
        try {
          console.log('Incrementing coupon usage for:', appliedCoupon);
          const firebaseModule = await import('../../../../lib/firebase').catch(() => ({ db: null }));
          const { db } = firebaseModule;
          
          if (db) {
            const { collection, query, where, getDocs, doc, updateDoc, increment, Timestamp } = await import('firebase/firestore');
            
            const couponsRef = collection(db, 'coupons');
            const q = query(couponsRef, where('code', '==', appliedCoupon.toUpperCase()));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
              const couponDoc = snapshot.docs[0];
              const couponRef = doc(db, 'coupons', couponDoc.id);
              
              await updateDoc(couponRef, {
                usedCount: increment(1),
                lastUsedAt: Timestamp.now(),
                updatedAt: Timestamp.now()
              });
              
              console.log(`✓ Coupon ${appliedCoupon} usage incremented`);
            } else {
              console.warn(`⚠ Coupon not found: ${appliedCoupon}`);
            }
          }
        } catch (incrementError) {
          console.error('Error incrementing coupon usage:', incrementError);
          // Don't fail the webhook if increment fails
        }
      }

      if (playerId) {
        try {
          // Update user payment status in Firebase
          console.log('Updating payment status for player:', playerId);
          
          const firebaseModule = await import('../../../../lib/firebase').catch((importError) => {
            console.error('Firebase import error:', importError);
            return { db: null };
          });
          
          const { db } = firebaseModule;
          
          if (db) {
            const { doc, updateDoc, getDoc } = await import('firebase/firestore');
            
            // Try both players and coaches collections
            const collections = ['players', 'coaches'];
            let updated = false;
            
            for (const collectionName of collections) {
              try {
                const docRef = doc(db, collectionName, playerId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                  const playerData = docSnap.data();
                  
                  // Generate QR code if not exists
                  let qrCode = playerData.qrCode || '';
                  let qrCodeUrl = playerData.qrCodeUrl || '';
                  
                  if (!qrCode) {
                    try {
                      const QRCode = await import('qrcode');
                      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.allprosportsnc.com';
                      qrCodeUrl = `${baseUrl}/player/${playerId}`;
                      
                      const qrData = JSON.stringify({
                        playerId,
                        name: `${playerData.firstName} ${playerData.lastName}`,
                        team: playerData.teamId || 'Unassigned',
                        jersey: playerData.jerseyNumber || 'TBD',
                        verified: true,
                        url: qrCodeUrl
                      });
                      
                      qrCode = await QRCode.toDataURL(qrData, {
                        width: 300,
                        margin: 2,
                        errorCorrectionLevel: 'H'
                      });
                      
                      console.log('✓ QR code generated for player:', playerId);
                    } catch (qrError) {
                      console.error('Error generating QR code:', qrError);
                    }
                  }
                  
                  await updateDoc(docRef, {
                    paymentStatus: 'completed',
                    registrationStatus: 'active',
                    paymentDate: new Date(),
                    stripeSessionId: session.id,
                    qrCode,
                    qrCodeUrl,
                    updatedAt: new Date()
                  });
                  
                  console.log(`Payment status updated in ${collectionName}/${playerId}`);
                  updated = true;
                  break;
                }
              } catch (updateError) {
                console.error(`Error updating ${collectionName}:`, updateError);
              }
            }
            
            if (!updated) {
              console.warn(`Player ${playerId} not found in any collection`);
            }
          }

          // Send payment confirmation email
          if (customerEmail) {
            try {
              console.log('Sending payment confirmation email to:', customerEmail);
              
              const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  to: customerEmail,
                  subject: 'Payment Confirmation - All Pro Sports NC',
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
                        <h1>🎉 Payment Confirmed!</h1>
                      </div>
                      
                      <div style="padding: 20px; background-color: #f8f9fa;">
                        <h2>Thank You for Your Payment</h2>
                        <p>Your payment has been successfully processed and your registration is now complete!</p>
                        
                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                          <h3>Payment Details:</h3>
                          <p><strong>Session ID:</strong> ${session.id}</p>
                          <p><strong>Amount:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
                          <p><strong>Player ID:</strong> ${playerId}</p>
                          <p><strong>Status:</strong> Paid & Active</p>
                        </div>
                        
                        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                          <h3>What's Next:</h3>
                          <ul>
                            <li>Your registration is now active</li>
                            <li>You'll receive additional information about schedules and events</li>
                            <li>Keep your Player ID for future reference</li>
                            <li>Contact us if you have any questions</li>
                          </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <p><strong>Questions?</strong></p>
                          <p>Contact us at <a href="mailto:info@allprosportsnc.com">info@allprosportsnc.com</a></p>
                          <p>Visit us at All Pro Sports Complex</p>
                        </div>
                      </div>
                      
                      <div style="background-color: #343a40; color: white; padding: 20px; text-align: center;">
                        <p>&copy; 2024 All Pro Sports NC. All rights reserved.</p>
                      </div>
                    </div>
                  `
                }),
              });

              if (emailResponse.ok) {
                console.log('Payment confirmation email sent successfully');
              } else {
                console.error('Failed to send payment confirmation email');
              }
            } catch (emailError) {
              console.error('Email send error:', emailError);
            }
          }

        } catch (error) {
          console.error('Error processing payment completion:', error);
        }
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
