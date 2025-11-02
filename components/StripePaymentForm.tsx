'use client';

import { useState, useEffect } from 'react';
import { CardElement, PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeCardElementChangeEvent } from '@stripe/stripe-js';

type PaymentMethod = 'card' | 'klarna' | 'affirm' | 'cashapp' | 'apple_pay' | 'google_pay' | 'amazon_pay';

interface BillingInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
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
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: string) => void;
  appliedCoupon?: {
    code: string;
    type: string;
    value: number;
    discount: number;
  } | null;
  selectedPaymentMethod: PaymentMethod;
}

export default function StripePaymentForm({
  planData,
  customerData: customerInfo,
  onPaymentSuccess,
  onPaymentError,
  appliedCoupon = null,
  selectedPaymentMethod,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isCashAppProcessing, setIsCashAppProcessing] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);

  // Billing information state with validation
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
    email: customerInfo.email.trim(),
    phone: customerInfo.phone.replace(/\D/g, ''), // Remove non-numeric characters
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });

  useEffect(() => {
    if (!stripe) return;

    if (selectedPaymentMethod === 'apple_pay' || selectedPaymentMethod === 'google_pay') {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: planData?.title || 'Total',
          amount: Math.round((planData?.pricing?.total || 0) * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then(result => {
        if (result) {
          setPaymentRequest(pr);
        } else {
          setPaymentRequest(null); // Explicitly set to null if not available
        }
      });

      pr.on('paymentmethod', async (ev) => {
        try {
          const response = await fetch('/api/payments/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: Math.round((planData?.pricing?.total || 0) * 100),
              currency: 'usd',
              payment_method_types: [ev.paymentMethod.type],
            }),
          });
          const { clientSecret, error: backendError } = await response.json();
          if (backendError) throw new Error(backendError);

          const { error, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (error) {
            ev.complete('fail');
            throw error;
          }

          ev.complete('success');
          if (paymentIntent.status === 'requires_action') {
            const { error: error3d } = await stripe.confirmCardPayment(clientSecret);
            if (error3d) throw error3d;
          }
          onPaymentSuccess(paymentIntent);
        } catch (err) {
          onPaymentError(err.message);
        }
      });
    } else {
        setPaymentRequest(null); // Clear payment request when switching away
    }
  }, [stripe, selectedPaymentMethod, planData]);

  // US States for dropdown
  const usStates = [
    { value: '', label: 'Select State' },
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
  ];

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
  };

  // Handle card element change
  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardComplete(event.complete);
    if (event.error) {
      setFormErrors(prev => ({ ...prev, card: event.error?.message || 'Invalid card details' }));
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.card;
        return newErrors;
      });
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/;
    const zipRegex = /^\d{5}(-\d{4})?$/;

    if (!billingInfo.name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!billingInfo.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(billingInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!billingInfo.phone) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(billingInfo.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!billingInfo.address.line1.trim()) {
      errors.line1 = 'Street address is required';
    }

    if (!billingInfo.address.city.trim()) {
      errors.city = 'City is required';
    }

    if (!billingInfo.address.state) {
      errors.state = 'State is required';
    }

    if (!billingInfo.address.postal_code) {
      errors.postal_code = 'ZIP code is required';
    } else if (!zipRegex.test(billingInfo.address.postal_code)) {
      errors.postal_code = 'Please enter a valid ZIP code';
    }

    if (selectedPaymentMethod === 'card' && !cardComplete) {
      errors.card = 'Please enter valid card details';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCashAppPayment = async () => {
    setIsCashAppProcessing(true);
    onPaymentError('');

    try {
      // For manual Cash App payment, we just save the registration as pending
      const totalAmount = planData?.pricing?.total || 0;
      const paymentReference = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      console.log('Creating pending Cash App payment:', { totalAmount, paymentReference });
      
      // Create pending payment record
      const response = await fetch('/api/payments/create-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          planId: planData?.id,
          planName: planData?.title || 'Registration',
          customerEmail: customerInfo.email,
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          customerPhone: customerInfo.phone,
          playerId: customerInfo.playerId,
          paymentMethod: 'cashapp',
          paymentReference,
          appliedCoupon: appliedCoupon?.code || null,
          couponDiscount: appliedCoupon?.discount || 0,
        }),
      });

      const data = await response.json();
      
      console.log('Pending payment response:', data);

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to create pending payment');
      }

      // Redirect to payment instructions page
      if (data.paymentId) {
        window.location.href = `/payment-pending?paymentId=${data.paymentId}&ref=${paymentReference}`;
      } else {
        throw new Error('No payment ID received');
      }
    } catch (err: any) {
      console.error('Cash App payment error details:', err);
      const errorMessage = err?.message || 'An unexpected error occurred with Cash App.';
      onPaymentError(errorMessage);
      setIsCashAppProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBillingInfo(prev => {
        const parentObj = parent as keyof typeof prev;
        return {
          ...prev,
          [parent]: {
            ...(prev[parentObj] as Record<string, unknown> || {}),
            [child]: value
          }
        };
      });
    } else {
      setBillingInfo(prev => ({
        ...prev,
        [name]: name === 'phone' ? value.replace(/\D/g, '') : value
      }));
    }

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof newErrors];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Cash App payments are handled separately, not through this form submit
    if (selectedPaymentMethod === 'cashapp') {
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    if (!stripe || !elements) {
      onPaymentError('Payment service is not available. Please try again later.');
      return;
    }

    setProcessing(true);

    try {
      // 1. Create or retrieve customer
      const customerResponse = await fetch('/api/stripe/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: billingInfo.email,
          name: billingInfo.name,
          phone: billingInfo.phone,
          metadata: {
            playerId: customerInfo?.playerId || '',
            source: 'web-checkout'
          }
        })
      });

      const customerData = await customerResponse.json();
      if (!customerData.success) {
        throw new Error(customerData.error || 'Failed to create customer');
      }

      const customerId = customerData.customerId;

      // 2. Create payment intent
      const computedTotal = planData?.pricing?.total ?? ((planData?.price || 0) + (planData?.serviceFee || 0));
      const amount = Math.round(computedTotal * 100);
      
      const paymentIntentResponse = await fetch('/api/stripe/payment-intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'usd',
          customer: customerId,
          description: `All Pro Sports - ${planData?.title || 'Registration'}`,
          metadata: {
            planId: planData?.id || '',
            planTitle: planData?.title || '',
            planType: planData?.itemType || '',
            customerName: billingInfo.name,
            customerEmail: billingInfo.email,
            customerPhone: billingInfo.phone,
            appliedCoupon: appliedCoupon?.code || null,
            discountAmount: appliedCoupon?.discount || 0
          },
          payment_method_options: {
            card: {
              request_three_d_secure: 'any' // Request 3D Secure if needed
            }
          }
        })
      });

      const paymentIntentData = await paymentIntentResponse.json();
      if (!paymentIntentData.success) {
        throw new Error(paymentIntentData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = paymentIntentData;

      // 3. Confirm card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingInfo.name,
            email: billingInfo.email,
            phone: billingInfo.phone,
            address: {
              line1: billingInfo.address.line1,
              line2: billingInfo.address.line2 || undefined,
              city: billingInfo.address.city,
              state: billingInfo.address.state,
              postal_code: billingInfo.address.postal_code,
              country: billingInfo.address.country
            }
          }
        },
        receipt_email: billingInfo.email,
        save_payment_method: false,
        setup_future_usage: 'off_session'
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        onPaymentSuccess(paymentIntent);
      } else {
        throw new Error('Payment not completed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (selectedPaymentMethod === 'klarna') {
    return <div className="alert alert-info">Klarna integration is processing. Please select another payment method.</div>;
  }

  if (selectedPaymentMethod === 'affirm') {
    return <div className="alert alert-info">Affirm integration is processing. Please select another payment method.</div>;
  }

  if (selectedPaymentMethod === 'apple_pay' || selectedPaymentMethod === 'google_pay') {
    if (paymentRequest) {
      return <PaymentRequestButtonElement options={{ paymentRequest }} />;
    }
    return <div className="alert alert-warning">Apple Pay / Google Pay is not available on this device or browser.</div>;
  }

  if (selectedPaymentMethod === 'amazon_pay') {
    return <div className="alert alert-info">Amazon Pay integration is not yet available.</div>;
  }

  if (selectedPaymentMethod === 'cashapp') {
    return (
      <div className="d-grid">
        <button
          type="button"
          className="btn btn-success btn-lg py-3"
          onClick={handleCashAppPayment}
          disabled={isCashAppProcessing}
        >
          {isCashAppProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : (
            <>
              <i className="fas fa-dollar-sign me-2"></i>
              Continue with Cash App
            </>
          )}
        </button>
        <div className="alert alert-info mt-3 mb-0">
          <i className="fas fa-info-circle me-2"></i>
          <strong>How it works:</strong>
          <ol className="mb-0 mt-2 ps-3">
            <li>Click "Continue with Cash App"</li>
            <li>We'll save your registration and send payment instructions</li>
            <li>Complete payment via Cash App on your phone</li>
            <li>Your registration will be confirmed once payment is received</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      {/* Billing Information */}
      <div className="card border-light mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0 fw-semibold">
            <i className="fas fa-user me-2"></i>
            Billing Information
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                value={billingInfo.name}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
              {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
            </div>
            
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                value={billingInfo.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
              />
              {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
            </div>
            
            <div className="col-md-6">
              <label htmlFor="phone" className="form-label">Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                value={formatPhoneNumber(billingInfo.phone)}
                onChange={handleInputChange}
                placeholder="(123) 456-7890"
              />
              {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
            </div>
            
            <div className="col-12">
              <label htmlFor="address.line1" className="form-label">Address Line 1 *</label>
              <input
                type="text"
                id="address.line1"
                name="address.line1"
                className={`form-control ${formErrors.line1 ? 'is-invalid' : ''}`}
                value={billingInfo.address.line1}
                onChange={handleInputChange}
                placeholder="123 Main St"
              />
              {formErrors.line1 && <div className="invalid-feedback">{formErrors.line1}</div>}
            </div>
            
            <div className="col-12">
              <label htmlFor="address.line2" className="form-label">Address Line 2</label>
              <input
                type="text"
                id="address.line2"
                name="address.line2"
                className="form-control"
                value={billingInfo.address.line2}
                onChange={handleInputChange}
                placeholder="Apt, suite, etc. (optional)"
              />
            </div>
            
            <div className="col-md-6">
              <label htmlFor="address.city" className="form-label">City *</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                className={`form-control ${formErrors.city ? 'is-invalid' : ''}`}
                value={billingInfo.address.city}
                onChange={handleInputChange}
                placeholder="City"
              />
              {formErrors.city && <div className="invalid-feedback">{formErrors.city}</div>}
            </div>
            
            <div className="col-md-3">
              <label htmlFor="address.state" className="form-label">State *</label>
              <select
                id="address.state"
                name="address.state"
                className={`form-select ${formErrors.state ? 'is-invalid' : ''}`}
                value={billingInfo.address.state}
                onChange={handleInputChange}
              >
                <option value="">Select State</option>
                {usStates.map(state => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              {formErrors.state && <div className="invalid-feedback">{formErrors.state}</div>}
            </div>
            
            <div className="col-md-3">
              <label htmlFor="address.postal_code" className="form-label">ZIP Code *</label>
              <input
                type="text"
                id="address.postal_code"
                name="address.postal_code"
                className={`form-control ${formErrors.postal_code ? 'is-invalid' : ''}`}
                value={billingInfo.address.postal_code}
                onChange={handleInputChange}
                placeholder="12345"
              />
              {formErrors.postal_code && <div className="invalid-feedback">{formErrors.postal_code}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card border-light mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0 fw-semibold">
            <i className="fas fa-credit-card me-2"></i>
            Payment Method
          </h6>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <label className="form-label d-block mb-3">Card Details *</label>
            <div className={`border rounded p-3 ${formErrors.card ? 'border-danger' : 'border-light'}`}>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#32325d',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                  hidePostalCode: true,
                }}
                onChange={handleCardChange}
              />
            </div>
            {formErrors.card && <div className="text-danger small mt-2">{formErrors.card}</div>}
            
            <div className="d-flex align-items-center mt-3">
              <div className="me-2">
                <i className="fab fa-cc-visa fa-2x text-primary"></i>
              </div>
              <div className="me-2">
                <i className="fab fa-cc-mastercard fa-2x text-primary"></i>
              </div>
              <div className="me-2">
                <i className="fab fa-cc-amex fa-2x text-primary"></i>
              </div>
              <div className="me-2">
                <i className="fab fa-cc-discover fa-2x text-primary"></i>
              </div>
            </div>
          </div>
          
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary btn-lg py-3"
              disabled={!stripe || processing}
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                `Pay $${((planData?.pricing?.total ?? ((planData?.price || 0) + (planData?.serviceFee || 0))).toFixed(2))}`
              )}
            </button>
          </div>
          
          <div className="text-center mt-3">
            <p className="small text-muted mb-0">
              <i className="fas fa-lock me-1"></i> Your payment is secure and encrypted. We do not store your card details.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
