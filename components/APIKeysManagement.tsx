'use client';

import React, { useState, useEffect } from 'react';

interface APIKey {
  id: string;
  name: string;
  service: 'openai' | 'gohighlevel' | 'stripe' | 'twilio' | 'sendgrid' | 'other';
  keyValue: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  description?: string;
}

export default function APIKeysManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState<APIKey | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    service: 'openai' as APIKey['service'],
    keyValue: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingKey 
        ? `/api/settings/api-keys/${editingKey.id}`
        : '/api/settings/api-keys';
      
      const method = editingKey ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(editingKey ? 'API key updated successfully!' : 'API key added successfully!');
        setShowModal(false);
        resetForm();
        fetchAPIKeys();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('Failed to save API key');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await fetch(`/api/settings/api-keys/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('API key deleted successfully');
        fetchAPIKeys();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  };

  const handleEdit = (key: APIKey) => {
    setEditingKey(key);
    setFormData({
      name: key.name,
      service: key.service,
      keyValue: key.keyValue,
      description: key.description || '',
      isActive: key.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      service: 'openai',
      keyValue: '',
      description: '',
      isActive: true
    });
    setEditingKey(null);
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKey(showKey === id ? null : id);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  const getServiceIcon = (service: string) => {
    const icons: Record<string, string> = {
      openai: 'fas fa-robot',
      gohighlevel: 'fas fa-plug',
      stripe: 'fab fa-stripe',
      twilio: 'fas fa-sms',
      sendgrid: 'fas fa-envelope',
      other: 'fas fa-key'
    };
    return icons[service] || 'fas fa-key';
  };

  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      openai: 'success',
      gohighlevel: 'info',
      stripe: 'primary',
      twilio: 'danger',
      sendgrid: 'warning',
      other: 'secondary'
    };
    return colors[service] || 'secondary';
  };

  return (
    <div className="api-keys-management">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-key me-2"></i>
              API Keys Management
            </h5>
            <button
              className="btn btn-light btn-sm"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <i className="fas fa-plus me-2"></i>
              Add API Key
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Security Notice:</strong> API keys are sensitive. Never share them publicly. 
            Keys are encrypted in the database.
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-key fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No API Keys Configured</h5>
              <p className="text-muted">Add your first API key to get started.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Name</th>
                    <th>API Key</th>
                    <th>Status</th>
                    <th>Last Used</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td>
                        <span className={`badge bg-${getServiceColor(key.service)}`}>
                          <i className={`${getServiceIcon(key.service)} me-1`}></i>
                          {key.service.toUpperCase()}
                        </span>
                      </td>
                      <td className="fw-bold">{key.name}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <code className="me-2">
                            {showKey === key.id ? key.keyValue : maskKey(key.keyValue)}
                          </code>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            <i className={`fas fa-eye${showKey === key.id ? '-slash' : ''}`}></i>
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${key.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {key.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(key)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(key.id)}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingKey ? 'Edit API Key' : 'Add API Key'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Service *</label>
                    <select
                      className="form-select"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value as APIKey['service'] })}
                      required
                    >
                      <option value="openai">OpenAI (GPT-4)</option>
                      <option value="gohighlevel">GoHighLevel</option>
                      <option value="stripe">Stripe</option>
                      <option value="twilio">Twilio (SMS)</option>
                      <option value="sendgrid">SendGrid (Email)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Production OpenAI Key"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">API Key *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="sk-..."
                      value={formData.keyValue}
                      onChange={(e) => setFormData({ ...formData, keyValue: e.target.value })}
                      required
                    />
                    <small className="text-muted">
                      This will be encrypted when stored
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Optional description or notes"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="isActive">
                      Active (use this key for API calls)
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingKey ? 'Update' : 'Add'} API Key
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
