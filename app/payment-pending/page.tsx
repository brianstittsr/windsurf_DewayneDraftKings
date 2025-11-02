'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const reference = searchParams.get('ref');
  
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      const data = await response.json();
      
      if (data.success) {
        setPaymentDetails(data.payment);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get CashTag from payment details or environment variable
  const cashTag = paymentDetails?.instructions?.cashtag || process.env.NEXT_PUBLIC_CASHAPP_CASHTAG || '$AllProSportsNC';
  const amount = paymentDetails?.amount || 0;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="fas fa-clock fa-3x text-warning"></i>
                </div>
                <h2 className="fw-bold mb-2">Payment Pending</h2>
                <p className="text-muted">Your registration is saved! Complete payment to confirm your spot.</p>
              </div>

              {/* Payment Instructions */}
              <div className="alert alert-info">
                <h5 className="alert-heading">
                  <i className="fas fa-info-circle me-2"></i>
                  How to Complete Payment
                </h5>
                <ol className="mb-0">
                  <li>Open Cash App on your phone</li>
                  <li>Send the exact amount shown below</li>
                  <li>Use the reference number provided</li>
                  <li>You'll receive confirmation once payment is received</li>
                </ol>
              </div>

              {/* Payment Details */}
              <div className="card bg-light mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-dollar-sign text-success me-2"></i>
                    Payment Details
                  </h5>
                  
                  {/* Amount */}
                  <div className="row mb-3">
                    <div className="col-4 fw-bold">Amount:</div>
                    <div className="col-8">
                      <span className="fs-4 text-success fw-bold">${amount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Cash Tag */}
                  <div className="row mb-3">
                    <div className="col-4 fw-bold">Send to:</div>
                    <div className="col-8">
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          value={cashTag} 
                          readOnly 
                        />
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => copyToClipboard(cashTag)}
                        >
                          <i className="fas fa-copy"></i> {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reference Number */}
                  <div className="row mb-3">
                    <div className="col-4 fw-bold">Reference #:</div>
                    <div className="col-8">
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control font-monospace" 
                          value={reference || ''} 
                          readOnly 
                        />
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => copyToClipboard(reference || '')}
                        >
                          <i className="fas fa-copy"></i> {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <small className="text-muted">
                        ⚠️ <strong>Important:</strong> Include this reference number with your payment
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Box */}
              <div className="card border-success mb-4">
                <div className="card-header bg-success text-white">
                  <i className="fas fa-mobile-alt me-2"></i>
                  <strong>Cash App Payment Steps</strong>
                </div>
                <div className="card-body">
                  <div className="d-flex mb-3">
                    <div className="me-3">
                      <div className="bg-success text-white rounded-circle" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        1
                      </div>
                    </div>
                    <div>
                      <strong>Open Cash App</strong>
                      <p className="mb-0 text-muted">Launch the Cash App application on your phone</p>
                    </div>
                  </div>

                  <div className="d-flex mb-3">
                    <div className="me-3">
                      <div className="bg-success text-white rounded-circle" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        2
                      </div>
                    </div>
                    <div>
                      <strong>Tap "Send" or "$"</strong>
                      <p className="mb-0 text-muted">Choose the send money option</p>
                    </div>
                  </div>

                  <div className="d-flex mb-3">
                    <div className="me-3">
                      <div className="bg-success text-white rounded-circle" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        3
                      </div>
                    </div>
                    <div>
                      <strong>Enter {cashTag}</strong>
                      <p className="mb-0 text-muted">Search for this Cash App username</p>
                    </div>
                  </div>

                  <div className="d-flex mb-3">
                    <div className="me-3">
                      <div className="bg-success text-white rounded-circle" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        4
                      </div>
                    </div>
                    <div>
                      <strong>Enter Amount: ${amount.toFixed(2)}</strong>
                      <p className="mb-0 text-muted">Make sure to send the exact amount</p>
                    </div>
                  </div>

                  <div className="d-flex">
                    <div className="me-3">
                      <div className="bg-success text-white rounded-circle" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        5
                      </div>
                    </div>
                    <div>
                      <strong>Add Note: {reference}</strong>
                      <p className="mb-0 text-muted">Copy and paste the reference number in the note/memo field</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Alert */}
              <div className="alert alert-warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Important:</strong> Please complete payment within 24 hours to hold your registration spot. You will receive a confirmation email once payment is verified.
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                <a 
                  href={`https://cash.app/${cashTag.replace('$', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success btn-lg"
                >
                  <i className="fas fa-external-link-alt me-2"></i>
                  Open Cash App Website
                </a>
                <Link href="/" className="btn btn-outline-secondary">
                  <i className="fas fa-home me-2"></i>
                  Return to Home
                </Link>
              </div>

              {/* Contact Info */}
              <div className="text-center mt-4">
                <p className="text-muted mb-1">
                  <i className="fas fa-question-circle me-1"></i>
                  Need help?
                </p>
                <p className="text-muted">
                  Contact us at <a href="mailto:info@allprosports.com">info@allprosports.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}
