'use client';

import React, { useState, useEffect } from 'react';

interface Commissioner {
  id: string;
  name: string;
  email: string;
  phone: string;
  ratePerPlayer: number;
  stripeAccountId?: string;
  isActive: boolean;
  totalEarned?: number;
  totalPlayers?: number;
  createdAt: string;
  updatedAt?: string;
}

export default function CommissionerManagement() {
  const [commissioners, setCommissioners] = useState<Commissioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCommissioner, setEditingCommissioner] = useState<Commissioner | null>(null);
  const [formData, setFormData] = useState<Partial<Commissioner>>({
    name: '',
    email: '',
    phone: '',
    ratePerPlayer: 1.00,
    isActive: true
  });

  useEffect(() => {
    fetchCommissioners();
  }, []);

  const fetchCommissioners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/commissioners');
      if (response.ok) {
        const data = await response.json();
        setCommissioners(data.commissioners || []);
      }
    } catch (error) {
      console.error('Error fetching commissioners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCommissioner 
        ? `/api/commissioners/${editingCommissioner.id}` 
        : '/api/commissioners';
      const method = editingCommissioner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(editingCommissioner ? 'Commissioner updated successfully!' : 'Commissioner created successfully!');
        resetForm();
        fetchCommissioners();
      } else {
        const errorMsg = data.details ? `${data.error}\n\nDetails: ${data.details}` : data.error;
        alert(`❌ Error: ${errorMsg}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error saving commissioner:', error);
      alert('❌ Failed to save commissioner. Check console for details.');
    }
  };

  const handleEdit = (commissioner: Commissioner) => {
    setEditingCommissioner(commissioner);
    setFormData(commissioner);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this commissioner?')) return;

    try {
      const response = await fetch(`/api/commissioners?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Commissioner deleted successfully');
        fetchCommissioners();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting commissioner:', error);
      alert('Failed to delete commissioner');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      ratePerPlayer: 1.00,
      isActive: true
    });
    setEditingCommissioner(null);
    setShowModal(false);
  };

  const toggleStatus = async (commissioner: Commissioner) => {
    try {
      const response = await fetch(`/api/commissioners/${commissioner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...commissioner, isActive: !commissioner.isActive })
      });

      if (response.ok) {
        fetchCommissioners();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading commissioners...</p>
      </div>
    );
  }

  return (
    <div className="commissioner-management">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-user-tie me-2"></i>
              Commissioner Management
            </h5>
            <button
              className="btn btn-light btn-sm"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Add Commissioner
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Commissioner Compensation:</strong> Commissioners earn ${formData.ratePerPlayer?.toFixed(2) || '1.00'} per registered player automatically.
          </div>

          {commissioners.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-user-tie fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No Commissioners Found</h5>
              <p className="text-muted">Add your first commissioner to get started.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Rate/Player</th>
                    <th>Total Players</th>
                    <th>Total Earned</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissioners.map((commissioner) => (
                    <tr key={commissioner.id}>
                      <td className="fw-bold">{commissioner.name}</td>
                      <td className="small">
                        <div>{commissioner.email}</div>
                        <div className="text-muted">{commissioner.phone}</div>
                      </td>
                      <td>
                        <span className="badge bg-success">
                          ${commissioner.ratePerPlayer.toFixed(2)}
                        </span>
                      </td>
                      <td>{commissioner.totalPlayers || 0}</td>
                      <td className="fw-bold text-success">
                        ${(commissioner.totalEarned || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${commissioner.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {commissioner.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-info"
                            onClick={() => handleEdit(commissioner)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className={`btn ${commissioner.isActive ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => toggleStatus(commissioner)}
                            title={commissioner.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`fas ${commissioner.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(commissioner.id)}
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

      {/* Summary Cards */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total Commissioners</h6>
              <h2>{commissioners.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Active</h6>
              <h2>{commissioners.filter(c => c.isActive).length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">Total Players</h6>
              <h2>{commissioners.reduce((sum, c) => sum + (c.totalPlayers || 0), 0)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h6 className="card-title">Total Earned</h6>
              <h2>${commissioners.reduce((sum, c) => sum + (c.totalEarned || 0), 0).toFixed(2)}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCommissioner ? 'Edit Commissioner' : 'Add Commissioner'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={resetForm}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rate Per Player ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={formData.ratePerPlayer || 1.00}
                      onChange={(e) => setFormData({...formData, ratePerPlayer: parseFloat(e.target.value)})}
                      required
                    />
                    <small className="text-muted">Amount earned per registered player</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Stripe Account ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.stripeAccountId || ''}
                      onChange={(e) => setFormData({...formData, stripeAccountId: e.target.value})}
                      placeholder="acct_xxxxx"
                    />
                    <small className="text-muted">For automatic payouts via Stripe Connect</small>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.isActive || false}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <label className="form-check-label">
                      Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCommissioner ? 'Update' : 'Create'} Commissioner
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
