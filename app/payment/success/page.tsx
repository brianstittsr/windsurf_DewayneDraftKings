'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ModernNavbar from '@/components/ModernNavbar';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No payment session found');
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payments/verify-session?session_id=${sessionId}`);
        const data = await response.json();
        
        if (data.session) {
          setSessionData(data.session);
        } else {
          setError('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Verifying your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-lg">
              <div className="card-body text-center py-4">
                <i className="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
                <h4 className="text-warning">Payment Verification Error</h4>
                <p className="text-muted mb-4">{error}</p>
                <div className="d-grid gap-2 d-md-block">
                  <button 
                    className="btn btn-primary me-md-2"
                    onClick={() => router.push('/pricing')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Return to Pricing
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => router.push('/')}
                  >
                    <i className="fas fa-home me-2"></i>
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSuccessful = sessionData?.payment_status === 'paid';
  const playerProfile = sessionData?.playerProfile;
  const paymentMethod = sessionData?.metadata?.paymentMethod || 'card';

  return (
    <div className="container mt-5 pt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg">
            <div className="card-body text-center py-5">
              {isSuccessful ? (
                <>
                  <div className="mb-4">
                    <i className="fas fa-check-circle fa-5x text-success"></i>
                  </div>
                  
                  <h1 className="card-title text-success mb-3">Thank You!</h1>
                  <h4 className="text-muted mb-4">Your payment was processed successfully</h4>

                  {playerProfile && (
                    <div className="alert alert-success mb-4" role="alert">
                      <h5 className="alert-heading">
                        <i className="fas fa-user-check me-2"></i>
                        Registration Complete
                      </h5>
                      <hr />
                      <div className="row text-start">
                        <div className="col-md-6">
                          <p className="mb-2">
                            <strong>Name:</strong> {playerProfile.firstName} {playerProfile.lastName}
                          </p>
                          <p className="mb-2">
                            <strong>Email:</strong> {playerProfile.email}
                          </p>
                          <p className="mb-0">
                            <strong>Phone:</strong> {playerProfile.phone}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p className="mb-2">
                            <strong>Role:</strong> {playerProfile.role === 'player' ? 'Player' : 'Coach'}
                          </p>
                          <p className="mb-2">
                            <strong>Registration ID:</strong> {playerProfile.id}
                          </p>
                          <p className="mb-0">
                            <strong>Payment Method:</strong> {paymentMethod === 'klarna' ? 'Klarna' : paymentMethod === 'affirm' ? 'Affirm' : 'Credit/Debit Card'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row mt-4">
                    <div className="col-md-4 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body text-center">
                          <i className="fas fa-dollar-sign fa-2x text-success mb-2"></i>
                          <h6 className="card-title">Payment Details</h6>
                          <p className="mb-1 fw-bold">${(sessionData.amount_total / 100).toFixed(2)}</p>
                          <span className="badge bg-success">Paid</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body text-center">
                          <i className="fas fa-envelope fa-2x text-primary mb-2"></i>
                          <h6 className="card-title">Confirmation Email</h6>
                          <p className="mb-0 small">
                            Check your email for registration details and next steps
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="card bg-light h-100">
                        <div className="card-body text-center">
                          <i className="fas fa-calendar-check fa-2x text-info mb-2"></i>
                          <h6 className="card-title">What's Next?</h6>
                          <p className="mb-0 small">
                            You'll receive league schedules and updates soon
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info mt-4" role="alert">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Important:</strong> Save this confirmation for your records. You may need your Registration ID for future reference.
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <i className="fas fa-times-circle fa-5x text-danger"></i>
                  </div>
                  
                  <h2 className="card-title text-danger mb-3">Payment Failed</h2>
                  
                  <p className="text-muted mb-4">
                    Unfortunately, your payment could not be processed. No charges were made to your account.
                  </p>

                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>Payment Status:</strong> {sessionData?.payment_status || 'Failed'}
                  </div>

                  <div className="alert alert-warning" role="alert">
                    <strong>Common reasons for payment failure:</strong>
                    <ul className="mb-0 mt-2 text-start">
                      <li>Insufficient funds</li>
                      <li>Card declined by bank</li>
                      <li>Incorrect payment information</li>
                      <li>Network connection issues</li>
                    </ul>
                  </div>
                </>
              )}

              <div className="mt-4">
                <div className="d-grid gap-2 d-md-block">
                  <button
                    className="btn btn-primary btn-lg me-md-2"
                    onClick={() => router.push('/')}
                  >
                    <i className="fas fa-home me-2"></i>
                    Return Home
                  </button>
                  
                  {!isSuccessful && (
                    <button
                      className="btn btn-success btn-lg me-md-2"
                      onClick={() => router.push('/pricing')}
                    >
                      <i className="fas fa-redo me-2"></i>
                      Try Again
                    </button>
                  )}

                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => router.push('/leaderboard')}
                  >
                    <i className="fas fa-trophy me-2"></i>
                    View Leaderboard
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <h6 className="text-muted mb-3">Need Help?</h6>
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      <a href="mailto:support@allprosports.com" className="text-decoration-none">
                        support@allprosports.com
                      </a>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-0">
                      <i className="fas fa-phone me-2 text-success"></i>
                      <a href="tel:+1234567890" className="text-decoration-none">
                        (123) 456-7890
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <ModernNavbar />
      <Suspense fallback={
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading payment confirmation...</p>
            </div>
          </div>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </>
  );
}
