'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ModernNavbar from '@/components/ModernNavbar';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Credit card form state
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  // BNPL account verification state
  const [bnplVerification, setBnplVerification] = useState({
    hasKlarnaAccount: false,
    hasAffirmAccount: false,
    klarnaEmail: '',
    affirmEmail: ''
  });
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

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

  const validateCoupon = async (code: string) => {
    if (!code.trim()) return;
    
    setIsValidatingCoupon(true);
    setCouponError('');
    
    try {
      const response = await fetch(`/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.trim().toUpperCase(),
          orderAmount: registrationData?.selectedPlan?.price || 0,
          applicableItems: [registrationData?.selectedPlan?.itemType || 'registration']
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon);
        setCouponError('');
      } else {
        setAppliedCoupon(null);
        setCouponError(result.error || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError('Failed to validate coupon');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const calculatePricing = () => {
    if (!registrationData?.selectedPlan) return { basePrice: 0, discount: 0, finalAmount: 0, total: 0 };
    
    const plan = registrationData.selectedPlan;
    const basePrice = plan.price || 0;
    let discount = 0;
    let finalAmount = basePrice;
    
    if (appliedCoupon) {
      switch (appliedCoupon.discountType) {
        case 'percentage':
          discount = (basePrice * appliedCoupon.discountValue) / 100;
          break;
        case 'fixed_amount':
          discount = Math.min(appliedCoupon.discountValue, basePrice);
          break;
        case 'set_price':
          discount = Math.max(0, basePrice - appliedCoupon.discountValue);
          finalAmount = appliedCoupon.discountValue;
          break;
      }
      
      if (appliedCoupon.discountType !== 'set_price') {
        finalAmount = Math.max(0, basePrice - discount);
      }
    }
    
    const serviceFee = 3.00;
    const total = finalAmount + serviceFee;
    
    return { basePrice, discount, finalAmount, total };
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const validateCardData = () => {
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 13) {
      return 'Please enter a valid card number';
    }
    if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
      return 'Please enter a valid expiry date (MM/YY)';
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      return 'Please enter a valid CVV';
    }
    if (!cardData.cardholderName.trim()) {
      return 'Please enter the cardholder name';
    }
    return null;
  };

  const validateBnplAccount = (method: string) => {
    if (method === 'klarna') {
      if (!bnplVerification.hasKlarnaAccount) {
        return 'Please confirm you have a Klarna account';
      }
      if (!bnplVerification.klarnaEmail.trim()) {
        return 'Please enter your Klarna account email';
      }
    } else if (method === 'affirm') {
      if (!bnplVerification.hasAffirmAccount) {
        return 'Please confirm you have an Affirm account';
      }
      if (!bnplVerification.affirmEmail.trim()) {
        return 'Please enter your Affirm account email';
      }
    }
    return null;
  };

  const handlePayment = async (paymentMethod: string) => {
    if (!registrationData) {
      setError('Missing registration data');
      return;
    }

    // Validate payment method specific data
    if (paymentMethod === 'card') {
      const cardError = validateCardData();
      if (cardError) {
        setError(cardError);
        return;
      }
    } else if (paymentMethod === 'klarna' || paymentMethod === 'affirm') {
      const bnplError = validateBnplAccount(paymentMethod);
      if (bnplError) {
        setError(bnplError);
        return;
      }
    }

    setIsProcessing(true);
    setError('');

    try {
      const pricing = calculatePricing();
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationData,
          planData: registrationData.selectedPlan,
          paymentMethod,
          amount: pricing.total,
          couponCode: appliedCoupon?.code || null,
          discountAmount: pricing.discount,
          cardData: paymentMethod === 'card' ? cardData : null,
          bnplVerification: paymentMethod !== 'card' ? bnplVerification : null
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment processing failed');
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
  const pricing = calculatePricing();

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
                        <span className="fw-bold">${pricing.basePrice.toFixed(2)}</span>
                      </div>
                      
                      {/* Coupon Code Input */}
                      <div className="mt-3">
                        <label className="form-label small text-muted">Coupon Code (Optional)</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className={`form-control ${couponError ? 'is-invalid' : appliedCoupon ? 'is-valid' : ''}`}
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            disabled={isValidatingCoupon || appliedCoupon}
                          />
                          {!appliedCoupon ? (
                            <button
                              className="btn btn-outline-primary"
                              type="button"
                              onClick={() => validateCoupon(couponCode)}
                              disabled={!couponCode.trim() || isValidatingCoupon}
                            >
                              {isValidatingCoupon ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                'Apply'
                              )}
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-danger"
                              type="button"
                              onClick={removeCoupon}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {couponError && (
                          <div className="invalid-feedback d-block">
                            {couponError}
                          </div>
                        )}
                        {appliedCoupon && (
                          <div className="mt-2 p-2 bg-success bg-opacity-10 rounded">
                            <small className="text-success">
                              <i className="fas fa-tag me-1"></i>
                              Coupon Applied: {appliedCoupon.code}
                              <span className="float-end">-${pricing.discount.toFixed(2)}</span>
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    <hr />

                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span>Subtotal:</span>
                        <span>${pricing.basePrice.toFixed(2)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="d-flex justify-content-between text-success">
                          <span>Discount ({appliedCoupon.code}):</span>
                          <span>-${pricing.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between">
                        <span>Registration Total:</span>
                        <span>${pricing.finalAmount.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Service Fee:</span>
                        <span>$3.00</span>
                      </div>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between fs-5 fw-bold">
                      <span>Total:</span>
                      <span className="text-primary">${pricing.total.toFixed(2)}</span>
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
                      
                      {/* Credit Card Form */}
                      {selectedPaymentMethod === 'card' && (
                        <div className="card mt-3">
                          <div className="card-body">
                            <h6 className="card-title">Card Information</h6>
                            <div className="row mb-3">
                              <div className="col-12">
                                <label className="form-label">Card Number *</label>
                                <input
                                  type="text"
                                  name="cardNumber"
                                  value={cardData.cardNumber}
                                  onChange={handleCardInputChange}
                                  className="form-control"
                                  placeholder="1234 5678 9012 3456"
                                  maxLength={19}
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-md-4">
                                <label className="form-label">Expiry Date *</label>
                                <input
                                  type="text"
                                  name="expiryDate"
                                  value={cardData.expiryDate}
                                  onChange={handleCardInputChange}
                                  className="form-control"
                                  placeholder="MM/YY"
                                  maxLength={5}
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">CVV *</label>
                                <input
                                  type="text"
                                  name="cvv"
                                  value={cardData.cvv}
                                  onChange={handleCardInputChange}
                                  className="form-control"
                                  placeholder="123"
                                  maxLength={4}
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-12">
                                <label className="form-label">Cardholder Name *</label>
                                <input
                                  type="text"
                                  name="cardholderName"
                                  value={cardData.cardholderName}
                                  onChange={handleCardInputChange}
                                  className="form-control"
                                  placeholder="John Doe"
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-12">
                                <label className="form-label">Billing Address</label>
                                <input
                                  type="text"
                                  name="billingAddress"
                                  value={cardData.billingAddress}
                                  onChange={handleCardInputChange}
                                  className="form-control"
                                  placeholder="123 Main St"
                                />
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-md-4">
                                <label className="form-label">City</label>
                                <input
                                  type="text"
                                  name="city"
                                  value={cardData.city}
                                  onChange={handleCardInputChange}
                                  className="form-control"
                                  placeholder="City"
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">State</label>
                                <input
                                  type="text"
                                  name="state"
                                  value={cardData.state}
                                  onChange={handleCardInputChange}
                                  className="form-control"
                                  placeholder="State"
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">ZIP Code</label>
                                <input
                                  type="text"
                                  name="zipCode"
                                  value={cardData.zipCode}
                                  onChange={handleCardInputChange}
                                  className="form-control"
                                  placeholder="12345"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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
                                Pay in 4 interest-free installments of ${(pricing.total / 4).toFixed(2)}
                              </p>
                            </div>
                            <div className="klarna-logo">
                              <span className="badge bg-primary">Klarna</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Klarna Account Verification */}
                      {selectedPaymentMethod === 'klarna' && (
                        <div className="card mt-3">
                          <div className="card-body">
                            <h6 className="card-title">Klarna Account Verification</h6>
                            <div className="form-check mb-3">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="hasKlarnaAccount"
                                checked={bnplVerification.hasKlarnaAccount}
                                onChange={(e) => setBnplVerification(prev => ({
                                  ...prev,
                                  hasKlarnaAccount: e.target.checked
                                }))}
                              />
                              <label className="form-check-label" htmlFor="hasKlarnaAccount">
                                I have an existing Klarna account
                              </label>
                            </div>
                            {bnplVerification.hasKlarnaAccount && (
                              <div className="mb-3">
                                <label className="form-label">Klarna Account Email *</label>
                                <input
                                  type="email"
                                  className="form-control"
                                  placeholder="your.email@example.com"
                                  value={bnplVerification.klarnaEmail}
                                  onChange={(e) => setBnplVerification(prev => ({
                                    ...prev,
                                    klarnaEmail: e.target.value
                                  }))}
                                />
                                <small className="form-text text-muted">
                                  This should match the email address associated with your Klarna account
                                </small>
                              </div>
                            )}
                            {!bnplVerification.hasKlarnaAccount && (
                              <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                Don't have a Klarna account? You can create one during checkout.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
                                Flexible monthly payments as low as ${(pricing.total / 12).toFixed(2)}/mo
                              </p>
                            </div>
                            <div className="affirm-logo">
                              <span className="badge bg-info">Affirm</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Affirm Account Verification */}
                      {selectedPaymentMethod === 'affirm' && (
                        <div className="card mt-3">
                          <div className="card-body">
                            <h6 className="card-title">Affirm Account Verification</h6>
                            <div className="form-check mb-3">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="hasAffirmAccount"
                                checked={bnplVerification.hasAffirmAccount}
                                onChange={(e) => setBnplVerification(prev => ({
                                  ...prev,
                                  hasAffirmAccount: e.target.checked
                                }))}
                              />
                              <label className="form-check-label" htmlFor="hasAffirmAccount">
                                I have an existing Affirm account
                              </label>
                            </div>
                            {bnplVerification.hasAffirmAccount && (
                              <div className="mb-3">
                                <label className="form-label">Affirm Account Email *</label>
                                <input
                                  type="email"
                                  className="form-control"
                                  placeholder="your.email@example.com"
                                  value={bnplVerification.affirmEmail}
                                  onChange={(e) => setBnplVerification(prev => ({
                                    ...prev,
                                    affirmEmail: e.target.value
                                  }))}
                                />
                                <small className="form-text text-muted">
                                  This should match the email address associated with your Affirm account
                                </small>
                              </div>
                            )}
                            {!bnplVerification.hasAffirmAccount && (
                              <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                Don't have an Affirm account? You can create one during checkout.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="alert alert-danger mb-3">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                      </div>
                    )}

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
            </div>
          </div>
        </div>
      </>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
