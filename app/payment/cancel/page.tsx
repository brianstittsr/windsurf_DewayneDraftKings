'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModernNavbar from '@/components/ModernNavbar';

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push('/pricing');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <ModernNavbar />
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-lg">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-times-circle fa-5x text-warning"></i>
                </div>
                
                <h2 className="card-title text-warning mb-3">Payment Cancelled</h2>
                
                <p className="text-muted mb-4">
                  Your payment was cancelled and no charges were made to your account.
                </p>

                <div className="alert alert-info" role="alert">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>What happened?</strong><br />
                  You cancelled the payment process or closed the payment window before completing your transaction.
                </div>

                <div className="mb-4">
                  <p className="mb-2">
                    <strong>Need help?</strong> Contact our support team:
                  </p>
                  <p className="mb-1">
                    <i className="fas fa-envelope me-2"></i>
                    <a href="mailto:support@allprosports.com">support@allprosports.com</a>
                  </p>
                  <p className="mb-0">
                    <i className="fas fa-phone me-2"></i>
                    <a href="tel:+1234567890">(123) 456-7890</a>
                  </p>
                </div>

                <div className="d-grid gap-2 d-md-block">
                  <button
                    className="btn btn-primary btn-lg me-md-2"
                    onClick={() => router.push('/pricing')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Pricing
                  </button>
                  
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => router.push('/register')}
                  >
                    <i className="fas fa-user-plus me-2"></i>
                    Try Registration Again
                  </button>
                </div>

                <div className="mt-4">
                  <small className="text-muted">
                    <i className="fas fa-clock me-1"></i>
                    Redirecting to pricing page in 10 seconds...
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
