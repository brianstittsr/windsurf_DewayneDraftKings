'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ModernNavbar from '@/components/ModernNavbar';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const registrationParam = searchParams.get('registration');
    
    if (registrationParam) {
      try {
        const data = JSON.parse(decodeURIComponent(registrationParam));
        setRegistrationData(data);
      } catch (error) {
        console.error('Error parsing registration data:', error);
        setError('Invalid registration data. Please start over.');
      }
    } else {
      setError('No registration data found. Please complete registration first.');
    }
  }, [searchParams]);

  const calculateTotal = () => {
    if (!registrationData?.selectedPlan) return 0;
    
    const plan = registrationData.selectedPlan;
    const basePrice = plan.pricing?.finalAmount || plan.price || 0;
    const serviceFee = 3.00; // Standard service fee
    
    return basePrice + serviceFee;
  };

  const handlePayment = async (paymentMethod: string) => {
    setIsProcessing(true);
    setError('');

    try {
      const paymentData = {
        amount: calculateTotal(),
        currency: 'usd',
        paymentMethod: paymentMethod,
        registrationData: registrationData,
        planData: registrationData.selectedPlan
      };

      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        throw new Error(result.error || 'Payment setup failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment setup failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <>
        <ModernNavbar />
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card">
                <div className="card-body text-center">
                  <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                  <h4>Error</h4>
                  <p className="text-muted">{error}</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => router.push('/register')}
                  >
                    Return to Registration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!registrationData) {
    return (
      <>
        <ModernNavbar />
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading checkout...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const plan = registrationData.selectedPlan;
  const total = calculateTotal();

  return (
    <>
      <ModernNavbar />
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="row">
              {/* Order Summary */}
              <div className="col-lg-5 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-receipt me-2"></i>
                      Order Summary
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <h6>Participant Information</h6>
                      <p className="mb-1"><strong>{registrationData.firstName} {registrationData.lastName}</strong></p>
                      <p className="mb-1 text-muted">{registrationData.email}</p>
                      <p className="mb-1 text-muted">{registrationData.phone}</p>
                      <span className="badge bg-info">{registrationData.role === 'player' ? 'Player' : 'Coach'}</span>
                    </div>

                    <hr />

                    <div className="mb-3">
                      <h6>Selected Plan</h6>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <p className="mb-1"><strong>{plan?.title}</strong></p>
                          <p className="mb-0 text-muted small">{plan?.subtitle}</p>
                        </div>
                        <span className="fw-bold">${(plan?.pricing?.finalAmount || plan?.price || 0).toFixed(2)}</span>
                      </div>
                      
                      {plan?.appliedCoupon && (
                        <div className="mt-2 p-2 bg-success bg-opacity-10 rounded">
                          <small className="text-success">
                            <i className="fas fa-tag me-1"></i>
                            Coupon Applied: {plan.appliedCoupon.code}
                            <span className="float-end">-${plan.pricing?.discount?.toFixed(2)}</span>
                          </small>
                        </div>
                      )}
                    </div>

                    <hr />

                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span>Subtotal:</span>
                        <span>${(plan?.pricing?.finalAmount || plan?.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Service Fee:</span>
                        <span>$3.00</span>
                      </div>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between fs-5 fw-bold">
                      <span>Total:</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="col-lg-7">
                <div className="card">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-credit-card me-2"></i>
                      Payment Options
                    </h5>
                  </div>
                  <div className="card-body">
                    {/* Credit/Debit Card */}
                    <div className="payment-option mb-4">
                      <div 
                        className={`card payment-card ${selectedPaymentMethod === 'card' ? 'selected' : ''}`}
                        onClick={() => setSelectedPaymentMethod('card')}
                      >
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              value="card"
                              checked={selectedPaymentMethod === 'card'}
                              onChange={() => setSelectedPaymentMethod('card')}
                              className="form-check-input me-3"
                            />
                            <div className="flex-grow-1">
                              <h6 className="mb-1">Credit / Debit Card</h6>
                              <p className="mb-0 text-muted small">Pay securely with your credit or debit card</p>
                            </div>
                            <div className="payment-icons">
                              <i className="fab fa-cc-visa fa-2x text-primary me-2"></i>
                              <i className="fab fa-cc-mastercard fa-2x text-warning me-2"></i>
                              <i className="fab fa-cc-amex fa-2x text-info"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h6 className="text-muted">Buy Now, Pay Later Options</h6>
                    </div>

                    {/* Klarna */}
                    <div className="payment-option mb-3">
                      <div 
                        className={`card payment-card ${selectedPaymentMethod === 'klarna' ? 'selected' : ''}`}
                        onClick={() => setSelectedPaymentMethod('klarna')}
                      >
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              value="klarna"
                              checked={selectedPaymentMethod === 'klarna'}
                              onChange={() => setSelectedPaymentMethod('klarna')}
                              className="form-check-input me-3"
                            />
                            <div className="flex-grow-1">
                              <h6 className="mb-1">
                                <span className="text-primary fw-bold">Klarna</span>
                              </h6>
                              <p className="mb-0 text-muted small">
                                Pay in 4 interest-free installments of ${(total / 4).toFixed(2)}
                              </p>
                            </div>
                            <div className="klarna-logo">
                              <span className="badge bg-primary">Klarna</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Affirm */}
                    <div className="payment-option mb-4">
                      <div 
                        className={`card payment-card ${selectedPaymentMethod === 'affirm' ? 'selected' : ''}`}
                        onClick={() => setSelectedPaymentMethod('affirm')}
                      >
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              value="affirm"
                              checked={selectedPaymentMethod === 'affirm'}
                              onChange={() => setSelectedPaymentMethod('affirm')}
                              className="form-check-input me-3"
                            />
                            <div className="flex-grow-1">
                              <h6 className="mb-1">
                                <span className="text-info fw-bold">Affirm</span>
                              </h6>
                              <p className="mb-0 text-muted small">
                                Flexible monthly payments as low as ${(total / 12).toFixed(2)}/mo
                              </p>
                            </div>
                            <div className="affirm-logo">
                              <span className="badge bg-info">Affirm</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Button */}
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-success btn-lg"
                        onClick={() => handlePayment(selectedPaymentMethod)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-lock me-2"></i>
                            {selectedPaymentMethod === 'card' && 'Pay Securely'}
                            {selectedPaymentMethod === 'klarna' && 'Continue with Klarna'}
                            {selectedPaymentMethod === 'affirm' && 'Continue with Affirm'}
                          </>
                        )}
                      </button>
                      
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => router.back()}
                        disabled={isProcessing}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Registration
                      </button>
                    </div>

                    <div className="mt-3 text-center">
                      <small className="text-muted">
                        <i className="fas fa-shield-alt me-1"></i>
                        Your payment information is secure and encrypted
                      </small>
                    </div>
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
