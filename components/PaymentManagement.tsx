'use client';

import React, { useState, useEffect } from 'react';
import { Payment } from '@/lib/firestore-schema';

interface PaymentWithId extends Payment {
  id: string;
}

interface PaymentSummary {
  total: number;
  totalAmount: number;
  successful: number;
  failed: number;
  successRate: string;
}

export default function PaymentManagement() {
  const [payments, setPayments] = useState<PaymentWithId[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithId | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'refund' | 'delete'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showHidden, setShowHidden] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    amount: '',
    description: '',
    customerName: '',
    customerEmail: '',
    paymentMethod: 'card'
  });

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, typeFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      
      const response = await fetch(`/api/payments?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments || []);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (payment: PaymentWithId) => {
    setSelectedPayment(payment);
    setModalMode('view');
    setShowModal(true);
  };

  const handleCreatePayment = async () => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(createFormData.amount),
          description: createFormData.description,
          customerName: createFormData.customerName,
          customerEmail: createFormData.customerEmail,
          paymentMethod: createFormData.paymentMethod,
          status: 'pending'
        })
      });

      if (response.ok) {
        await fetchPayments();
        setShowCreateModal(false);
        setCreateFormData({
          amount: '',
          description: '',
          customerName: '',
          customerEmail: '',
          paymentMethod: 'card'
        });
        alert('Payment record created successfully!');
      } else {
        const data = await response.json();
        alert(`Error creating payment: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error creating payment. Please try again.');
    }
  };

  const handleRefund = (payment: PaymentWithId) => {
    setSelectedPayment(payment);
    setModalMode('refund');
    setRefundAmount('');
    setRefundReason('');
    setShowModal(true);
  };

  const handleDelete = (payment: PaymentWithId) => {
    setSelectedPayment(payment);
    setModalMode('delete');
    setShowModal(true);
  };

  const processRefund = async () => {
    if (!selectedPayment) return;

    try {
      const response = await fetch(`/api/payments/${selectedPayment.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: refundAmount ? parseFloat(refundAmount) : undefined,
          reason: refundReason
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`Refund processed successfully! Refund ID: ${data.refund.stripeRefundId}`);
        await fetchPayments();
        setShowModal(false);
        setRefundAmount('');
        setRefundReason('');
      } else {
        alert(`Error processing refund: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Error processing refund. Please try again.');
    }
  };

  const deletePayment = async () => {
    if (!selectedPayment) return;

    try {
      const response = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Payment deleted successfully!');
        await fetchPayments();
        setShowModal(false);
      } else {
        alert(`Error deleting payment: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Error deleting payment. Please try again.');
    }
  };

  const toggleHidePayment = async (payment: PaymentWithId) => {
    try {
      const newHiddenState = !(payment as any).hidden;
      
      // Optimistically update local state
      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === payment.id 
            ? { ...p, hidden: newHiddenState } as any
            : p
        )
      );
      
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hidden: newHiddenState
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh to ensure we have the latest data
        await fetchPayments();
      } else {
        // Revert optimistic update on error
        setPayments(prevPayments => 
          prevPayments.map(p => 
            p.id === payment.id 
              ? { ...p, hidden: !newHiddenState } as any
              : p
          )
        );
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error || 'Unknown error';
        alert(`Error updating payment: ${errorMsg}`);
        console.error('Update error details:', data);
      }
    } catch (error) {
      console.error('Error toggling payment visibility:', error);
      // Revert optimistic update on error
      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === payment.id 
            ? { ...p, hidden: !(payment as any).hidden } as any
            : p
        )
      );
      alert(`Error updating payment: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const createCheckoutSession = async (amount: number, description: string) => {
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          customerEmail: 'test@example.com',
          customerName: 'Test Customer',
          paymentType: 'registration'
        })
      });

      const data = await response.json();
      if (data.success && data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  // Filter and sort payments
  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    const customerName = payment.customerName?.toLowerCase() || '';
    const customerEmail = payment.customerEmail?.toLowerCase() || '';
    const description = payment.description?.toLowerCase() || '';
    
    const matchesSearch = !searchTerm || 
                         customerName.includes(searchLower) || 
                         customerEmail.includes(searchLower) || 
                         description.includes(searchLower);
    
    return matchesSearch;
  });

  // Separate visible and hidden payments
  const visiblePayments = filteredPayments.filter(p => !(p as any).hidden);
  const hiddenPayments = filteredPayments.filter(p => (p as any).hidden);
  
  // Combine: visible first, then hidden at bottom (if showHidden is true)
  const displayedPayments = showHidden 
    ? [...visiblePayments, ...hiddenPayments]
    : visiblePayments;

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      succeeded: 'success',
      completed: 'success',
      pending: 'warning',
      processing: 'info',
      failed: 'danger',
      cancelled: 'secondary',
      refunded: 'dark',
      partially_refunded: 'warning'
    };
    const badgeClass = statusClasses[status as keyof typeof statusClasses] || 'secondary';
    return <span className={`badge bg-${badgeClass}`}>{status.replace('_', ' ')}</span>;
  };

  const getPaymentMethodIcon = (type: string) => {
    const icons = {
      card: 'fas fa-credit-card',
      klarna: 'fab fa-klarna',
      affirm: 'fas fa-money-check-alt',
      bank_transfer: 'fas fa-university',
      cash: 'fas fa-money-bill',
      cashapp: 'fas fa-dollar-sign',
      google_pay: 'fab fa-google-pay',
      apple_pay: 'fab fa-apple-pay',
      amazon_pay: 'fab fa-amazon-pay',
      free_registration: 'fas fa-gift',
      check: 'fas fa-money-check'
    };
    return icons[type as keyof typeof icons] || 'fas fa-credit-card';
  };

  const getPaymentMethodName = (type: string) => {
    const names: { [key: string]: string } = {
      card: 'Credit/Debit Card',
      klarna: 'Klarna',
      affirm: 'Affirm',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash',
      cashapp: 'Cash App',
      google_pay: 'Google Pay',
      apple_pay: 'Apple Pay',
      amazon_pay: 'Amazon Pay',
      free_registration: 'Free Registration',
      check: 'Check'
    };
    return names[type] || type;
  };

  return (
    <div className="payment-management">
      {/* Summary Cards */}
      {summary && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="dk-card text-center">
              <div className="card-body">
                <i className="fas fa-receipt fa-2x text-primary mb-2"></i>
                <h4 className="mb-1">{summary.total}</h4>
                <p className="text-muted mb-0">Total Payments</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dk-card text-center">
              <div className="card-body">
                <i className="fas fa-dollar-sign fa-2x text-success mb-2"></i>
                <h4 className="mb-1">${summary.totalAmount.toLocaleString()}</h4>
                <p className="text-muted mb-0">Total Revenue</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dk-card text-center">
              <div className="card-body">
                <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                <h4 className="mb-1">{summary.successful}</h4>
                <p className="text-muted mb-0">Successful</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dk-card text-center">
              <div className="card-body">
                <i className="fas fa-chart-line fa-2x text-info mb-2"></i>
                <h4 className="mb-1">{summary.successRate}%</h4>
                <p className="text-muted mb-0">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="registration">Registration</option>
            <option value="monthly">Monthly</option>
            <option value="equipment">Equipment</option>
            <option value="event">Event</option>
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" onClick={fetchPayments}>
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        </div>
        <div className="col-md-2">
          <button 
            className="btn btn-success w-100" 
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            New Payment
          </button>
        </div>
      </div>

      {/* Show/Hide Toggle */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="showHiddenCheckbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="showHiddenCheckbox">
              Show hidden test entries ({hiddenPayments.length} hidden)
            </label>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="dk-card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-credit-card me-2"></i>
            Payment History ({displayedPayments.length}{showHidden ? ` - ${visiblePayments.length} visible, ${hiddenPayments.length} hidden` : ''})
          </h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : displayedPayments.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <i className="fas fa-receipt fa-3x mb-3"></i>
              <p>No payments found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Method</th>
                    <th>Coupon</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPayments.map((payment, index) => {
                    const isHidden = (payment as any).hidden;
                    const isFirstHidden = isHidden && index > 0 && !(displayedPayments[index - 1] as any).hidden;
                    
                    return (
                      <React.Fragment key={payment.id}>
                        {/* Separator before hidden section */}
                        {isFirstHidden && showHidden && (
                          <tr className="table-secondary">
                            <td colSpan={9} className="text-center fw-bold py-2">
                              <i className="fas fa-eye-slash me-2"></i>
                              Hidden Test Entries
                            </td>
                          </tr>
                        )}
                    <tr className={isHidden ? 'table-light' : ''}>
                      <td>
                        <div>
                          <div className="fw-semibold">{payment.customerName}</div>
                          <small className="text-muted">{payment.customerEmail}</small>
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">${payment.amount?.toFixed(2)}</div>
                        <small className="text-muted">{payment.currency}</small>
                      </td>
                      <td>
                        <div className="fw-semibold">{payment.description}</div>
                        {payment.stripePaymentIntentId && (
                          <small className="text-muted d-block">
                            <i className="fab fa-stripe me-1"></i>
                            {payment.stripePaymentIntentId.substring(0, 20)}...
                          </small>
                        )}
                      </td>
                      <td>
                        <i className={`${getPaymentMethodIcon(typeof payment.paymentMethod === 'string' ? payment.paymentMethod : payment.paymentMethod?.type || 'card')} me-2`}></i>
                        {getPaymentMethodName(typeof payment.paymentMethod === 'string' ? payment.paymentMethod : payment.paymentMethod?.type || 'card')}
                      </td>
                      <td>
                        {(payment as any).couponCode ? (
                          <span className="badge bg-info">
                            <i className="fas fa-tag me-1"></i>
                            {(payment as any).couponCode}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td>
                        {(payment as any).source === 'stripe' ? (
                          <span className="badge bg-primary">
                            <i className="fab fa-stripe me-1"></i>
                            Stripe
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            <i className="fas fa-database me-1"></i>
                            Local
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">
                          {payment.createdAt?.toDate ? 
                            payment.createdAt.toDate().toLocaleDateString() : 
                            payment.createdAt ? new Date(payment.createdAt as any).toLocaleDateString() : 'N/A'
                          }
                        </div>
                        <small className="text-muted">
                          {payment.createdAt?.toDate ? 
                            payment.createdAt.toDate().toLocaleTimeString() : 
                            payment.createdAt ? new Date(payment.createdAt as any).toLocaleTimeString() : 'N/A'
                          }
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleView(payment)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {payment.status === 'succeeded' && (
                            <button
                              className="btn btn-outline-warning"
                              onClick={() => handleRefund(payment)}
                              title="Process Refund"
                            >
                              <i className="fas fa-undo"></i>
                            </button>
                          )}
                          <button
                            className={`btn ${(payment as any).hidden ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                            onClick={() => toggleHidePayment(payment)}
                            title={(payment as any).hidden ? 'Show Payment' : 'Hide Payment (Test Entry)'}
                          >
                            <i className={`fas ${(payment as any).hidden ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(payment)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for View/Refund/Delete */}
      {showModal && selectedPayment && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'view' && <><i className="fas fa-eye me-2"></i>Payment Details</>}
                  {modalMode === 'refund' && <><i className="fas fa-undo me-2"></i>Process Refund</>}
                  {modalMode === 'delete' && <><i className="fas fa-trash me-2"></i>Delete Payment</>}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {modalMode === 'delete' ? (
                  <div className="text-center">
                    <i className="fas fa-exclamation-triangle text-warning fa-3x mb-3"></i>
                    <h5>Are you sure?</h5>
                    <p>This will permanently delete the payment record.</p>
                    <p className="fw-semibold">${selectedPayment.amount?.toFixed(2)} - {selectedPayment.customerName}</p>
                  </div>
                ) : modalMode === 'refund' ? (
                  <div>
                    <div className="mb-3">
                      <label className="form-label">Refund Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder={`Max: $${selectedPayment.amount?.toFixed(2)}`}
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        max={selectedPayment.amount}
                        step="0.01"
                      />
                      <div className="form-text">Leave empty for full refund</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Reason</label>
                      <select
                        className="form-select"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                      >
                        <option value="">Select reason</option>
                        <option value="requested_by_customer">Requested by customer</option>
                        <option value="duplicate">Duplicate payment</option>
                        <option value="fraudulent">Fraudulent</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Customer:</strong> {selectedPayment.customerName}</p>
                      <p><strong>Email:</strong> {selectedPayment.customerEmail}</p>
                      <p><strong>Amount:</strong> ${selectedPayment.amount?.toFixed(2)} {selectedPayment.currency}</p>
                      <p><strong>Type:</strong> {selectedPayment.paymentType}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Status:</strong> {getStatusBadge(selectedPayment.status)}</p>
                      <p><strong>Method:</strong> {selectedPayment.paymentMethod?.type}</p>
                      <p><strong>Stripe ID:</strong> {selectedPayment.stripePaymentIntentId}</p>
                      <p><strong>Date:</strong> {selectedPayment.paidAt?.toDate?.()?.toLocaleString() || 'N/A'}</p>
                    </div>
                    {selectedPayment.description && (
                      <div className="col-12">
                        <p><strong>Description:</strong> {selectedPayment.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  {modalMode === 'delete' ? 'Cancel' : 'Close'}
                </button>
                {modalMode === 'refund' && (
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={processRefund}
                    disabled={!refundReason}
                  >
                    <i className="fas fa-undo me-2"></i>
                    Process Refund
                  </button>
                )}
                {modalMode === 'delete' && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={deletePayment}
                  >
                    <i className="fas fa-trash me-2"></i>
                    Delete Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop fade show"></div>}

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-plus me-2"></i>
                  Create New Payment Record
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Amount *</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0.00"
                      value={createFormData.amount}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, amount: e.target.value }))}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Registration Fee, Monthly Payment"
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="John Doe"
                    value={createFormData.customerName}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Customer Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="john@example.com"
                    value={createFormData.customerEmail}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={createFormData.paymentMethod}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  >
                    <option value="card">💳 Credit/Debit Card</option>
                    <option value="klarna">🛍️ Klarna</option>
                    <option value="affirm">✅ Affirm</option>
                    <option value="cashapp">💵 Cash App</option>
                    <option value="google_pay">🔵 Google Pay</option>
                    <option value="apple_pay">🍎 Apple Pay</option>
                    <option value="amazon_pay">📦 Amazon Pay</option>
                    <option value="cash">💰 Cash</option>
                    <option value="check">📝 Check</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleCreatePayment}
                  disabled={!createFormData.amount || !createFormData.description || !createFormData.customerName || !createFormData.customerEmail}
                >
                  <i className="fas fa-plus me-2"></i>
                  Create Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}
