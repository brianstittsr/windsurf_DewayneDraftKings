'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

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

interface CouponData {
  code: string;
  type: 'percentage' | 'fixed_amount' | 'set_price';
  value: number;
  discount: number;
  isValid: boolean;
}

// Credit Card Form Component
function CreditCardForm({ onPaymentSuccess, onPaymentError, planData, customerData, appliedCoupon }: {
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  planData: any;
  customerData: any;
  appliedCoupon: CouponData | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent
      const amount = Math.round((planData?.pricing?.total || planData?.price || 0) * 100);
      
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'usd',
          description: `All Pro Sports - ${planData?.title || 'Registration'}`,
          customerEmail: customerData.email,
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          appliedCoupon: appliedCoupon?.code || null,
          metadata: {
            planTitle: planData?.title,
            planType: planData?.itemType,
            customerPhone: customerData.phone
          }
        })
      });

      const { clientSecret, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${customerData.firstName} ${customerData.lastName}`,
            email: customerData.email,
            phone: customerData.phone
          }
        }
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        onPaymentSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card border-light mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0 fw-semibold">
            <i className="fas fa-credit-card me-2"></i>
            Credit Card Information
          </h6>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Card Details</label>
            <div className="p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="d-grid">
        <button
          type="submit"
          className="btn btn-success btn-lg py-3"
          disabled={!stripe || processing}
        >
          {processing ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <i className="fas fa-lock me-2"></i>
              Pay ${planData?.pricing?.total?.toFixed(2) || planData?.price?.toFixed(2)} Securely
            </>
          )}
        </button>
      </div>
    </form>
  );
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
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [originalPlanData, setOriginalPlanData] = useState(planData);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    setOriginalPlanData(planData);
    
    // Check if Stripe is properly loaded
    stripePromise.then((stripe) => {
      if (stripe) {
        setStripeLoaded(true);
        console.log('Stripe loaded successfully');
      } else {
        console.error('Failed to load Stripe. Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
      }
    });
  }, []);

  // Coupon validation function
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          orderAmount: originalPlanData?.pricing?.subtotal || originalPlanData?.price || 0,
          applicableItems: [originalPlanData?.itemType || 'registration']
        })
      });

      const result = await response.json();

      if (result.success && result.coupon) {
        const couponData: CouponData = {
          code: result.coupon.code,
          type: result.coupon.discountType,
          value: result.coupon.discountValue,
          discount: result.discount,
          isValid: true
        };
        
        setAppliedCoupon(couponData);
        
        // For set_price coupons, the final amount should be the coupon value plus service fee
        // For other coupon types, apply discount to subtotal then add service fee
        let newTotal;
        if (couponData.type === 'set_price') {
          newTotal = result.finalAmount + (originalPlanData.serviceFee || 0);
        } else {
          newTotal = Math.max(0, result.finalAmount + (originalPlanData.serviceFee || 0));
        }
        
        // Update plan data with discount
        const updatedPlanData = {
          ...originalPlanData,
          pricing: {
            ...originalPlanData.pricing,
            discount: result.discount,
            total: newTotal
          },
          appliedCoupon: couponData
        };
        
        // Update parent component with new pricing
        Object.assign(planData, updatedPlanData);
        
        setCouponCode('');
      } else {
        setCouponError(result.error || 'Invalid coupon code');
      }
    } catch (error) {
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    
    // Restore original pricing
    const restoredPlanData = {
      ...originalPlanData,
      pricing: {
        ...originalPlanData.pricing,
        discount: 0,
        total: (originalPlanData.pricing?.subtotal || originalPlanData.price) + (originalPlanData.serviceFee || 0)
      },
      appliedCoupon: null
    };
    
    Object.assign(planData, restoredPlanData);
  };

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
          appliedCoupon: appliedCoupon?.code || null,
          metadata: {
            planTitle: planData?.title,
            planType: planData?.itemType,
            customerPhone: customerData.phone,
            appliedCoupon: appliedCoupon?.code || null,
            originalAmount: Math.round((originalPlanData?.pricing?.subtotal || originalPlanData?.price || 0) * 100),
            discountAmount: appliedCoupon ? Math.round(appliedCoupon.discount * 100) : 0
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
      {/* Coupon Code Section */}
      <div className="card border-info mb-4">
        <div className="card-header bg-info bg-opacity-10">
          <h6 className="mb-0 fw-semibold text-info">
            <i className="fas fa-tag me-2"></i>
            Coupon Code
          </h6>
        </div>
        <div className="card-body">
          {!appliedCoupon ? (
            <div className="row g-2">
              <div className="col">
                <input
                  type="text"
                  className={`form-control ${couponError ? 'is-invalid' : ''}`}
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError('');
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      validateCoupon();
                    }
                  }}
                  disabled={couponLoading}
                />
                {couponError && (
                  <div className="invalid-feedback">
                    {couponError}
                  </div>
                )}
              </div>
              <div className="col-auto">
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={validateCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                >
                  {couponLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                      Validating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Apply
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex justify-content-between align-items-center p-3 bg-success bg-opacity-10 rounded">
              <div>
                <div className="fw-bold text-success">
                  <i className="fas fa-check-circle me-2"></i>
                  Coupon Applied: {appliedCoupon.code}
                </div>
                <small className="text-muted">
                  {appliedCoupon.type === 'percentage' && `${appliedCoupon.value}% discount`}
                  {appliedCoupon.type === 'fixed_amount' && `$${appliedCoupon.value} off`}
                  {appliedCoupon.type === 'set_price' && `Set price: $${appliedCoupon.value}`}
                  {' - '}You save ${appliedCoupon.discount.toFixed(2)}
                </small>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={removeCoupon}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>
      </div>

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

      {/* Credit Card Form */}
      {selectedPaymentMethod === 'card' && (
        <div>
          {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
            <div className="card border-danger mb-4">
              <div className="card-body text-center py-4">
                <i className="fas fa-exclamation-triangle fa-2x text-danger mb-3"></i>
                <h6 className="text-danger">Stripe Configuration Missing</h6>
                <p className="text-muted mb-3">
                  Please add your Stripe publishable key to <code>.env.local</code>:
                </p>
                <code className="bg-light p-2 rounded d-block">
                  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
                </code>
                <small className="text-muted mt-2 d-block">
                  Restart the server after adding the key
                </small>
              </div>
            </div>
          ) : !stripeLoaded ? (
            <div className="card border-light mb-4">
              <div className="card-body text-center py-4">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading secure payment form...</p>
              </div>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <CreditCardForm
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
                planData={planData}
                customerData={customerData}
                appliedCoupon={appliedCoupon}
              />
            </Elements>
          )}
        </div>
      )}

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

      {/* BNPL Payment Button */}
      {selectedPaymentMethod !== 'card' && (
        <div className="d-grid">
          <button
            className="btn btn-success btn-lg py-3"
            onClick={handlePayment}
            disabled={
              loading || 
              bnplAccountStatus[selectedPaymentMethod] !== true
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
                Pay ${planData?.pricing?.total?.toFixed(2) || planData?.price?.toFixed(2)} with {selectedPaymentMethod === 'klarna' ? 'Klarna' : 'Affirm'}
              </>
            )}
          </button>
        </div>
      )}

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
