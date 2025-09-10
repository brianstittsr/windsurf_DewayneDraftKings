'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setError('No session ID found');
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await fetch(`/api/payments/verify-session?session_id=${sessionId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setSessionData(data.session);
      } else {
        setError(data.error || 'Failed to verify payment');
      }
    } catch (err) {
      setError('Failed to verify payment');
    } finally {
      setLoading(false);
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
                <p>Verifying your payment...</p>
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
                <h2 className="text-danger mb-3">⚠️ Payment Verification Failed</h2>
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

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card dk-card">
            <div className="card-body text-center">
              <div className="mb-4">
                <div className="success-icon mb-3">
                  <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h1 className="text-success mb-3">🎉 Payment Successful!</h1>
                <p className="lead mb-4">
                  Welcome to All Pro Sports! Your registration has been completed successfully.
                </p>
              </div>

              {sessionData && (
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5 className="card-title">Payment Details</h5>
                        <p className="mb-1"><strong>Amount:</strong> ${(sessionData.amountTotal / 100).toFixed(2)}</p>
                        <p className="mb-1"><strong>Payment ID:</strong> {sessionData.id}</p>
                        <p className="mb-0"><strong>Status:</strong> 
                          <span className="badge bg-success ms-2">Paid</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5 className="card-title">Registration Info</h5>
                        {sessionData.playerData && (
                          <>
                            <p className="mb-1"><strong>Name:</strong> {sessionData.playerData.firstName} {sessionData.playerData.lastName}</p>
                            <p className="mb-1"><strong>Phone:</strong> {sessionData.playerData.phone}</p>
                            <p className="mb-0"><strong>Email:</strong> {sessionData.playerData.email || 'Not provided'}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="alert alert-info">
                <h5 className="alert-heading">What's Next?</h5>
                <ul className="text-start mb-0">
                  <li>You'll receive a confirmation email shortly</li>
                  <li>Check your phone for SMS updates about your registration</li>
                  <li>Your player profile and QR code will be generated within 24 hours</li>
                  <li>Look out for team assignment notifications</li>
                </ul>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <button 
                  className="btn dk-btn-primary btn-lg"
                  onClick={() => window.location.href = '/'}
                >
                  Return to Home
                </button>
                <button 
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => window.location.href = '/pricing'}
                >
                  Register Another Player
                </button>
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
    <Suspense fallback={
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card dk-card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading payment verification...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
