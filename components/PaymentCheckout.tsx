'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import dynamic from 'next/dynamic';

// Types
type PaymentMethod = 'card' | 'klarna' | 'affirm' | 'cashapp' | 'apple_pay' | 'google_pay' | 'amazon_pay';

type CouponData = {
  code: string;
  type: 'percentage' | 'fixed_amount' | 'set_price';
  value: number;
  discount: number;
};

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

// Dynamic Import
const StripePaymentForm = dynamic(
  () => import('./StripePaymentForm'),
  { ssr: false }
);

// Stripe Initialization
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Main Component
export default function PaymentCheckout({
  planData: initialPlanData,
  customerData,
  onPaymentSuccess,
  onPaymentError,
  appliedCoupon = null,
}: PaymentCheckoutProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponState, setAppliedCouponState] = useState<CouponData | null>(appliedCoupon);
  const [planData, setPlanData] = useState(initialPlanData);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    if (appliedCouponState) {
        const newTotal = initialPlanData.pricing.total - appliedCouponState.discount;
        setPlanData(prev => ({ ...prev, pricing: { ...prev.pricing, total: newTotal } }));
    } else {
        setPlanData(initialPlanData);
    }
  }, [appliedCouponState, initialPlanData]);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
        const response = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ couponCode, amount: initialPlanData.pricing.total, itemType: initialPlanData.itemType })
        });

        const data = await response.json();

        if (data.success) {
            setAppliedCouponState(data.coupon);
        } else {
            setCouponError(data.error || 'Invalid coupon code.');
        }
    } catch (err) {
        setCouponError('Failed to validate coupon. Please try again.');
    } finally {
        setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponState(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  
  if (!isStripeConfigured) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Stripe is not properly configured. Please check your environment variables.
      </div>
    );
  }

  const amount = Math.round((planData?.pricing?.total || 0) * 100);

  if (!stripePromise || amount <= 0) {
    return (
        <div className="alert alert-warning">
            <i className="fas fa-exclamation-circle me-2"></i>
            There is an issue with the payment configuration or amount. Amount must be greater than 0.
        </div>
    );
  }

  const elementsOptions: StripeElementsOptions = {
    mode: 'payment',
    amount: amount,
    currency: 'usd',
    paymentMethodCreation: 'manual',
  };

  return (
    <div className="payment-checkout-container">
      {/* Coupon Code Section */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Coupon Code</h5>
          {appliedCouponState ? (
            <div className="alert alert-success d-flex justify-content-between align-items-center">
              <span>
                <i className="fas fa-check-circle me-2"></i>
                <strong>{appliedCouponState.code}</strong> applied! (${appliedCouponState.discount.toFixed(2)} off)
              </span>
              <button className="btn btn-sm btn-link text-danger" onClick={handleRemoveCoupon}>Remove</button>
            </div>
          ) : (
            <form onSubmit={handleCouponSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${couponError ? 'is-invalid' : ''}`}
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={couponLoading}
                />
                <button className="btn btn-outline-secondary" type="submit" disabled={couponLoading || !couponCode.trim()}>
                  {couponLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Apply'}
                </button>
              </div>
              {couponError && <div className="invalid-feedback d-block">{couponError}</div>}
            </form>
          )}
        </div>
      </div>

      <h5 className="mb-4">Select Payment Method</h5>
      <div className="row g-3 mb-4">
        {/* Card Payment Method */}
        <div className="col-md-4">
          <div 
            className={`card payment-method-card ${selectedPaymentMethod === 'card' ? 'border-primary shadow-sm' : 'border-light'}`}
            onClick={() => handlePaymentMethodChange('card')}
          >
            <div className="card-body text-center">
                <i className="fas fa-credit-card fa-2x mb-2"></i>
                <h6 className="mb-0">Credit/Debit Card</h6>
            </div>
          </div>
        </div>
        {/* Klarna Payment Method */}
        <div className="col-md-4">
          <div 
            className={`card payment-method-card ${selectedPaymentMethod === 'klarna' ? 'border-primary shadow-sm' : 'border-light'}`}
            onClick={() => handlePaymentMethodChange('klarna')}
          >
            <div className="card-body text-center">
                <i className="fab fa-klarna fa-2x mb-2"></i>
                <h6 className="mb-0">Klarna</h6>
            </div>
          </div>
        </div>
        {/* Cash App Payment Method */}
        <div className="col-md-4">
          <div 
            className={`card payment-method-card ${selectedPaymentMethod === 'cashapp' ? 'border-primary shadow-sm' : 'border-light'}`}
            onClick={() => handlePaymentMethodChange('cashapp')}
          >
            <div className="card-body text-center">
                <i className="fas fa-dollar-sign fa-2x mb-2 text-success"></i>
                <h6 className="mb-0">Cash App</h6>
                <small className="text-muted">Pay via phone</small>
            </div>
          </div>
        </div>

        {/* Affirm Payment Method */}
        <div className="col-md-4">
          <div 
            className={`card payment-method-card ${selectedPaymentMethod === 'affirm' ? 'border-primary shadow-sm' : 'border-light'}`}
            onClick={() => handlePaymentMethodChange('affirm')}
          >
            <div className="card-body text-center">
                <i className="fas fa-hand-holding-usd fa-2x mb-2"></i>
                <h6 className="mb-0">Affirm</h6>
            </div>
          </div>
        </div>
      </div>

      <Elements stripe={stripePromise} options={elementsOptions}>
        <StripePaymentForm 
            planData={planData}
            customerData={customerData}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            selectedPaymentMethod={selectedPaymentMethod}
            appliedCoupon={appliedCouponState}
        />
      </Elements>
    </div>
  );
}
