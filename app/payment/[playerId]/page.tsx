'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const playerId = params.playerId as string;
  const amount = searchParams.get('amount') || '50';
  const type = searchParams.get('type') || 'player';
  
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Remove Firebase dependency - player data will be handled differently
  useEffect(() => {
    // For now, just set loading to false since we're not fetching from Firebase
    setLoading(false);
  }, [playerId]);

  const handlePayment = async (planType: string, amount: number) => {
    setPaymentProcessing(true);
    setError('');

    try {
      // Get registration data from URL params or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const registrationData = urlParams.get('registration');
      
      if (!registrationData) {
        throw new Error('Registration data not found. Please start from registration page.');
      }

      const playerData = JSON.parse(decodeURIComponent(registrationData));
      
      // Create Stripe checkout session
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
          playerData: playerData,
          planData: {
            title: planType === 'complete-package' ? 'Complete Package' : 'Meal Plan Add-on',
            subtitle: planType === 'complete-package' ? 'Registration + Season + Meal Plan' : 'Monthly meal subscription',
            itemType: planType
          },
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/${playerId}?cancelled=true`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('Invalid response from payment service');
      }
      
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 pt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mt-5 pt-5">
        <div className="alert alert-success text-center">
          <h4>Payment Successful!</h4>
          <p>Welcome to All Pro Sports! You will receive a confirmation email shortly.</p>
          <a href="/" className="btn btn-primary">Return to Home</a>
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

  // Remove player dependency since we're not using Firebase

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
                    <h3>Payment for {type === 'player' ? 'Player' : 'Coach'} Registration</h3>
                    <p className="text-muted">Registration ID: {playerId}</p>
                    <p>Complete your registration by processing payment below.</p>
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
                          onClick={() => handlePayment('basic-registration', 87)}
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
                  <div className="text-center p-3 bg-light rounded">
                    <p>QR Code will be generated after payment completion</p>
                  </div>
                </div>
                <small className="text-muted">
                  Profile URL will be available after registration
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
