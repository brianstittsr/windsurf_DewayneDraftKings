'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ModernNavbar from '@/components/ModernNavbar';
import PaymentCheckout from '@/components/PaymentCheckout';

export default function CheckoutPage() {
  const [planData, setPlanData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const planParam = searchParams?.get('plan');
    const customerParam = searchParams?.get('customer');
    
    if (planParam) {
      try {
        setPlanData(JSON.parse(planParam));
      } catch (error) {
        console.error('Error parsing plan data:', error);
      }
    }
    
    if (customerParam) {
      try {
        setCustomerData(JSON.parse(customerParam));
      } catch (error) {
        console.error('Error parsing customer data:', error);
      }
    }
  }, [searchParams]);

  if (!planData) {
    return (
      <div>
        <ModernNavbar />
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                  <h4>No Plan Selected</h4>
                  <p className="text-muted">Please select a plan from the pricing page to continue.</p>
                  <a href="/pricing" className="btn btn-primary">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Pricing
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ModernNavbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-primary py-4">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle mb-3" style={{width: '60px', height: '60px'}}>
                <i className="fas fa-credit-card fa-lg text-primary"></i>
              </div>
              <h1 className="h3 fw-bold text-white mb-2">Secure Checkout</h1>
              <p className="text-white-50 mb-0">Complete your registration payment</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <PaymentCheckout 
              planData={planData}
              customerData={customerData || {
                firstName: '',
                lastName: '',
                email: '',
                phone: ''
              }}
              onPaymentSuccess={() => {
                window.location.href = '/registration-success';
              }}
              onPaymentError={(error) => {
                console.error('Payment error:', error);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
