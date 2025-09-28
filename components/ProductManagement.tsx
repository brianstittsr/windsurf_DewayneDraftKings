'use client';

import { useState, useEffect } from 'react';

interface Product {
  id?: string;
  title: string;
  subtitle: string;
  description?: string;
  price: number;
  serviceFee: number;
  totalPrice: number;
  features: string[];
  itemType: 'jamboree' | 'season' | 'bundle' | 'assistant_coach' | 'head_coach';
  category: 'player' | 'coach';
  popular: boolean;
  buttonText: string;
  buttonClass: string;
  displayOrder: number;
  isActive: boolean;
  isVisible: boolean;
  maxCapacity?: number;
  currentRegistrations?: number;
  tags?: string[];
  notes?: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    subtitle: '',
    description: '',
    price: 0,
    serviceFee: 0,
    features: [],
    itemType: 'jamboree',
    category: 'player',
    popular: false,
    buttonText: 'Register Now',
    buttonClass: 'btn-primary',
    displayOrder: 1,
    isActive: true,
    isVisible: true,
    maxCapacity: undefined,
    tags: [],
    notes: ''
  });
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      totalPrice: (formData.price || 0) + (formData.serviceFee || 0),
      features: formData.features || [],
      tags: formData.tags || []
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        await fetchProducts();
        resetForm();
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProducts();
        alert('Product deleted successfully!');
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      price: 0,
      serviceFee: 0,
      features: [],
      itemType: 'jamboree',
      category: 'player',
      popular: false,
      buttonText: 'Register Now',
      buttonClass: 'btn-primary',
      displayOrder: 1,
      isActive: true,
      isVisible: true,
      maxCapacity: undefined,
      tags: [],
      notes: ''
    });
    setEditingProduct(null);
    setShowForm(false);
    setNewFeature('');
    setNewTag('');
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-box me-2"></i>
          Product Management
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Add New Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={resetForm}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Basic Information */}
                    <div className="col-md-6">
                      <label className="form-label">Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Subtitle *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.subtitle || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    {/* Pricing */}
                    <div className="col-md-4">
                      <label className="form-label">Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.price || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Service Fee ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.serviceFee || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceFee: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Total Price</label>
                      <input
                        type="text"
                        className="form-control"
                        value={`$${((formData.price || 0) + (formData.serviceFee || 0)).toFixed(2)}`}
                        disabled
                      />
                    </div>

                    {/* Product Type */}
                    <div className="col-md-6">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={formData.category || 'player'}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'player' | 'coach' }))}
                        required
                      >
                        <option value="player">Player</option>
                        <option value="coach">Coach</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Item Type *</label>
                      <select
                        className="form-select"
                        value={formData.itemType || 'jamboree'}
                        onChange={(e) => setFormData(prev => ({ ...prev, itemType: e.target.value as any }))}
                        required
                      >
                        <option value="jamboree">Jamboree</option>
                        <option value="season">Season</option>
                        <option value="bundle">Bundle</option>
                        <option value="assistant_coach">Assistant Coach</option>
                        <option value="head_coach">Head Coach</option>
                      </select>
                    </div>

                    {/* Features */}
                    <div className="col-12">
                      <label className="form-label">Features</label>
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Add a feature"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={addFeature}
                        >
                          Add
                        </button>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {formData.features?.map((feature, index) => (
                          <span key={index} className="badge bg-primary">
                            {feature}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-2"
                              style={{ fontSize: '0.7em' }}
                              onClick={() => removeFeature(index)}
                            ></button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Display Options */}
                    <div className="col-md-4">
                      <label className="form-label">Button Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.buttonText || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Button Class</label>
                      <select
                        className="form-select"
                        value={formData.buttonClass || 'btn-primary'}
                        onChange={(e) => setFormData(prev => ({ ...prev, buttonClass: e.target.value }))}
                      >
                        <option value="btn-primary">Primary (Blue)</option>
                        <option value="btn-success">Success (Green)</option>
                        <option value="btn-warning">Warning (Yellow)</option>
                        <option value="btn-danger">Danger (Red)</option>
                        <option value="btn-outline-primary">Outline Primary</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Display Order</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.displayOrder || 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                      />
                    </div>

                    {/* Status Options */}
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.popular || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                        />
                        <label className="form-check-label">Popular Plan</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.isActive || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <label className="form-check-label">Active</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.isVisible || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                        />
                        <label className="form-check-label">Visible</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Max Capacity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.maxCapacity || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) || undefined }))}
                        placeholder="Leave empty for unlimited"
                      />
                    </div>

                    {/* Notes */}
                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.notes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Internal notes (not visible to customers)"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="row">
        {products.length === 0 ? (
          <div className="col-12 text-center py-5">
            <i className="fas fa-box fa-3x text-muted mb-3"></i>
            <h4 className="text-muted">No products found</h4>
            <p className="text-muted">Create your first product to get started.</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="col-lg-4 col-md-6 mb-4">
              <div className={`card h-100 ${product.popular ? 'border-warning' : ''}`}>
                {product.popular && (
                  <div className="card-header bg-warning text-dark text-center">
                    <small><i className="fas fa-star me-1"></i>Most Popular</small>
                  </div>
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title">{product.title}</h5>
                    <div className="d-flex gap-1">
                      {!product.isActive && <span className="badge bg-secondary">Inactive</span>}
                      {!product.isVisible && <span className="badge bg-dark">Hidden</span>}
                    </div>
                  </div>
                  <p className="card-text text-muted">{product.subtitle}</p>
                  <div className="mb-3">
                    <span className="h4 text-primary">${product.totalPrice.toFixed(2)}</span>
                    {product.serviceFee > 0 && (
                      <small className="text-muted"> (${product.price.toFixed(2)} + ${product.serviceFee.toFixed(2)} fee)</small>
                    )}
                  </div>
                  <div className="mb-3">
                    <span className={`badge ${product.category === 'player' ? 'bg-primary' : 'bg-success'} me-2`}>
                      {product.category}
                    </span>
                    <span className="badge bg-secondary">{product.itemType}</span>
                  </div>
                  <ul className="list-unstyled small">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <li key={index}><i className="fas fa-check text-success me-2"></i>{feature}</li>
                    ))}
                    {product.features.length > 3 && (
                      <li className="text-muted">+ {product.features.length - 3} more features</li>
                    )}
                  </ul>
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm flex-fill"
                      onClick={() => handleEdit(product)}
                    >
                      <i className="fas fa-edit me-1"></i>Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(product.id!)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
