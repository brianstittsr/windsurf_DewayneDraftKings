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

    if (!playerId) {
      setError('Player ID is required');
      setLoading(false);
      return;
    }

    // For now, create a mock profile based on the plan
    // In a real implementation, you would fetch the profile from the API
    const mockProfile: PlayerProfile = {
      id: playerId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      selectedPlan: {
        plan: plan || 'jamboree_and_season',
        title: 'Complete Season Package',
        price: 88.50,
        serviceFee: 3.00,
        category: 'player',
        total: 91.50
      }
    };

    setPlayerProfile(mockProfile);
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
      
      <div className="container mt-5 pt-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Registration Summary */}
            <div className="card mb-4 border-success">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fas fa-check-circle me-2"></i>
                  Registration Complete - Ready for Payment
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-success mb-2">Participant Information</h6>
                    <p className="mb-1"><strong>Name:</strong> {playerProfile.firstName} {playerProfile.lastName}</p>
                    <p className="mb-1"><strong>Email:</strong> {playerProfile.email}</p>
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
                    planTitle={playerProfile.selectedPlan.title}
                    planPrice={playerProfile.selectedPlan.price}
                    serviceFee={playerProfile.selectedPlan.serviceFee}
                    totalAmount={playerProfile.selectedPlan.total}
                    planType={playerProfile.selectedPlan.plan}
                    customerInfo={{
                      name: `${playerProfile.firstName} ${playerProfile.lastName}`,
                      email: playerProfile.email,
                      playerId: playerProfile.id
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
                  <li>Call us at <strong>(555) 123-4567</strong></li>
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
