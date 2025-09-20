'use client';

import React, { useState, useEffect } from 'react';
import { MealPlan } from '@/lib/firestore-schema';

export default function MealPlanManagement() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    mealsPerDay: '',
    features: [] as string[],
    isActive: true,
    status: 'active' as 'draft' | 'active' | 'inactive' | 'discontinued'
  });

  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetchMealPlans();
  }, [filter]);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        if (filter === 'active') {
          params.append('active', 'true');
        } else {
          params.append('status', filter);
        }
      }
      
      const response = await fetch(`/api/meal-plans?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setMealPlans(result.data);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      mealsPerDay: '',
      features: [],
      isActive: true,
      status: 'active'
    });
    setNewFeature('');
  };

  const handleEdit = (plan: MealPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      mealsPerDay: plan.mealsPerDay.toString(),
      features: plan.features,
      isActive: plan.isActive,
      status: plan.status
    });
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPlan ? `/api/meal-plans/${editingPlan.id}` : '/api/meal-plans';
      const method = editingPlan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateModal(false);
        setEditingPlan(null);
        resetForm();
        fetchMealPlans();
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to discontinue this meal plan?')) {
      return;
    }

    try {
      const response = await fetch(`/api/meal-plans/${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMealPlans();
      }
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'discontinued') {
      return <span className="badge bg-danger">Discontinued</span>;
    }
    if (!isActive) {
      return <span className="badge bg-secondary">Inactive</span>;
    }
    if (status === 'draft') {
      return <span className="badge bg-warning">Draft</span>;
    }
    return <span className="badge bg-success">Active</span>;
  };

  return (
    <div className="meal-plan-management">
      <style jsx>{`
        .meal-plan-management {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .dk-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 15px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .dk-card-header {
          background: linear-gradient(45deg, #2c5aa0, #1e3a8a);
          color: white;
          border-radius: 15px 15px 0 0;
          padding: 20px;
        }
        .btn-dk-primary {
          background: linear-gradient(45deg, #2c5aa0, #1e3a8a);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          padding: 10px 20px;
          transition: all 0.3s ease;
        }
        .btn-dk-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(44, 90, 160, 0.4);
          color: white;
        }
        .form-control, .form-select {
          border-radius: 8px;
          border: 2px solid #e2e8f0;
          padding: 12px;
          transition: all 0.3s ease;
        }
        .form-control:focus, .form-select:focus {
          border-color: #2c5aa0;
          box-shadow: 0 0 0 0.2rem rgba(44, 90, 160, 0.25);
        }
        .feature-tag {
          background: #e2e8f0;
          border-radius: 20px;
          padding: 4px 12px;
          margin: 2px;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
        }
        .remove-tag {
          background: none;
          border: none;
          color: #dc3545;
          margin-left: 8px;
          cursor: pointer;
        }
      `}</style>

      <div className="container-fluid">
        <div className="dk-card">
          <div className="dk-card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0">
                  <i className="fas fa-utensils me-2"></i>
                  Meal Plan Management
                </h2>
                <p className="mb-0 opacity-75">Manage sports nutrition meal plans</p>
              </div>
              <button
                className="btn btn-dk-primary"
                onClick={() => {
                  resetForm();
                  setEditingPlan(null);
                  setShowCreateModal(true);
                }}
              >
                <i className="fas fa-plus me-2"></i>
                Create Meal Plan
              </button>
            </div>
          </div>

          <div className="card-body">
            {/* Filter Tabs */}
            <div className="mb-4">
              <ul className="nav nav-pills">
                {[
                  { key: 'all', label: 'All Plans', icon: 'list' },
                  { key: 'active', label: 'Active', icon: 'check-circle' },
                  { key: 'inactive', label: 'Inactive', icon: 'pause-circle' },
                  { key: 'draft', label: 'Drafts', icon: 'edit' }
                ].map(tab => (
                  <li key={tab.key} className="nav-item">
                    <button
                      className={`nav-link ${filter === tab.key ? 'active' : ''}`}
                      onClick={() => setFilter(tab.key as any)}
                    >
                      <i className={`fas fa-${tab.icon} me-2`}></i>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Meal Plans Table */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading meal plans...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Plan Name</th>
                      <th>Price</th>
                      <th>Duration</th>
                      <th>Meals/Day</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealPlans.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
                          <p className="text-muted">No meal plans found</p>
                        </td>
                      </tr>
                    ) : (
                      mealPlans.map((plan) => (
                        <tr key={plan.id}>
                          <td>
                            <div>
                              <strong>{plan.name}</strong>
                              {plan.isFeatured && <span className="badge bg-warning ms-2">Featured</span>}
                              {plan.isPopular && <span className="badge bg-info ms-2">Popular</span>}
                              <br />
                              <small className="text-muted">{plan.description.substring(0, 100)}...</small>
                            </div>
                          </td>
                          <td>
                            <strong>${plan.price}</strong>
                            {plan.originalPrice && (
                              <div>
                                <small className="text-muted text-decoration-line-through">
                                  ${plan.originalPrice}
                                </small>
                              </div>
                            )}
                          </td>
                          <td>{plan.duration} days</td>
                          <td>{plan.mealsPerDay}</td>
                          <td>{getStatusBadge(plan.status, plan.isActive)}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(plan)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(plan.id)}
                                title="Discontinue"
                              >
                                <i className="fas fa-ban"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-utensils me-2"></i>
                  {editingPlan ? 'Edit Meal Plan' : 'Create New Meal Plan'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPlan(null);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Plan Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Price ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Duration (days) *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Meals per Day *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.mealsPerDay}
                          onChange={(e) => setFormData(prev => ({ ...prev, mealsPerDay: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Description *</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Features</label>
                        <div className="input-group mb-2">
                          <input
                            type="text"
                            className="form-control"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Add a feature"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={addFeature}
                          >
                            Add
                          </button>
                        </div>
                        <div>
                          {formData.features.map((feature, index) => (
                            <span key={index} className="feature-tag">
                              {feature}
                              <button
                                type="button"
                                className="remove-tag"
                                onClick={() => removeFeature(index)}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="discontinued">Discontinued</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          />
                          <label className="form-check-label">Active</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingPlan(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-dk-primary">
                    {editingPlan ? 'Update' : 'Create'} Meal Plan
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
