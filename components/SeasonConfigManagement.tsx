'use client';

import { useState, useEffect } from 'react';

interface SeasonConfig {
  id?: string;
  seasonName: string;
  seasonYear: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  registrationFee: number;
  setupFee: number;
  jerseyFee: number;
  menLeagueActive: boolean;
  womenLeagueActive: boolean;
  registrationOpen: boolean;
  displayOnHomepage: boolean;
  announcementText?: string;
  trialGameAllowed: boolean;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function SeasonConfigManagement() {
  const [configs, setConfigs] = useState<SeasonConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SeasonConfig | null>(null);
  const [formData, setFormData] = useState<Partial<SeasonConfig>>({
    seasonName: 'Fall',
    seasonYear: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    registrationFee: 59,
    setupFee: 3,
    jerseyFee: 26.50,
    menLeagueActive: true,
    womenLeagueActive: true,
    registrationOpen: true,
    displayOnHomepage: true,
    announcementText: '',
    trialGameAllowed: true,
    notes: '',
    isActive: true
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/season-config');
      const data = await response.json();
      setConfigs(data.configs || []);
    } catch (error) {
      console.error('Error fetching season configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingConfig ? `/api/season-config/${editingConfig.id}` : '/api/season-config';
      const method = editingConfig ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchConfigs();
        resetForm();
        alert(editingConfig ? 'Season configuration updated successfully!' : 'Season configuration created successfully!');
      } else {
        throw new Error('Failed to save season configuration');
      }
    } catch (error) {
      console.error('Error saving season configuration:', error);
      alert('Error saving season configuration. Please try again.');
    }
  };

  const handleEdit = (config: SeasonConfig) => {
    setEditingConfig(config);
    setFormData(config);
    setShowForm(true);
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this season configuration?')) return;

    try {
      const response = await fetch(`/api/season-config?id=${configId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchConfigs();
        alert('Season configuration deleted successfully!');
      } else {
        alert('Error deleting season configuration');
      }
    } catch (error) {
      console.error('Error deleting season configuration:', error);
      alert('Error deleting season configuration');
    }
  };

  const resetForm = () => {
    setFormData({
      seasonName: 'Fall',
      seasonYear: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      registrationFee: 59,
      setupFee: 3,
      jerseyFee: 26.50,
      menLeagueActive: true,
      womenLeagueActive: true,
      registrationOpen: true,
      displayOnHomepage: true,
      announcementText: '',
      trialGameAllowed: true,
      notes: '',
      isActive: true
    });
    setEditingConfig(null);
    setShowForm(false);
  };

  const toggleConfigStatus = async (configId: string, field: keyof SeasonConfig, currentValue: boolean) => {
    try {
      const config = configs.find(c => c.id === configId);
      if (!config) return;

      const response = await fetch(`/api/season-config/${configId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, [field]: !currentValue })
      });

      if (response.ok) {
        await fetchConfigs();
        alert('Configuration updated successfully!');
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      alert('Error updating configuration');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading season configurations...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-cog me-2"></i>
          Season Configuration
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Add Season Configuration
        </button>
      </div>

      <div className="alert alert-info">
        <i className="fas fa-info-circle me-2"></i>
        <strong>Note:</strong> Season configurations control what information is displayed on the homepage, pricing page, and season details page. 
        Set "Display on Homepage" to true for the current active season.
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-cog me-2"></i>
                  {editingConfig ? 'Edit Season Configuration' : 'Add Season Configuration'}
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
                    {/* Basic Info */}
                    <div className="col-12">
                      <h5 className="border-bottom pb-2">Basic Information</h5>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Season Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.seasonName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seasonName: e.target.value }))}
                        placeholder="e.g., Fall, Spring, Summer"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Season Year *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.seasonYear || new Date().getFullYear()}
                        onChange={(e) => setFormData(prev => ({ ...prev, seasonYear: parseInt(e.target.value) }))}
                        min="2020"
                        max="2100"
                        required
                      />
                    </div>

                    {/* Dates */}
                    <div className="col-12 mt-4">
                      <h5 className="border-bottom pb-2">Season Dates</h5>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.startDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Registration Deadline *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.registrationDeadline || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Fees */}
                    <div className="col-12 mt-4">
                      <h5 className="border-bottom pb-2">Fees</h5>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Registration Fee ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.registrationFee || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: parseFloat(e.target.value) }))}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Setup Fee ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.setupFee || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, setupFee: parseFloat(e.target.value) }))}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Jersey Fee ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.jerseyFee || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, jerseyFee: parseFloat(e.target.value) }))}
                        required
                      />
                    </div>

                    {/* Settings */}
                    <div className="col-12 mt-4">
                      <h5 className="border-bottom pb-2">Settings</h5>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Announcement Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.announcementText || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, announcementText: e.target.value }))}
                        placeholder="e.g., 2025 FALL SEASON NOW OPEN"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Notes</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Internal notes"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="col-12 mt-3">
                      <div className="row">
                        <div className="col-md-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.menLeagueActive || false}
                              onChange={(e) => setFormData(prev => ({ ...prev, menLeagueActive: e.target.checked }))}
                            />
                            <label className="form-check-label">Men's League Active</label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.womenLeagueActive || false}
                              onChange={(e) => setFormData(prev => ({ ...prev, womenLeagueActive: e.target.checked }))}
                            />
                            <label className="form-check-label">Women's League Active</label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.registrationOpen || false}
                              onChange={(e) => setFormData(prev => ({ ...prev, registrationOpen: e.target.checked }))}
                            />
                            <label className="form-check-label">Registration Open</label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.trialGameAllowed || false}
                              onChange={(e) => setFormData(prev => ({ ...prev, trialGameAllowed: e.target.checked }))}
                            />
                            <label className="form-check-label">Trial Game Allowed</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.displayOnHomepage || false}
                              onChange={(e) => setFormData(prev => ({ ...prev, displayOnHomepage: e.target.checked }))}
                            />
                            <label className="form-check-label">
                              <strong>Display on Homepage</strong> (Show this season on the main page)
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.isActive || false}
                              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                            <label className="form-check-label">
                              <strong>Active Configuration</strong>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    {editingConfig ? 'Update Configuration' : 'Create Configuration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Configurations List */}
      {configs.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-cog fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">No season configurations found</h4>
          <p className="text-muted">Create your first season configuration to get started.</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Season</th>
                    <th>Dates</th>
                    <th>Fees</th>
                    <th>Leagues</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((config) => (
                    <tr key={config.id} className={config.displayOnHomepage ? 'table-primary' : ''}>
                      <td>
                        <strong>{config.seasonName} {config.seasonYear}</strong>
                        {config.displayOnHomepage && (
                          <span className="badge bg-warning text-dark ms-2">
                            <i className="fas fa-home me-1"></i>Homepage
                          </span>
                        )}
                        {config.announcementText && (
                          <div className="small text-muted">{config.announcementText}</div>
                        )}
                      </td>
                      <td>
                        <small>
                          <strong>Season:</strong> {new Date(config.startDate).toLocaleDateString()} - {new Date(config.endDate).toLocaleDateString()}<br/>
                          <strong>Reg Deadline:</strong> {new Date(config.registrationDeadline).toLocaleString()}
                        </small>
                      </td>
                      <td>
                        <small>
                          Reg: ${config.registrationFee}<br/>
                          Setup: ${config.setupFee}<br/>
                          Jersey: ${config.jerseyFee}
                        </small>
                      </td>
                      <td>
                        {config.menLeagueActive && <span className="badge bg-primary me-1">Men</span>}
                        {config.womenLeagueActive && <span className="badge bg-danger">Women</span>}
                      </td>
                      <td>
                        {config.registrationOpen ? (
                          <span className="badge bg-success">Open</span>
                        ) : (
                          <span className="badge bg-secondary">Closed</span>
                        )}
                        {config.isActive && <span className="badge bg-info ms-1">Active</span>}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(config)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className={`btn ${config.displayOnHomepage ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => toggleConfigStatus(config.id!, 'displayOnHomepage', config.displayOnHomepage)}
                            title="Toggle Homepage Display"
                          >
                            <i className="fas fa-home"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(config.id!)}
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
          </div>
        </div>
      )}
    </div>
  );
}
