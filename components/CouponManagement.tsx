'use client';

import { useState, useEffect } from 'react';
import { Coupon } from '../lib/firestore-schema';

interface CouponFormData {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'set_price';
  discountValue: number;
  maxUses?: number;
  maxUsesPerCustomer?: number;
  startDate: string;
  expirationDate: string;
  applicableItems: {
    playerRegistration: boolean;
    coachRegistration: boolean;
    jamboreeOnly: boolean;
    completeSeason: boolean;
    jamboreeAndSeason: boolean;
  };
  minimumAmount?: number;
  isActive: boolean;
}

const initialFormData: CouponFormData = {
  code: '',
  name: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  startDate: new Date().toISOString().split('T')[0],
  expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  applicableItems: {
    playerRegistration: true,
    coachRegistration: true,
    jamboreeOnly: true,
    completeSeason: true,
    jamboreeAndSeason: true,
  },
  isActive: true
};

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(initialFormData);
  const [initializingDefaults, setInitializingDefaults] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      console.log('Fetching coupons...');
      const response = await fetch('/api/coupons');
      console.log('Coupons API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Coupons API response data:', data);
        setCoupons(data.coupons || []);
        console.log('Coupons set to state:', data.coupons?.length || 0, 'items');
      } else {
        console.error('Failed to fetch coupons:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        setCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingCoupon ? 'PUT' : 'POST';
      const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : '/api/coupons';
      
      console.log('Submitting coupon:', method, url, formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Coupon submit response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Coupon submit success:', result);
        await fetchCoupons();
        setShowForm(false);
        setEditingCoupon(null);
        setFormData(initialFormData);
        alert('Coupon saved successfully!');
      } else {
        const error = await response.json();
        console.error('Coupon submit error:', error);
        alert(`Error: ${error.error || error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Error saving coupon');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    
    // Helper function to safely convert dates
    const formatDate = (dateField: any) => {
      if (!dateField) return new Date().toISOString().split('T')[0];
      // If it's already a string (ISO format from API), just extract the date part
      if (typeof dateField === 'string') return dateField.split('T')[0];
      // If it's a Firestore Timestamp with toDate method
      if (dateField.toDate) return new Date(dateField.toDate()).toISOString().split('T')[0];
      // If it's a Date object
      if (dateField instanceof Date) return dateField.toISOString().split('T')[0];
      return new Date().toISOString().split('T')[0];
    };
    
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses,
      maxUsesPerCustomer: coupon.maxUsesPerCustomer,
      startDate: formatDate(coupon.startDate),
      expirationDate: formatDate(coupon.expirationDate),
      applicableItems: coupon.applicableItems,
      minimumAmount: coupon.minimumAmount,
      isActive: coupon.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCoupons();
        alert('Coupon deleted successfully!');
      } else {
        alert('Error deleting coupon');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Error deleting coupon');
    }
  };

  const initializeDefaultCoupons = async () => {
    if (!confirm('This will create default coupons (SAVE100, EARLYBIRD, COACH50, JAMBOREE25, BUNDLE20). Continue?')) return;
    
    try {
      setInitializingDefaults(true);
      const response = await fetch('/api/coupons/init-defaults', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        await fetchCoupons();
        alert(`Default coupons initialized! ${result.summary.created} created, ${result.summary.skipped} already existed.`);
      } else {
        const error = await response.json();
        alert(`Error initializing default coupons: ${error.error}`);
      }
    } catch (error) {
      console.error('Error initializing default coupons:', error);
      alert('Error initializing default coupons');
    } finally {
      setInitializingDefaults(false);
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      const response = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...coupon,
          isActive: !coupon.isActive
        }),
      });

      if (response.ok) {
        await fetchCoupons();
      }
    } catch (error) {
      console.error('Error updating coupon status:', error);
    }
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case 'percentage':
        return `${coupon.discountValue}% off`;
      case 'fixed_amount':
        return `$${coupon.discountValue.toFixed(2)} off`;
      case 'set_price':
        return `Set to $${coupon.discountValue.toFixed(2)}`;
      default:
        return '';
    }
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';
    
    let date: Date;
    
    if (typeof dateValue === 'object' && 'toDate' in dateValue && typeof dateValue.toDate === 'function') {
      // Firestore Timestamp
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      // Already a Date object
      date = dateValue;
    } else {
      // String or other format
      date = new Date(dateValue as unknown as string);
    }
    
    return date.toLocaleDateString();
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expirationDate) return false;
    
    // Handle both Firestore Timestamp and regular Date objects
    let expirationDate: Date;
    
    if (typeof coupon.expirationDate === 'object' && 'toDate' in coupon.expirationDate && typeof coupon.expirationDate.toDate === 'function') {
      // Firestore Timestamp
      expirationDate = coupon.expirationDate.toDate();
    } else if (coupon.expirationDate instanceof Date) {
      // Already a Date object
      expirationDate = coupon.expirationDate;
    } else {
      // String or other format
      expirationDate = new Date(coupon.expirationDate as unknown as string);
    }
    
    return new Date() > expirationDate;
  };

  const filteredCoupons = (coupons || []).filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (coupon.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && coupon.isActive && !isExpired(coupon)) ||
                         (filterStatus === 'expired' && isExpired(coupon)) ||
                         (filterStatus === 'inactive' && !coupon.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code: result });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="coupon-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Coupon Management</h3>
          <p className="text-muted mb-0">Create and manage discount coupons</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-info"
            onClick={initializeDefaultCoupons}
            disabled={initializingDefaults}
          >
            {initializingDefaults ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                Initializing...
              </>
            ) : (
              <>
                <i className="fas fa-magic me-2"></i>
                Add Default Coupons
              </>
            )}
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={fetchCoupons}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true);
              setEditingCoupon(null);
              setFormData(initialFormData);
            }}
          >
            <i className="fas fa-plus me-2"></i>
            Create Coupon
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="stats-card">
            <div className="stats-icon bg-primary">
              <i className="fas fa-ticket-alt"></i>
            </div>
            <div className="stats-content">
              <h3 className="stats-number">{coupons.length}</h3>
              <p className="stats-label">Total Coupons</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stats-card">
            <div className="stats-icon bg-success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stats-content">
              <h3 className="stats-number">
                {coupons.filter(c => c.isActive && !isExpired(c)).length}
              </h3>
              <p className="stats-label">Active Coupons</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stats-card">
            <div className="stats-icon bg-warning">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stats-content">
              <h3 className="stats-number">
                {coupons.filter(c => isExpired(c)).length}
              </h3>
              <p className="stats-label">Expired Coupons</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stats-card">
            <div className="stats-icon bg-info">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stats-content">
              <h3 className="stats-number">
                {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
              </h3>
              <p className="stats-label">Total Uses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Coupons</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label">Coupon Code *</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            required
                            placeholder="e.g., SAVE20"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={generateCouponCode}
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          />
                          <label className="form-check-label">
                            {formData.isActive ? 'Active' : 'Inactive'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Display Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., Welcome Discount"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description for internal use"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Discount Type *</label>
                        <select
                          className="form-select"
                          value={formData.discountType}
                          onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                          required
                        >
                          <option value="percentage">Percentage Off</option>
                          <option value="fixed_amount">Fixed Amount Off</option>
                          <option value="set_price">Set Price</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.discountValue}
                          onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                          required
                          min="0"
                          max={formData.discountType === 'percentage' ? '100' : undefined}
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Start Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Expiration Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.expirationDate}
                          onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Max Total Uses</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.maxUses || ''}
                          onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : undefined })}
                          min="1"
                          placeholder="Unlimited"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Max Uses Per Customer</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.maxUsesPerCustomer || ''}
                          onChange={(e) => setFormData({ ...formData, maxUsesPerCustomer: e.target.value ? parseInt(e.target.value) : undefined })}
                          min="1"
                          placeholder="Unlimited"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Minimum Order Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.minimumAmount || ''}
                      onChange={(e) => setFormData({ ...formData, minimumAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      min="0"
                      step="0.01"
                      placeholder="No minimum"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Applicable Items</label>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.applicableItems.playerRegistration}
                            onChange={(e) => setFormData({
                              ...formData,
                              applicableItems: { ...formData.applicableItems, playerRegistration: e.target.checked }
                            })}
                          />
                          <label className="form-check-label">Player Registration</label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.applicableItems.coachRegistration}
                            onChange={(e) => setFormData({
                              ...formData,
                              applicableItems: { ...formData.applicableItems, coachRegistration: e.target.checked }
                            })}
                          />
                          <label className="form-check-label">Coach Registration</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.applicableItems.jamboreeOnly}
                            onChange={(e) => setFormData({
                              ...formData,
                              applicableItems: { ...formData.applicableItems, jamboreeOnly: e.target.checked }
                            })}
                          />
                          <label className="form-check-label">Jamboree Only</label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.applicableItems.completeSeason}
                            onChange={(e) => setFormData({
                              ...formData,
                              applicableItems: { ...formData.applicableItems, completeSeason: e.target.checked }
                            })}
                          />
                          <label className="form-check-label">Complete Season</label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.applicableItems.jamboreeAndSeason}
                            onChange={(e) => setFormData({
                              ...formData,
                              applicableItems: { ...formData.applicableItems, jamboreeAndSeason: e.target.checked }
                            })}
                          />
                          <label className="form-check-label">Jamboree + Season</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="card">
        <div className="card-body">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No coupons found</h5>
              <p className="text-muted">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first coupon to get started'
                }
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Discount</th>
                    <th>Uses</th>
                    <th>Valid Period</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td>
                        <code className="bg-light px-2 py-1 rounded">{coupon.code}</code>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">{coupon.name}</div>
                          {coupon.description && (
                            <small className="text-muted">{coupon.description}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {getDiscountDisplay(coupon)}
                        </span>
                      </td>
                      <td>
                        <div>
                          <span className="fw-medium">{coupon.usedCount}</span>
                          {coupon.maxUses && (
                            <span className="text-muted">/{coupon.maxUses}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <div>{formatDate(coupon.startDate)}</div>
                          <div>to {formatDate(coupon.expirationDate)}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          {isExpired(coupon) ? (
                            <span className="badge bg-danger">Expired</span>
                          ) : coupon.isActive ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-secondary">Inactive</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(coupon)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className={`btn ${coupon.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => toggleCouponStatus(coupon)}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`fas ${coupon.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(coupon.id)}
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
    </div>
  );
}
