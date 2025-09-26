'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface RegistrationDetails {
  sessionId?: string;
  profileId?: string;
  paymentStatus?: string;
  customerEmail?: string;
  planTitle?: string;
  amount?: number;
  firstName?: string;
  lastName?: string;
  role?: string;
  paymentMethod?: string;
}

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams();
  const [registrationDetails, setRegistrationDetails] = useState<RegistrationDetails>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrationDetails = async () => {
      // Get URL parameters
      const sessionId = searchParams.get('session_id');
      const profileId = searchParams.get('profile_id');
      const paymentStatus = searchParams.get('payment_status');
      const customerEmail = searchParams.get('email');
      const planTitle = searchParams.get('plan');
      const amount = searchParams.get('amount');

      let details: RegistrationDetails = {
        sessionId,
        profileId,
        paymentStatus,
        customerEmail,
        planTitle,
        amount: amount ? parseFloat(amount) : undefined
      };

      // Try to fetch additional details from API
      if (sessionId || profileId) {
        try {
          const params = new URLSearchParams();
          if (sessionId) params.append('session_id', sessionId);
          if (profileId) params.append('profile_id', profileId);

          const response = await fetch(`/api/registration/success?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
              // Merge session data
              if (data.sessionData) {
                details = {
                  ...details,
                  paymentStatus: data.sessionData.paymentStatus || details.paymentStatus,
                  customerEmail: data.sessionData.customerEmail || details.customerEmail,
                  amount: data.sessionData.amountTotal || details.amount,
                  paymentMethod: data.sessionData.paymentMethod,
                  planTitle: data.sessionData.metadata?.planTitle || details.planTitle
                };
              }
              
              // Merge profile data
              if (data.profileData) {
                details = {
                  ...details,
                  firstName: data.profileData.firstName,
                  lastName: data.profileData.lastName,
                  customerEmail: data.profileData.email || details.customerEmail,
                  role: data.profileData.role,
                  planTitle: data.profileData.selectedPlan?.title || details.planTitle
                };
              }
            }
          }
        } catch (error) {
          console.error('Error fetching registration details:', error);
          // Continue with URL parameters only
        }
      }

      setRegistrationDetails(details);
      setLoading(false);
    };

    fetchRegistrationDetails();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Processing your registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link href="/" className="navbar-brand fw-bold">
            All Pro Sports NC
          </Link>
        </div>
      </nav>

      {/* Success Content */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            
            {/* Success Card */}
            <div className="card shadow-lg border-0 mb-4">
              <div className="card-body text-center py-5">
                
                {/* Success Icon */}
                <div className="mb-4">
                  <div className="success-icon mx-auto mb-3" style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#28a745',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-check text-white" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <h1 className="text-success fw-bold mb-2">Registration Complete!</h1>
                  <p className="text-muted lead">
                    {registrationDetails.firstName && registrationDetails.lastName ? (
                      <>Thank you, {registrationDetails.firstName} {registrationDetails.lastName}!</>
                    ) : (
                      'Thank you for registering with All Pro Sports NC'
                    )}
                  </p>
                  {registrationDetails.role && (
                    <p className="text-muted">
                      <i className="fas fa-user-tag me-1"></i>
                      Registered as: <strong>{registrationDetails.role}</strong>
                    </p>
                  )}
                </div>

                {/* Registration Details */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="card bg-light border-0 h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-user-check text-primary me-2"></i>
                          <h6 className="mb-0 fw-semibold">Registration Status</h6>
                        </div>
                        <p className="text-success mb-0 fw-bold">
                          <i className="fas fa-check-circle me-1"></i>
                          Successfully Processed
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card bg-light border-0 h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-credit-card text-primary me-2"></i>
                          <h6 className="mb-0 fw-semibold">Payment Status</h6>
                        </div>
                        <p className="text-success mb-0 fw-bold">
                          <i className="fas fa-check-circle me-1"></i>
                          Payment Confirmed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                {registrationDetails.planTitle && (
                  <div className="card bg-primary bg-opacity-10 border-primary mb-4">
                    <div className="card-body">
                      <h6 className="text-primary mb-2">
                        <i className="fas fa-clipboard-list me-2"></i>
                        Registration Plan
                      </h6>
                      <p className="mb-1 fw-semibold">{registrationDetails.planTitle}</p>
                      {registrationDetails.amount && (
                        <p className="text-muted mb-0">Amount: ${registrationDetails.amount.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Email Confirmation */}
                <div className="alert alert-info border-0 mb-4">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-envelope text-info me-3 mt-1"></i>
                    <div className="text-start">
                      <h6 className="alert-heading mb-2">Check Your Email</h6>
                      <p className="mb-2">
                        We've sent a confirmation email with important information including:
                      </p>
                      <ul className="mb-2 ps-3">
                        <li>Registration confirmation details</li>
                        <li>QR codes for easy check-in</li>
                        <li>Contact information and emergency forms</li>
                        <li>Next steps and important dates</li>
                        <li>PDF copy of your registration</li>
                      </ul>
                      {registrationDetails.customerEmail && (
                        <p className="mb-0">
                          <strong>Email sent to:</strong> {registrationDetails.customerEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="card border-warning bg-warning bg-opacity-10 mb-4">
                  <div className="card-body">
                    <h6 className="text-warning-emphasis mb-3">
                      <i className="fas fa-list-check me-2"></i>
                      What's Next?
                    </h6>
                    <div className="row g-3 text-start">
                      <div className="col-md-6">
                        <div className="d-flex">
                          <span className="badge bg-warning text-dark me-2 mt-1">1</span>
                          <small>Check your email for confirmation and QR codes</small>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex">
                          <span className="badge bg-warning text-dark me-2 mt-1">2</span>
                          <small>Save the QR codes for easy event check-in</small>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex">
                          <span className="badge bg-warning text-dark me-2 mt-1">3</span>
                          <small>Complete any required medical forms</small>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex">
                          <span className="badge bg-warning text-dark me-2 mt-1">4</span>
                          <small>Mark your calendar for upcoming events</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="card border-info bg-info bg-opacity-10 mb-4">
                  <div className="card-body">
                    <h6 className="text-info-emphasis mb-3">
                      <i className="fas fa-headset me-2"></i>
                      Need Help?
                    </h6>
                    <div className="row g-3 text-start">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-phone text-info me-2"></i>
                          <div>
                            <small className="text-muted d-block">Phone</small>
                            <small className="fw-semibold">(555) 123-4567</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-envelope text-info me-2"></i>
                          <div>
                            <small className="text-muted d-block">Email</small>
                            <small className="fw-semibold">support@allprosportsnc.com</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                  <Link href="/" className="btn btn-primary btn-lg">
                    <i className="fas fa-home me-2"></i>
                    Return to Home
                  </Link>
                  <Link href="/registration" className="btn btn-outline-primary btn-lg">
                    <i className="fas fa-plus me-2"></i>
                    Register Another Person
                  </Link>
                </div>

                {/* Session Details (for debugging) */}
                {registrationDetails.sessionId && (
                  <div className="mt-4 pt-4 border-top">
                    <small className="text-muted">
                      Registration ID: {registrationDetails.sessionId}
                    </small>
                  </div>
                )}

              </div>
            </div>

            {/* Additional Information */}
            <div className="card border-0 bg-transparent">
              <div className="card-body text-center">
                <h6 className="text-muted mb-3">Important Reminders</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="text-center">
                      <i className="fas fa-qrcode text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                      <p className="small mb-0">
                        <strong>QR Codes</strong><br/>
                        Use for quick check-in at events
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <i className="fas fa-file-medical text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                      <p className="small mb-0">
                        <strong>Medical Forms</strong><br/>
                        Complete before first practice
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <i className="fas fa-calendar text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                      <p className="small mb-0">
                        <strong>Schedule</strong><br/>
                        Check email for event dates
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">
            © 2024 All Pro Sports NC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
