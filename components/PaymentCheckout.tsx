'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import dynamic from 'next/dynamic';

type CouponData = {
  code: string;
  type: string;
  value: number;
  discount: number;
  isValid?: boolean;
};

type PaymentMethod = 'card' | 'klarna' | 'affirm' | 'google_pay' | 'apple_pay' | 'cashapp' | 'amazon_pay';

interface BnplAccountStatus {
  klarna: boolean | null;
  affirm: boolean | null;
}

interface StripePaymentFormProps {
  planData: any;
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    playerId?: string;
  };
  onPaymentSuccess: (paymentIntent?: any) => void;
  onPaymentError: (error: string) => void;
  appliedCoupon: CouponData | null;
  selectedPaymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  couponLoading: boolean;
  setCouponLoading: (loading: boolean) => void;
  couponError: string;
  setCouponError: (error: string) => void;
  setAppliedCoupon: (coupon: CouponData | null) => void;
  bnplAccountStatus: BnplAccountStatus;
  setBnplAccountStatus: (status: BnplAccountStatus) => void;
}

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// Check if Stripe is configured
const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Dynamically import StripePaymentForm to avoid SSR issues
const StripePaymentForm = dynamic<StripePaymentFormProps>(
  () => import('./StripePaymentForm') as any,
  { ssr: false }
);

interface PaymentCheckoutProps {
  planData: any;
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    playerId?: string;
  };
  onPaymentSuccess: (paymentIntent?: any) => void;
  onPaymentError: (error: string) => void;
  appliedCoupon?: CouponData | null;
}

export default function PaymentCheckout({
  planData,
  customerData,
  onPaymentSuccess,
  onPaymentError,
  appliedCoupon = null,
}: PaymentCheckoutProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponState, setAppliedCouponState] = useState<CouponData | null>(appliedCoupon);
  const [originalPlanData, setOriginalPlanData] = useState(planData);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [bnplAccountStatus, setBnplAccountStatus] = useState<BnplAccountStatus>({
    klarna: null,
    affirm: null
  });

  // Initialize component
  useEffect(() => {
    // Store the original plan data when component mounts
    setOriginalPlanData(planData);
    
    if (stripePromise) {
      stripePromise.then(() => setStripeLoaded(true));
    }
  }, []);

  // Update applied coupon when prop changes
  useEffect(() => {
    setAppliedCouponState(appliedCoupon);
  }, [appliedCoupon]);

  // Handle payment method change
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    // Reset any existing payment form state when changing methods
    setLoading(false);
    setCouponError('');
  };

  // Handle BNPL account status change
  const handleBnplAccountCheck = (provider: 'klarna' | 'affirm', hasAccount: boolean) => {
    setBnplAccountStatus(prev => ({
      ...prev,
      [provider]: hasAccount
    }));
  };

  // Handle coupon form submission
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      await validateCoupon(couponCode);
    }
  };

  // Render payment method card with selection state
  const renderPaymentMethodCard = (
    method: PaymentMethod,
    icon: string,
    title: string,
    description: string,
    color: string
  ) => {
    const isSelected = selectedPaymentMethod === method;
    return (
      <div 
        className={`card payment-method-card ${isSelected ? 'border-primary shadow-sm' : 'border-light'}`}
        onClick={() => handlePaymentMethodChange(method)}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          borderWidth: isSelected ? '2px' : '1px',
          backgroundColor: isSelected ? 'rgba(13, 110, 253, 0.05)' : 'white'
        }}
      >
        <div className="card-body text-center">
          <div className={`icon-xxl mb-3 ${isSelected ? `text-${color}` : 'text-muted'}`}>
            <i className={`${icon} fa-2x`}></i>
          </div>
          <h5 className={`mb-1 ${isSelected ? 'text-primary fw-bold' : ''}`}>{title}</h5>
          <p className="mb-0 text-muted">{description}</p>
          {isSelected && (
            <div className="mt-2">
              <span className="badge bg-primary">
                <i className="fas fa-check-circle me-1"></i> Selected
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Check if Stripe is configured
  if (!isStripeConfigured) {
    const currentKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'Not set';
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = process.env.VERCEL === '1';
    
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <div className="d-flex align-items-center">
            <i className="fas fa-exclamation-triangle me-3" style={{ fontSize: '2rem' }}></i>
            <div>
              <h5 className="alert-heading">Stripe Configuration Missing</h5>
              <p className="mb-2">
                <strong>Environment:</strong> {isProduction ? 'Production' : 'Development'} 
                {isVercel && ' (Vercel)'}
              </p>
              <p className="mb-2">
                <strong>Stripe Key:</strong> {currentKey}
              </p>
              
              {isProduction ? (
                <div className="alert alert-warning mt-3">
                  <strong>Production Setup Required:</strong>
                  <ol className="mb-0 mt-2">
                    <li>Add Stripe publishable key to your environment variables</li>
                    <li>Redeploy your application</li>
                  </ol>
                </div>
              ) : (
                <div className="alert alert-info mt-3">
                  <strong>Local Development Setup:</strong>
                  <p className="mb-2 mt-2">Add to your <code>.env.local</code> file:</p>
                  <code className="d-block bg-light p-2 rounded mb-2">
                    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_test_key_here"
                  </code>
                  <ol className="mb-0 mt-2">
                    <li>Update your <code>.env.local</code> file with your test key</li>
                    <li>Stop your development server (Ctrl+C)</li>
                    <li>Run <code>npm run dev</code> again</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponError('Please enter a coupon code');
      return null;
    }
    
    try {
      setCouponLoading(true);
      setCouponError('');
      
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          orderAmount: planData?.pricing?.subtotal || planData?.price || 0,
          applicableItems: [planData?.itemType || 'registration']
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success && result.coupon) {
        const couponData: CouponData = {
          code: result.coupon.code,
          type: result.coupon.discountType,
          value: result.coupon.discountValue,
          discount: result.discount,
          isValid: true
        };
        setAppliedCouponState(couponData);
        return couponData;
      } else {
        throw new Error(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError(error instanceof Error ? error.message : 'An error occurred while validating the coupon');
      return null;
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCouponState(null);
    setCouponError('');
    
    // Restore original pricing if needed
    // Note: originalPlanData is not defined in the current scope
    // You might want to add it to the component state if needed
    if (planData?.pricing) {
      const restoredPlanData = {
        ...planData,
        pricing: {
          ...planData.pricing,
          discount: 0,
          total: (planData.pricing.subtotal || planData.price || 0) + (planData.serviceFee || 0)
        }
      };
      
      // Update the plan data if needed
      // Note: This might need to be handled differently based on your state management
      Object.assign(planData, restoredPlanData);
    }
  };

  // Handle free registration with REGISTER coupon
  const handleFreeRegistration = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/registration/complete-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerData,
          planData,
          couponCode: appliedCouponState?.code
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Redirect to success page
        window.location.href = `/registration-success?profile_id=${result.profileId}&email=${customerData.email}&plan=${encodeURIComponent(planData.title)}&amount=0.00&free_registration=true`;
      } else {
        throw new Error(result.error || 'Failed to complete registration');
      }
    } catch (error) {
      console.error('Free registration error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Ensure service fee is included even if pricing.total is not present
      const computedTotal =
        (planData?.pricing?.total ?? ((planData?.price || 0) + (planData?.serviceFee || 0)));
      const amount = Math.round(computedTotal * 100); // Convert to cents
      
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
            playerId: customerData.playerId || '',
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
      onPaymentError(error instanceof Error ? error.message : 'An error occurred during payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-checkout">
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
              'Pay in 4 interest-free installments',
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

      {/* Selected Payment Method Form */}
      {selectedPaymentMethod && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              {selectedPaymentMethod === 'card' && <><i className="fas fa-credit-card me-2"></i>Credit/Debit Card</>}
              {selectedPaymentMethod === 'klarna' && <><i className="fab fa-klarna me-2"></i>Klarna</>}
              {selectedPaymentMethod === 'affirm' && <><i className="fas fa-calendar-check me-2"></i>Affirm</>}
            </h5>
          </div>
          <div className="card-body">
            {!planData?.pricing?.total || planData.pricing.total <= 0 ? (
              <div className="alert alert-warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Unable to process payment: Invalid or missing amount. Please check your plan details.
              </div>
            ) : (
              <Elements 
                stripe={stripePromise}
                options={{
                  mode: 'payment',
                  amount: Math.round(planData.pricing.total * 100),
                  currency: 'usd',
                  paymentMethodTypes: [selectedPaymentMethod],
                  ...(selectedPaymentMethod === 'klarna' ? {
                    paymentMethodOptions: {
                      klarna: {
                        preferred_locale: 'en-US',
                      }
                    }
                  } : {})
                } as any}
              >
              <StripePaymentForm
                planData={planData}
                customerData={customerData}
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
                appliedCoupon={appliedCouponState}
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={handlePaymentMethodChange}
                loading={loading}
                setLoading={setLoading}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                couponLoading={couponLoading}
                setCouponLoading={setCouponLoading}
                couponError={couponError}
                setCouponError={setCouponError}
                setAppliedCoupon={setAppliedCouponState}
                bnplAccountStatus={bnplAccountStatus}
                setBnplAccountStatus={setBnplAccountStatus}
              />
            </Elements>
            )}
          </div>
        </div>
      )}

      {/* Coupon Section */}
      <div className="mb-4">
        <h6 className="fw-semibold mb-3">Apply Coupon</h6>
        {!appliedCouponState ? (
          <form onSubmit={handleCouponSubmit} className="row g-2">
            <div className="col">
              <input
                type="text"
                className={`form-control ${couponError ? 'is-invalid' : ''}`}
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  if (couponError) setCouponError('');
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
                type="submit"
                className="btn btn-info"
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
          </form>
        ) : (
          <div className="d-flex justify-content-between align-items-center p-3 bg-success bg-opacity-10 rounded">
            <div>
              <div className="fw-bold text-success">
                <i className="fas fa-check-circle me-2"></i>
                Coupon Applied: {appliedCouponState.code}
              </div>
              <small className="text-muted">
                {appliedCouponState.type === 'percentage' && `${appliedCouponState.value}% discount`}
                {appliedCouponState.type === 'fixed_amount' && `$${appliedCouponState.value} off`}
                {appliedCouponState.type === 'set_price' && `Set price: $${appliedCouponState.value}`}
                {' - '}You save ${appliedCouponState.discount.toFixed(2)}
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
              'google_pay',
              'fab fa-google-pay',
              'Google Pay',
              'Fast and secure payment with Google',
              'success'
            )}
          </div>
          <div className="col-md-4">
            {renderPaymentMethodCard(
              'apple_pay',
              'fab fa-apple-pay',
              'Apple Pay',
              'Quick checkout with Apple Pay',
              'dark'
            )}
          </div>
          <div className="col-md-4">
            {renderPaymentMethodCard(
              'cashapp',
              'fas fa-dollar-sign',
              'Cash App',
              'Pay instantly with Cash App',
              'success'
            )}
          </div>
          <div className="col-md-4">
            {renderPaymentMethodCard(
              'amazon_pay',
              'fab fa-amazon-pay',
              'Amazon Pay',
              'Use your Amazon account to pay',
              'warning'
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

      {/* Payment Form - Only show when a payment method is selected */}
      {selectedPaymentMethod && (
        <div className="mt-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                {selectedPaymentMethod === 'card' && <><i className="fas fa-credit-card me-2"></i>Credit/Debit Card</>}
                {selectedPaymentMethod === 'google_pay' && <><i className="fab fa-google-pay me-2"></i>Google Pay</>}
                {selectedPaymentMethod === 'apple_pay' && <><i className="fab fa-apple-pay me-2"></i>Apple Pay</>}
                {selectedPaymentMethod === 'cashapp' && <><i className="fas fa-dollar-sign me-2"></i>Cash App</>}
                {selectedPaymentMethod === 'amazon_pay' && <><i className="fab fa-amazon-pay me-2"></i>Amazon Pay</>}
                {selectedPaymentMethod === 'klarna' && <><i className="fab fa-klarna me-2"></i>Klarna</>}
                {selectedPaymentMethod === 'affirm' && <><i className="fas fa-calendar-check me-2"></i>Affirm</>}
              </h5>
            </div>
            <div className="card-body">
              <Elements 
                stripe={stripePromise}
                options={{
                  mode: 'payment',
                  amount: planData?.pricing?.total ? Math.round(planData.pricing.total * 100) : 0,
                  currency: 'usd',
                  paymentMethodTypes: [selectedPaymentMethod],
                  // Add any additional options based on the selected payment method
                  ...(selectedPaymentMethod === 'klarna' && {
                    paymentMethodOptions: {
                      klarna: {
                        preferred_locale: 'en-US',
                      },
                    },
                  }),
                }}
              >
                <StripePaymentForm
                  planData={planData}
                  customerData={customerData}
                  onPaymentSuccess={onPaymentSuccess}
                  onPaymentError={onPaymentError}
                  appliedCoupon={appliedCouponState}
                  selectedPaymentMethod={selectedPaymentMethod}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  loading={loading}
                  setLoading={setLoading}
                  couponCode={couponCode}
                  couponLoading={couponLoading}
                  couponError={couponError}
                  setAppliedCoupon={setAppliedCouponState}
                  bnplAccountStatus={bnplAccountStatus}
                  setBnplAccountStatus={setBnplAccountStatus}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}

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

      {/* Free Registration Button for REGISTER Coupon */}
      {appliedCoupon?.code === 'REGISTER' && (
        <div className="card border-success mb-4">
          <div className="card-header bg-success text-white">
            <h6 className="mb-0 fw-semibold">
              <i className="fas fa-check-circle me-2"></i>
              Free Registration Approved
            </h6>
          </div>
          <div className="card-body">
            <p className="mb-3">
              <i className="fas fa-info-circle text-success me-2"></i>
              Your registration has been approved for free enrollment. No payment required!
            </p>
            <div className="d-grid">
              <button
                className="btn btn-primary w-100 btn-lg"
                onClick={handlePayment}
                disabled={loading || !stripeLoaded}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  (() => {
                    const paymentMethodMap = {
                      'card': 'Credit/Debit Card',
                      'klarna': 'Klarna',
                      'affirm': 'Affirm',
                      'cashapp': 'Cash App Pay',
                      'google_pay': 'Google Pay',
                      'apple_pay': 'Apple Pay',
                      'amazon_pay': 'Amazon Pay'
                    };
                    return `Pay with ${paymentMethodMap[selectedPaymentMethod as keyof typeof paymentMethodMap] || 'Card'}`;
                  })()
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BNPL Payment Button */}
      {selectedPaymentMethod !== 'card' && appliedCoupon?.code !== 'REGISTER' && (
        <div className="d-grid">
          <button
            className="btn btn-primary w-100 btn-lg"
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
                {(() => {
                  const btnTotal = (planData?.pricing?.total ?? ((planData?.price || 0) + (planData?.serviceFee || 0)));
                  const paymentMethodNames = {
                    'klarna': 'Klarna',
                    'affirm': 'Affirm',
                    'cashapp': 'Cash App Pay',
                    'google_pay': 'Google Pay',
                    'apple_pay': 'Apple Pay',
                    'amazon_pay': 'Amazon Pay',
                    'card': 'Credit/Debit Card'
                  };
                  const displayName = paymentMethodNames[selectedPaymentMethod as keyof typeof paymentMethodNames] || 'Card';
                  return `Pay $${btnTotal.toFixed(2)} with ${displayName}`;
                })()}
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
