'use client';

import { useState } from 'react';

interface PaymentCheckoutProps {
  planData: any;
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentCheckout({ 
  planData, 
  customerData, 
  onPaymentSuccess, 
  onPaymentError 
}: PaymentCheckoutProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'klarna' | 'affirm'>('card');
  const [loading, setLoading] = useState(false);
  const [bnplAccountStatus, setBnplAccountStatus] = useState<{
    klarna: boolean | null;
    affirm: boolean | null;
  }>({
    klarna: null,
    affirm: null
  });

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const amount = Math.round((planData?.pricing?.total || planData?.price || 0) * 100); // Convert to cents
      
      const checkoutResponse = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'usd',
          description: `All Pro Sports - ${planData?.title || 'Registration'}`,
          customerEmail: customerData.email,
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          paymentMethod: selectedPaymentMethod,
          metadata: {
            planTitle: planData?.title,
            planType: planData?.itemType,
            customerPhone: customerData.phone,
            appliedCoupon: planData?.appliedCoupon?.code || null
          },
          paymentMethods: selectedPaymentMethod === 'card' ? ['card'] : [selectedPaymentMethod],
          successUrl: `${window.location.origin}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/register?cancelled=true`
        })
      });

      const checkoutData = await checkoutResponse.json();
      
      if (checkoutData.success && checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error(checkoutData.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBnplAccountCheck = (provider: 'klarna' | 'affirm', hasAccount: boolean) => {
    setBnplAccountStatus(prev => ({
      ...prev,
      [provider]: hasAccount
    }));
  };

  const renderPaymentMethodCard = (
    method: 'card' | 'klarna' | 'affirm',
    icon: string,
    title: string,
    description: string,
    color: string
  ) => (
    <div
      className={`card h-100 border-2 position-relative ${
        selectedPaymentMethod === method ? `border-${color} bg-${color} bg-opacity-5` : 'border-light'
      }`}
      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
      onClick={() => setSelectedPaymentMethod(method)}
    >
      {selectedPaymentMethod === method && (
        <div className="position-absolute top-0 end-0 m-2">
          <i className={`fas fa-check-circle text-${color}`}></i>
        </div>
      )}
      <div className="card-body text-center p-4">
        <div className={`bg-${color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} style={{width: '60px', height: '60px'}}>
          <i className={`${icon} fa-lg text-${color}`}></i>
        </div>
        <h6 className="fw-bold mb-2">{title}</h6>
        <p className="text-muted small mb-0">{description}</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Plan Summary */}
      {planData && (
        <div className="card border-primary mb-4">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0 fw-semibold">
              <i className="fas fa-receipt me-2"></i>
              Payment Summary
            </h6>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-1">{planData.title}</h6>
                <p className="text-muted mb-0">{planData.subtitle}</p>
              </div>
              <div className="text-end">
                <div className="h5 mb-0 text-success">
                  ${planData.pricing?.total?.toFixed(2) || planData.price?.toFixed(2)}
                </div>
                {planData.appliedCoupon && (
                  <small className="text-success">
                    <i className="fas fa-tag me-1"></i>
                    {planData.appliedCoupon.code} applied
                  </small>
                )}
              </div>
            </div>
            
            {planData.pricing && (
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between text-muted small">
                  <span>Subtotal:</span>
                  <span>${planData.pricing.subtotal?.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>Service Fee:</span>
                  <span>${planData.serviceFee?.toFixed(2)}</span>
                </div>
                {planData.pricing.discount > 0 && (
                  <div className="d-flex justify-content-between text-success small">
                    <span>Discount:</span>
                    <span>-${planData.pricing.discount?.toFixed(2)}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total:</span>
                  <span className="text-success">${planData.pricing.total?.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="mb-4">
        <h6 className="fw-semibold mb-3">Select Payment Method</h6>
        <div className="row g-3">
          <div className="col-md-4">
            {renderPaymentMethodCard(
              'card',
              'fas fa-credit-card',
              'Credit/Debit Card',
              'Pay with Visa, Mastercard, or American Express',
              'primary'
            )}
          </div>
          <div className="col-md-4">
            {renderPaymentMethodCard(
              'klarna',
              'fab fa-klarna',
              'Klarna',
              'Buy now, pay later in 4 interest-free installments',
              'warning'
            )}
          </div>
          <div className="col-md-4">
            {renderPaymentMethodCard(
              'affirm',
              'fas fa-calendar-check',
              'Affirm',
              'Flexible payment plans with transparent terms',
              'info'
            )}
          </div>
        </div>
      </div>

      {/* BNPL Account Verification */}
      {(selectedPaymentMethod === 'klarna' || selectedPaymentMethod === 'affirm') && (
        <div className="card border-warning mb-4">
          <div className="card-header bg-warning bg-opacity-10">
            <h6 className="mb-0 fw-semibold text-warning">
              <i className="fas fa-info-circle me-2"></i>
              {selectedPaymentMethod === 'klarna' ? 'Klarna' : 'Affirm'} Account Required
            </h6>
          </div>
          <div className="card-body">
            <p className="mb-3">
              Do you have a {selectedPaymentMethod === 'klarna' ? 'Klarna' : 'Affirm'} account?
            </p>
            
            <div className="d-flex gap-3 mb-3">
              <button
                className={`btn ${
                  bnplAccountStatus[selectedPaymentMethod] === true 
                    ? 'btn-success' 
                    : 'btn-outline-success'
                }`}
                onClick={() => handleBnplAccountCheck(selectedPaymentMethod, true)}
              >
                <i className="fas fa-check me-2"></i>
                Yes, I have an account
              </button>
              <button
                className={`btn ${
                  bnplAccountStatus[selectedPaymentMethod] === false 
                    ? 'btn-danger' 
                    : 'btn-outline-danger'
                }`}
                onClick={() => handleBnplAccountCheck(selectedPaymentMethod, false)}
              >
                <i className="fas fa-times me-2"></i>
                No, I need to create one
              </button>
            </div>

            {bnplAccountStatus[selectedPaymentMethod] === false && (
              <div className="alert alert-info">
                <h6 className="alert-heading">
                  <i className="fas fa-external-link-alt me-2"></i>
                  Create Your {selectedPaymentMethod === 'klarna' ? 'Klarna' : 'Affirm'} Account
                </h6>
                <p className="mb-3">
                  You'll need to create a {selectedPaymentMethod === 'klarna' ? 'Klarna' : 'Affirm'} account 
                  before you can use this payment method. This usually takes just a few minutes.
                </p>
                <div className="d-flex gap-2">
                  <a
                    href={
                      selectedPaymentMethod === 'klarna' 
                        ? 'https://www.klarna.com/us/customer-service/how-to-create-a-klarna-account/'
                        : 'https://www.affirm.com/'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fas fa-external-link-alt me-2"></i>
                    Create {selectedPaymentMethod === 'klarna' ? 'Klarna' : 'Affirm'} Account
                  </a>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setSelectedPaymentMethod('card')}
                  >
                    Use Credit Card Instead
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Button */}
      <div className="d-grid">
        <button
          className="btn btn-success btn-lg py-3"
          onClick={handlePayment}
          disabled={
            loading || 
            (selectedPaymentMethod !== 'card' && bnplAccountStatus[selectedPaymentMethod] !== true)
          }
        >
          {loading ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
              Processing...
            </>
          ) : (
            <>
              <i className="fas fa-lock me-2"></i>
              Pay ${planData?.pricing?.total?.toFixed(2) || planData?.price?.toFixed(2)} Securely
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="text-center mt-3">
        <small className="text-muted d-flex align-items-center justify-content-center">
          <i className="fas fa-shield-alt me-2 text-success"></i>
          Your payment information is encrypted and secure. Powered by Stripe.
        </small>
      </div>
    </div>
  );
}
