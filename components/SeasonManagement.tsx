'use client';

import { useState, useEffect } from 'react';

interface Season {
  id?: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  description?: string;
  teamCount?: number;
  gameCount?: number;
  registrationOpen: boolean;
  registrationDeadline?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function SeasonManagement() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState<Partial<Season>>({
    name: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    status: 'upcoming',
    description: '',
    registrationOpen: true,
    registrationDeadline: '',
    notes: ''
  });

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/seasons');
      const data = await response.json();
      setSeasons(data.seasons || []);
    } catch (error) {
      console.error('Error fetching seasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingSeason ? `/api/seasons/${editingSeason.id}` : '/api/seasons';
      const method = editingSeason ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchSeasons();
        resetForm();
        alert(editingSeason ? 'Season updated successfully!' : 'Season created successfully!');
      } else {
        throw new Error('Failed to save season');
      }
    } catch (error) {
      console.error('Error saving season:', error);
      alert('Error saving season. Please try again.');
    }
  };

  const handleEdit = (season: Season) => {
    setEditingSeason(season);
    setFormData(season);
    setShowForm(true);
  };

  const handleDelete = async (seasonId: string) => {
    if (!confirm('Are you sure you want to delete this season? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/seasons?id=${seasonId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSeasons();
        alert('Season deleted successfully!');
      } else {
        alert('Error deleting season');
      }
    } catch (error) {
      console.error('Error deleting season:', error);
      alert('Error deleting season');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      year: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      status: 'upcoming',
      description: '',
      registrationOpen: true,
      registrationDeadline: '',
      notes: ''
    });
    setEditingSeason(null);
    setShowForm(false);
  };

  const updateSeasonStatus = async (seasonId: string, newStatus: Season['status']) => {
    try {
      const season = seasons.find(s => s.id === seasonId);
      if (!season) return;

      const response = await fetch(`/api/seasons/${seasonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...season, status: newStatus })
      });

      if (response.ok) {
        await fetchSeasons();
        alert(`Season status updated to ${newStatus}!`);
      }
    } catch (error) {
      console.error('Error updating season status:', error);
      alert('Error updating season status');
    }
  };

  const filteredSeasons = filterStatus === 'all' 
    ? seasons 
    : seasons.filter(season => season.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: 'bg-info',
      active: 'bg-success',
      completed: 'bg-secondary',
      archived: 'bg-dark'
    };
    return badges[status as keyof typeof badges] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading seasons...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-calendar-alt me-2"></i>
          Season Management
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Create Season
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="btn-group w-100" role="group">
            <button
              className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({seasons.length})
            </button>
            <button
              className={`btn ${filterStatus === 'upcoming' ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setFilterStatus('upcoming')}
            >
              Upcoming ({seasons.filter(s => s.status === 'upcoming').length})
            </button>
            <button
              className={`btn ${filterStatus === 'active' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilterStatus('active')}
            >
              Active ({seasons.filter(s => s.status === 'active').length})
            </button>
            <button
              className={`btn ${filterStatus === 'completed' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus('completed')}
            >
              Completed ({seasons.filter(s => s.status === 'completed').length})
            </button>
            <button
              className={`btn ${filterStatus === 'archived' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setFilterStatus('archived')}
            >
              Archived ({seasons.filter(s => s.status === 'archived').length})
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-calendar-alt me-2"></i>
                  {editingSeason ? 'Edit Season' : 'Create New Season'}
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
                    <div className="col-md-8">
                      <label className="form-label">Season Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Fall 2024, Spring 2025"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Year *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.year || new Date().getFullYear()}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                        min="2020"
                        max="2100"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.startDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status *</label>
                      <select
                        className="form-select"
                        value={formData.status || 'upcoming'}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Season['status'] }))}
                        required
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Registration Deadline</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.registrationDeadline || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the season..."
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.notes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Internal notes (not visible to public)..."
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.registrationOpen || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, registrationOpen: e.target.checked }))}
                        />
                        <label className="form-check-label">
                          Registration Open (Allow new registrations for this season)
                        </label>
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
                    {editingSeason ? 'Update Season' : 'Create Season'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Seasons List */}
      {filteredSeasons.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">No seasons found</h4>
          <p className="text-muted">
            {filterStatus === 'all' 
              ? 'Create your first season to get started.' 
              : `No ${filterStatus} seasons found.`}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Season</th>
                    <th>Year</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Registration</th>
                    <th>Teams</th>
                    <th>Games</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSeasons.map((season) => (
                    <tr key={season.id}>
                      <td>
                        <strong>{season.name}</strong>
                        {season.description && (
                          <div className="small text-muted">{season.description}</div>
                        )}
                      </td>
                      <td>{season.year}</td>
                      <td>
                        <small>
                          {new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(season.status)}`}>
                          {season.status}
                        </span>
                      </td>
                      <td>
                        {season.registrationOpen ? (
                          <span className="badge bg-success">
                            <i className="fas fa-check me-1"></i>Open
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            <i className="fas fa-times me-1"></i>Closed
                          </span>
                        )}
                      </td>
                      <td>{season.teamCount || 0}</td>
                      <td>{season.gameCount || 0}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(season)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-secondary dropdown-toggle"
                              data-bs-toggle="dropdown"
                              title="Change Status"
                            >
                              <i className="fas fa-exchange-alt"></i>
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button 
                                  className="dropdown-item" 
                                  onClick={() => updateSeasonStatus(season.id!, 'upcoming')}
                                >
                                  <i className="fas fa-clock text-info me-2"></i>Upcoming
                                </button>
                              </li>
                              <li>
                                <button 
                                  className="dropdown-item" 
                                  onClick={() => updateSeasonStatus(season.id!, 'active')}
                                >
                                  <i className="fas fa-play text-success me-2"></i>Active
                                </button>
                              </li>
                              <li>
                                <button 
                                  className="dropdown-item" 
                                  onClick={() => updateSeasonStatus(season.id!, 'completed')}
                                >
                                  <i className="fas fa-check text-secondary me-2"></i>Completed
                                </button>
                              </li>
                              <li>
                                <button 
                                  className="dropdown-item" 
                                  onClick={() => updateSeasonStatus(season.id!, 'archived')}
                                >
                                  <i className="fas fa-archive text-dark me-2"></i>Archived
                                </button>
                              </li>
                            </ul>
                          </div>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(season.id!)}
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

      {/* Summary Stats */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Seasons</h5>
              <h2>{seasons.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Active Seasons</h5>
              <h2>{seasons.filter(s => s.status === 'active').length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Upcoming Seasons</h5>
              <h2>{seasons.filter(s => s.status === 'upcoming').length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <h5 className="card-title">Completed Seasons</h5>
              <h2>{seasons.filter(s => s.status === 'completed').length}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
