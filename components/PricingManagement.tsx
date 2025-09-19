'use client';

import { useState, useEffect } from 'react';

interface PricingPlan {
  id?: string;
  title: string;
  subtitle: string;
  price: number;
  serviceFee: number;
  features: string[];
  popular: boolean;
  buttonText: string;
  buttonClass: string;
  itemType: 'jamboree' | 'season' | 'bundle' | 'assistant_coach' | 'head_coach';
  category: 'player' | 'coach';
  isActive: boolean;
}

export default function PricingManagement() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [formData, setFormData] = useState<PricingPlan>({
    title: '',
    subtitle: '',
    price: 0,
    serviceFee: 3.00,
    features: [],
    popular: false,
    buttonText: '',
    buttonClass: 'btn-outline-primary',
    itemType: 'jamboree',
    category: 'player',
    isActive: true
  });
  const [newFeature, setNewFeature] = useState('');

  // Load pricing plans
  useEffect(() => {
    loadPricingPlans();
  }, []);

  const loadPricingPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pricing');
      const data = await response.json();
      
      if (data.plans) {
        setPricingPlans(data.plans);
      }
    } catch (err) {
      console.error('Error loading pricing plans:', err);
      setError('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
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
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingPlan ? 'PUT' : 'POST';
      const url = editingPlan ? `/api/pricing/${editingPlan.id}` : '/api/pricing';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await loadPricingPlans();
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save pricing plan');
      }
    } catch (err) {
      console.error('Error saving pricing plan:', err);
      setError('Failed to save pricing plan');
    }
  };

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      ...plan,
      price: plan.price,
      serviceFee: plan.serviceFee
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/pricing/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadPricingPlans();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete pricing plan');
      }
    } catch (err) {
      console.error('Error deleting pricing plan:', err);
      setError('Failed to delete pricing plan');
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      title: '',
      subtitle: '',
      price: 0,
      serviceFee: 3.00,
      features: [],
      popular: false,
      buttonText: '',
      buttonClass: 'btn-outline-primary',
      itemType: 'jamboree',
      category: 'player',
      isActive: true
    });
    setShowForm(false);
  };

  const toggleForm = () => {
    if (showForm) {
      resetForm();
    } else {
      setShowForm(true);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Pricing Management</h1>
        <button 
          className="btn btn-primary"
          onClick={toggleForm}
        >
          {showForm ? 'Cancel' : 'Add New Plan'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="close" onClick={() => setError('')}>
            <span>&times;</span>
          </button>
        </div>
      )}

      {showForm && (
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">
              {editingPlan ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}
            </h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Subtitle *</label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="form-control"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Service Fee ($) *</label>
                    <input
                      type="number"
                      name="serviceFee"
                      value={formData.serviceFee}
                      onChange={handleInputChange}
                      className="form-control"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="player">Player</option>
                      <option value="coach">Coach</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Item Type *</label>
                    <select
                      name="itemType"
                      value={formData.itemType}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="jamboree">Jamboree</option>
                      <option value="season">Season</option>
                      <option value="bundle">Bundle</option>
                      <option value="assistant_coach">Assistant Coach</option>
                      <option value="head_coach">Head Coach</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Button Text *</label>
                    <input
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Button Class *</label>
                    <select
                      name="buttonClass"
                      value={formData.buttonClass}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="btn-primary">Primary</option>
                      <option value="btn-outline-primary">Outline Primary</option>
                      <option value="btn-success">Success</option>
                      <option value="btn-outline-success">Outline Success</option>
                      <option value="btn-info">Info</option>
                      <option value="btn-outline-info">Outline Info</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="popular"
                    checked={formData.popular}
                    onChange={handleInputChange}
                    className="form-check-input"
                    id="popularCheck"
                  />
                  <label className="form-check-label" htmlFor="popularCheck">
                    Popular Plan
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="form-check-input"
                    id="activeCheck"
                  />
                  <label className="form-check-label" htmlFor="activeCheck">
                    Active
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Features</label>
                <div className="input-group mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="form-control"
                    placeholder="Add a feature"
                  />
                  <div className="input-group-append">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={addFeature}
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                {formData.features.map((feature, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="form-control"
                    />
                    <div className="input-group-append">
                      <button 
                        type="button" 
                        className="btn btn-outline-danger"
                        onClick={() => removeFeature(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Current Pricing Plans</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Service Fee</th>
                  <th>Total</th>
                  <th>Popular</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pricingPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <strong>{plan.title}</strong>
                      <div className="small text-muted">{plan.subtitle}</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">
                        {plan.category}
                      </span>
                    </td>
                    <td>${plan.price.toFixed(2)}</td>
                    <td>${plan.serviceFee.toFixed(2)}</td>
                    <td>${(plan.price + plan.serviceFee).toFixed(2)}</td>
                    <td>
                      {plan.popular ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-secondary">No</span>
                      )}
                    </td>
                    <td>
                      {plan.isActive ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Inactive</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary mr-1"
                        onClick={() => handleEdit(plan)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => plan.id && handleDelete(plan.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
