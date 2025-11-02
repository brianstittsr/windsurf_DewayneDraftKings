'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ModernNavbar from '../../components/ModernNavbar';
import PaymentCheckout from '../../components/PaymentCheckout';

interface PlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  selectedPlan?: {
    plan: string;
    title: string;
    price: number;
    serviceFee: number;
    category: string;
    total: number;
  };
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const playerId = searchParams.get('playerId');
    const plan = searchParams.get('plan');
    const title = searchParams.get('title');
    const price = searchParams.get('price');
    const category = searchParams.get('category');

    if (!playerId) {
      setError('Player ID is required');
      setLoading(false);
      return;
    }

    // Get pricing from URL parameters (passed from registration)
    const planPrice = price ? parseFloat(price) : 0;
    
    // Try to get real profile data from the registration API response
    // For now, use URL parameters since we simplified the registration API
    const firstName = searchParams.get('firstName') || 'User';
    const lastName = searchParams.get('lastName') || '';
    const email = searchParams.get('email') || '';
    
    const profile: PlayerProfile = {
      id: playerId,
      firstName,
      lastName,
      email,
      selectedPlan: {
        plan: plan || 'jamboree',
        title: title || 'Registration Plan',
        price: planPrice,
        serviceFee: 0, // Service fee already included in price
        category: category || 'player',
        total: planPrice // Price already includes everything
      }
    };

    setPlayerProfile(profile);
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <>
        <ModernNavbar />
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading checkout...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ModernNavbar />
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-danger">
                <div className="card-header bg-danger text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Checkout Error
                  </h5>
                </div>
                <div className="card-body">
                  <p className="mb-3">{error}</p>
                  <a href="/register" className="btn btn-primary">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Registration
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!playerProfile) {
    return (
      <>
        <ModernNavbar />
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-warning">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="fas fa-user-times me-2"></i>
                    Profile Not Found
                  </h5>
                </div>
                <div className="card-body">
                  <p className="mb-3">We couldn't find your registration profile. Please try registering again.</p>
                  <a href="/register" className="btn btn-primary">
                    <i className="fas fa-user-plus me-2"></i>
                    Start Registration
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ModernNavbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Registration Summary */}
            <div className="card border-success mb-4">
              <div className="card-header bg-success text-white">
                <h4 className="mb-0">
                  <i className="fas fa-check-circle me-2"></i>
                  Registration Complete - Ready for Payment
                </h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-success mb-2">Participant Information</h6>
                    <p className="mb-1"><strong>Name:</strong> {playerProfile.firstName} {playerProfile.lastName}</p>
                    <p className="mb-0"><strong>Player ID:</strong> {playerProfile.id}</p>
                  </div>
                  <div className="col-md-6">
                    {playerProfile.selectedPlan && (
                      <>
                        <h6 className="text-success mb-2">Selected Plan</h6>
                        <p className="mb-1"><strong>Plan:</strong> {playerProfile.selectedPlan.title}</p>
                        <p className="mb-1"><strong>Category:</strong> {playerProfile.selectedPlan.category}</p>
                        <p className="mb-0"><strong>Total:</strong> ${playerProfile.selectedPlan.total.toFixed(2)}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">
                  <i className="fas fa-credit-card me-2"></i>
                  Complete Your Payment
                </h4>
              </div>
              <div className="card-body">
                {playerProfile.selectedPlan && (
                  <PaymentCheckout
                    planData={{
                      title: playerProfile.selectedPlan.title,
                      pricing: {
                        price: playerProfile.selectedPlan.price,
                        serviceFee: playerProfile.selectedPlan.serviceFee,
                        total: playerProfile.selectedPlan.total
                      },
                      itemType: playerProfile.selectedPlan.plan,
                      category: playerProfile.selectedPlan.category
                    }}
                    customerData={{
                      firstName: playerProfile.firstName,
                      lastName: playerProfile.lastName,
                      email: playerProfile.email,
                      phone: '+1-555-0123', // Default phone, should come from registration
                      playerId: playerProfile.id
                    }}
                    onPaymentSuccess={() => {
                      window.location.href = '/registration-success';
                    }}
                    onPaymentError={(error) => {
                      console.error('Payment error details:', error);
                      alert('Payment failed: ' + error);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="card mt-4 border-info">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-question-circle me-2"></i>
                  Need Help?
                </h6>
              </div>
              <div className="card-body">
                <p className="mb-2">If you're experiencing issues with payment or have questions:</p>
                <ul className="mb-3">
                  <li>Contact us at <strong>info@allprosportsnc.com</strong></li>
                  <li>Visit our facility at <strong>All Pro Sports Complex</strong></li>
                </ul>
                <div className="d-flex gap-2">
                  <a href="/register" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1"></i>
                    Back to Registration
                  </a>
                  <a href="/pricing" className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-list me-1"></i>
                    View All Plans
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <>
        <ModernNavbar />
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading checkout...</p>
            </div>
          </div>
        </div>
      </>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
