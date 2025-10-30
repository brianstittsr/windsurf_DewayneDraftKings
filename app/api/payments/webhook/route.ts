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
          
          let generatedQrCode = '';
          
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
                  
                  generatedQrCode = qrCode; // Store for email use
                  
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

          // Send registration email with QR code
          if (customerEmail && playerId && generatedQrCode) {
            try {
              console.log('Sending registration email with QR code to:', customerEmail);

              const { doc, getDoc } = await import('firebase/firestore');
              let playerData = null;

              // Get player data for personalized email
              for (const collectionName of ['players', 'coaches']) {
                try {
                  const docRef = doc(db, collectionName, playerId);
                  const docSnap = await getDoc(docRef);
                  if (docSnap.exists()) {
                    playerData = docSnap.data();
                    break;
                  }
                } catch (error) {
                  continue;
                }
              }

              if (playerData) {
                const registrationEmailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    to: customerEmail,
                    subject: 'Welcome to All Pro Sports NC - Your Registration is Complete!',
                    isRegistrationEmail: true,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
                          <h1>🏈 Welcome to All Pro Sports NC!</h1>
                        </div>

                        <div style="padding: 20px; background-color: #f8f9fa;">
                          <h2>Registration Complete!</h2>
                          <p>Thank you for joining All Pro Sports NC! Your registration has been processed and you're now officially part of our league.</p>

                          <!-- Player Card -->
                          <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #007bff;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                              <div>
                                <h3 style="margin: 0; color: #007bff;">${playerData.firstName} ${playerData.lastName}</h3>
                                <p style="margin: 5px 0; color: #6c757d;">${playerData.position || 'Position TBD'} • ${playerData.teamId ? 'Team Assigned' : 'Free Agent'}</p>
                                <p style="margin: 5px 0; font-size: 14px; color: #6c757d;">Player ID: ${playerId}</p>
                              </div>
                              <div style="text-align: center;">
                                <div style="background-color: #007bff; color: white; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">
                                  ${playerData.jerseyNumber || '?'}
                                </div>
                                <small style="color: #6c757d;">Jersey #</small>
                              </div>
                            </div>
                          </div>

                          <!-- QR Code Section -->
                          <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                            <h3>📱 Your Player QR Code</h3>
                            <p style="color: #6b7280; margin: 10px 0;">
                              Use this QR code for quick check-in at games and events
                            </p>

                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; display: inline-block; margin: 10px 0;">
                              <img src="${qrCode}" alt="Player QR Code" style="width: 200px; height: 200px;" />
                            </div>

                            <div style="margin: 15px 0;">
                              <a href="${qrCode}" download="${playerData.firstName}_${playerData.lastName}_QR.png" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                📥 Download QR Code
                              </a>
                            </div>

                            <div style="background-color: #e9ecef; padding: 10px; border-radius: 5px; margin: 15px 0;">
                              <strong>📲 How to use your QR code:</strong>
                              <ul style="text-align: left; margin: 10px 0; padding-left: 20px;">
                                <li>Save this image to your phone</li>
                                <li>Show it at check-in for games and practices</li>
                                <li>Staff will scan it for instant verification</li>
                                <li>Keep it handy for all league events</li>
                              </ul>
                            </div>
                          </div>

                          <!-- What's Included -->
                          <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="color: #28a745;">✅ What's Included in Your Registration</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
                              <div style="display: flex; align-items: center;">
                                <span style="color: #28a745; margin-right: 10px;">✓</span>
                                League participation
                              </div>
                              <div style="display: flex; align-items: center;">
                                <span style="color: #28a745; margin-right: 10px;">✓</span>
                                Player equipment
                              </div>
                              <div style="display: flex; align-items: center;">
                                <span style="color: #28a745; margin-right: 10px;">✓</span>
                                Game schedules
                              </div>
                              <div style="display: flex; align-items: center;">
                                <span style="color: #28a745; margin-right: 10px;">✓</span>
                                Practice sessions
                              </div>
                              <div style="display: flex; align-items: center;">
                                <span style="color: #28a745; margin-right: 10px;">✓</span>
                                Mobile app access
                              </div>
                              <div style="display: flex; align-items: center;">
                                <span style="color: #28a745; margin-right: 10px;">✓</span>
                                Parent portal
                              </div>
                            </div>
                          </div>

                          <!-- Next Steps -->
                          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="color: #856404;">🚀 Next Steps</h3>
                            <ol style="margin: 15px 0;">
                              <li style="margin-bottom: 10px;"><strong>Team Assignment:</strong> You'll be assigned to a team within 48 hours</li>
                              <li style="margin-bottom: 10px;"><strong>Equipment Pickup:</strong> Visit the complex to pick up your jersey and gear</li>
                              <li style="margin-bottom: 10px;"><strong>First Practice:</strong> Check your email for practice schedules</li>
                              <li style="margin-bottom: 10px;"><strong>Join Our Community:</strong> Follow us on social media for updates</li>
                            </ol>
                          </div>

                          <!-- Contact Info -->
                          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: white; border-radius: 10px;">
                            <h3>📞 Need Help?</h3>
                            <p><strong>Email:</strong> <a href="mailto:info@allprosportsnc.com">info@allprosportsnc.com</a></p>
                            <p><strong>Phone:</strong> (919) 555-0100</p>
                            <p><strong>Address:</strong> All Pro Sports Complex, Raleigh NC</p>
                            <div style="margin: 15px 0;">
                              <a href="#" style="background-color: #007bff; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; margin: 0 5px;">📘 Facebook</a>
                              <a href="#" style="background-color: #e4405f; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; margin: 0 5px;">📷 Instagram</a>
                            </div>
                          </div>
                        </div>

                        <div style="background-color: #343a40; color: white; padding: 20px; text-align: center;">
                          <p>&copy; 2024 All Pro Sports NC. All rights reserved.</p>
                          <p style="font-size: 12px; margin: 10px 0;">
                            <a href="/privacy" style="color: #adb5bd;">Privacy Policy</a> |
                            <a href="/tos" style="color: #adb5bd;">Terms of Service</a>
                          </p>
                        </div>
                      </div>
                    `,
                    attachments: [{
                      filename: `${playerData.firstName}_${playerData.lastName}_QR_Code.png`,
                      content: qrCode.replace(/^data:image\/png;base64,/, ''),
                      encoding: 'base64',
                      cid: 'qrcode@allprosportsnc.com'
                    }]
                  }),
                });

                if (registrationEmailResponse.ok) {
                  console.log('Registration email with QR code sent successfully');
                } else {
                  console.error('Failed to send registration email with QR code');
                }
              }
            } catch (registrationEmailError) {
              console.error('Registration email send error:', registrationEmailError);
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
