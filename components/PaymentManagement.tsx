'use client';

import { useState, useEffect } from 'react';
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
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

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
      const response = await fetch(`/api/payments?id=${selectedPayment.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchPayments();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
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

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    const customerName = payment.customerName?.toLowerCase() || '';
    const customerEmail = payment.customerEmail?.toLowerCase() || '';
    const description = payment.description?.toLowerCase() || '';
    
    return customerName.includes(searchLower) || 
           customerEmail.includes(searchLower) || 
           description.includes(searchLower);
  });

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      succeeded: 'success',
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
      cash: 'fas fa-money-bill'
    };
    return icons[type as keyof typeof icons] || 'fas fa-credit-card';
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
          <div className="dropdown">
            <button className="btn btn-success dropdown-toggle w-100" type="button" data-bs-toggle="dropdown">
              <i className="fas fa-plus me-2"></i>
              New Payment
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#" onClick={() => createCheckoutSession(100, 'Registration Fee')}>Registration ($100)</a></li>
              <li><a className="dropdown-item" href="#" onClick={() => createCheckoutSession(50, 'Monthly Fee')}>Monthly Fee ($50)</a></li>
              <li><a className="dropdown-item" href="#" onClick={() => createCheckoutSession(25, 'Equipment Fee')}>Equipment ($25)</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="dk-card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-credit-card me-2"></i>
            Payment History ({filteredPayments.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredPayments.length === 0 ? (
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
                    <th>Type</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
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
                        <span className="badge bg-light text-dark">{payment.paymentType}</span>
                      </td>
                      <td>
                        <i className={`${getPaymentMethodIcon(payment.paymentMethod?.type || 'card')} me-2`}></i>
                        {payment.paymentMethod?.type}
                        {payment.paymentMethod?.last4 && (
                          <small className="text-muted d-block">****{payment.paymentMethod.last4}</small>
                        )}
                      </td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td>
                        {payment.paidAt?.toDate?.()?.toLocaleDateString() || 
                         payment.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
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
                              title="Refund"
                            >
                              <i className="fas fa-undo"></i>
                            </button>
                          )}
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
                  ))}
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
    </div>
  );
}
