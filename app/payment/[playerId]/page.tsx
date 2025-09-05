'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { COLLECTIONS, Player } from '@/lib/firestore-schema';

export default function PaymentPage() {
  const params = useParams();
  const playerId = params.playerId as string;
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        if (!playerId) return;
        
        const playerDoc = await getDoc(doc(db, COLLECTIONS.PLAYERS, playerId));
        if (playerDoc.exists()) {
          setPlayer({ id: playerDoc.id, ...playerDoc.data() } as Player);
        } else {
          setError('Player not found');
        }
      } catch (err) {
        setError('Failed to load player information');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  const handlePayment = async (paymentType: string, amount: number) => {
    setPaymentProcessing(true);
    setError('');

    try {
      // For now, simulate payment processing
      // In Phase 2, this will integrate with Stripe
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update player payment status
      if (player) {
        await updateDoc(doc(db, COLLECTIONS.PLAYERS, player.id), {
          paymentStatus: 'paid',
          registrationStatus: 'confirmed',
          updatedAt: Timestamp.now()
        });

        // Send confirmation SMS
        await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: player.phone,
            message: `🎉 Payment confirmed! Welcome to All Pro Sports, ${player.firstName}! Your registration is complete. Check your player profile: ${player.qrCodeUrl}`,
            subscriberId: player.id,
            journeyId: 'payment-confirmed'
          }),
        });

        // Redirect to success page
        window.location.href = `/player/${player.id}?payment=success`;
      }
    } catch (err) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card dk-card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading payment information...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card dk-card">
              <div className="card-body text-center">
                <h2 className="text-danger mb-3">⚠️ Error</h2>
                <p className="mb-3">{error}</p>
                <button 
                  className="btn dk-btn-primary"
                  onClick={() => window.location.href = '/register'}
                >
                  Return to Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!player) return null;

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card dk-card">
            <div className="card-header">
              <h1 className="card-title h3 mb-0">💳 Complete Your Registration</h1>
              <p className="text-muted mb-0">Choose your payment option to join All Pro Sports</p>
            </div>
            <div className="card-body">
              {/* Player Summary */}
              <div className="mb-4 p-3 bg-light rounded">
                <h5 className="text-primary mb-3">👤 Player Information</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Name:</strong> {player.firstName} {player.lastName}</p>
                    <p><strong>Position:</strong> {player.position}</p>
                    <p><strong>Phone:</strong> {player.phone}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Email:</strong> {player.email || 'Not provided'}</p>
                    <p><strong>Player Type:</strong> {player.playerTag}</p>
                    <p><strong>Registration Date:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="mb-4">
                <h5 className="text-primary mb-3">🏈 League Registration Options</h5>
                
                {/* Flag Football Registration */}
                <div className="card mb-3">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h6 className="card-title mb-2">Flag Football League Registration</h6>
                        <p className="card-text mb-2">
                          Complete league registration including:
                        </p>
                        <ul className="mb-0">
                          <li>Jersey Fee: $25</li>
                          <li>Registration Fee: $59</li>
                          <li>Setup Fee: $3</li>
                        </ul>
                      </div>
                      <div className="col-md-4 text-end">
                        <div className="mb-2">
                          <span className="h4 text-primary">$87</span>
                        </div>
                        <button
                          className="btn dk-btn-primary"
                          onClick={() => handlePayment('flag-football', 87)}
                          disabled={paymentProcessing}
                        >
                          {paymentProcessing ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Processing...
                            </>
                          ) : (
                            'Pay Now'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meal Plan Add-on */}
                <div className="card mb-3">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h6 className="card-title mb-2">Meal Plan Subscription</h6>
                        <p className="card-text mb-2">
                          Add nutrition support to your training:
                        </p>
                        <ul className="mb-0">
                          <li>Setup Fee: $25 (one-time)</li>
                          <li>Monthly Subscription: $10/month</li>
                        </ul>
                      </div>
                      <div className="col-md-4 text-end">
                        <div className="mb-2">
                          <span className="h4 text-primary">$35</span>
                          <small className="text-muted d-block">First month</small>
                        </div>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handlePayment('meal-plan', 35)}
                          disabled={paymentProcessing}
                        >
                          Add Meal Plan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bundle Option */}
                <div className="card border-primary">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h6 className="card-title mb-2">
                          🎯 Complete Package 
                          <span className="badge bg-success ms-2">Save $10</span>
                        </h6>
                        <p className="card-text mb-2">
                          League registration + meal plan:
                        </p>
                        <ul className="mb-0">
                          <li>Flag Football Registration: $87</li>
                          <li>Meal Plan (First Month): $35</li>
                          <li><strong>Bundle Discount: -$10</strong></li>
                        </ul>
                      </div>
                      <div className="col-md-4 text-end">
                        <div className="mb-2">
                          <span className="h4 text-success">$112</span>
                          <small className="text-muted d-block">
                            <s>$122</s> Save $10
                          </small>
                        </div>
                        <button
                          className="btn btn-success btn-lg"
                          onClick={() => handlePayment('complete-package', 112)}
                          disabled={paymentProcessing}
                        >
                          {paymentProcessing ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Processing...
                            </>
                          ) : (
                            'Get Complete Package'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* QR Code Preview */}
              <div className="mt-4 p-3 bg-light rounded text-center">
                <h6 className="text-primary mb-3">📱 Your Player QR Code</h6>
                <p className="text-muted mb-3">
                  After payment, you'll receive your unique QR code that links to your player profile and stats.
                </p>
                <div className="mb-3">
                  <img 
                    src={player.qrCode} 
                    alt="Player QR Code" 
                    style={{ width: '150px', height: '150px' }}
                    className="border rounded"
                  />
                </div>
                <small className="text-muted">
                  Profile URL: {player.qrCodeUrl}
                </small>
              </div>

              <div className="mt-4 text-center">
                <small className="text-muted">
                  Secure payment processing • SMS confirmations included • 
                  <a href="/register" className="text-primary ms-2">Need to update info?</a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
