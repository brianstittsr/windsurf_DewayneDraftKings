'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ModernNavbar from '@/components/ModernNavbar';

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'processing' | 'failed'>('processing');
  const [playerInfo, setPlayerInfo] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Verify payment status with Stripe
      verifyPayment(sessionId);
    } else {
      setPaymentStatus('failed');
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/payments/verify-session?session_id=${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.session?.payment_status === 'paid') {
        setPaymentStatus('success');
        setPlayerInfo(data.metadata);
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <ModernNavbar />
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card dk-card">
                <div className="card-body p-4">
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-4" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4 className="mb-3">Verifying Payment...</h4>
                    <p className="text-muted">Please wait while we confirm your registration payment.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <>
        <ModernNavbar />
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card dk-card">
                <div className="card-body p-4">
                  <div className="text-center py-5">
                    <div className="feature-icon mx-auto mb-4" style={{ background: 'var(--gradient-success)' }}>
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h2 className="mb-3">Welcome to All Pro Sports!</h2>
                    <p className="lead mb-4">
                      🎉 Your registration and payment have been successfully processed!
                    </p>
                    
                    <div className="row text-start mb-4">
                      <div className="col-md-6">
                        <div className="dk-card p-3 mb-3">
                          <h6 className="text-primary mb-2">
                            <i className="fas fa-user-check me-2"></i>
                            Registration Complete
                          </h6>
                          <p className="mb-0 small">Your player profile is now active and you're ready to compete!</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="dk-card p-3 mb-3">
                          <h6 className="text-success mb-2">
                            <i className="fas fa-credit-card me-2"></i>
                            Payment Confirmed
                          </h6>
                          <p className="mb-0 small">Your $100 registration fee has been successfully processed.</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="dk-card p-3 mb-3">
                          <h6 className="text-info mb-2">
                            <i className="fas fa-sms me-2"></i>
                            SMS Updates
                          </h6>
                          <p className="mb-0 small">You'll receive game schedules, team news, and league updates via SMS.</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="dk-card p-3 mb-3">
                          <h6 className="text-warning mb-2">
                            <i className="fas fa-qrcode me-2"></i>
                            QR Code Profile
                          </h6>
                          <p className="mb-0 small">Your unique QR code profile has been generated for easy check-ins.</p>
                        </div>
                      </div>
                    </div>

                    <div className="alert alert-info border-0 rounded-3 mb-4">
                      <h6 className="alert-heading">
                        <i className="fas fa-info-circle me-2"></i>
                        What's Next?
                      </h6>
                      <ul className="mb-0 text-start">
                        <li>Check your phone for a welcome SMS with important information</li>
                        <li>Visit the League page to see current standings and upcoming games</li>
                        <li>Wait for team draft notifications via SMS</li>
                        <li>Attend your first practice or game when scheduled</li>
                      </ul>
                    </div>

                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                      <button 
                        className="btn btn-primary btn-lg"
                        onClick={() => window.location.href = '/league'}
                      >
                        <i className="fas fa-trophy me-2"></i>
                        View League
                      </button>
                      <button 
                        className="btn btn-outline-primary btn-lg"
                        onClick={() => window.location.href = '/'}
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
        </div>
      </>
    );
  }

  // Payment failed or processing
  return (
    <>
      <ModernNavbar />
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card dk-card">
              <div className="card-body p-4">
                <div className="text-center py-5">
                  <div className="feature-icon mx-auto mb-4" style={{ background: 'var(--gradient-danger)' }}>
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <h4 className="mb-3">Payment Issue</h4>
                  <p className="text-muted mb-4">
                    There was an issue processing your payment. Your registration may still be pending.
                  </p>
                  
                  <div className="alert alert-warning border-0 rounded-3 mb-4">
                    <h6 className="alert-heading">
                      <i className="fas fa-info-circle me-2"></i>
                      What to do:
                    </h6>
                    <ul className="mb-0 text-start">
                      <li>Check your email for payment confirmation</li>
                      <li>Contact support if you were charged but see this message</li>
                      <li>Try registering again if payment was not processed</li>
                    </ul>
                  </div>

                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/register'}
                    >
                      <i className="fas fa-redo me-2"></i>
                      Try Again
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => window.location.href = '/'}
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
      </div>
    </>
  );
}
