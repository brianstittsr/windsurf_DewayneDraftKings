'use client';

import { useState, useEffect } from 'react';

interface FacebookLink {
  id?: string;
  entityType: 'team' | 'player' | 'coach' | 'league' | 'season';
  entityId: string;
  entityName: string;
  facebookUrl: string;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function FacebookLinksManagement() {
  const [links, setLinks] = useState<FacebookLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<FacebookLink | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState<Partial<FacebookLink>>({
    entityType: 'team',
    entityId: '',
    entityName: '',
    facebookUrl: '',
    isActive: true,
    notes: ''
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/facebook-links');
      const data = await response.json();
      setLinks(data.links || []);
    } catch (error) {
      console.error('Error fetching Facebook links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingLink ? `/api/facebook-links/${editingLink.id}` : '/api/facebook-links';
      const method = editingLink ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchLinks();
        resetForm();
        alert(editingLink ? 'Facebook link updated successfully!' : 'Facebook link created successfully!');
      } else {
        throw new Error('Failed to save Facebook link');
      }
    } catch (error) {
      console.error('Error saving Facebook link:', error);
      alert('Error saving Facebook link. Please try again.');
    }
  };

  const handleEdit = (link: FacebookLink) => {
    setEditingLink(link);
    setFormData(link);
    setShowForm(true);
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this Facebook link?')) return;

    try {
      const response = await fetch(`/api/facebook-links?id=${linkId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchLinks();
        alert('Facebook link deleted successfully!');
      } else {
        alert('Error deleting Facebook link');
      }
    } catch (error) {
      console.error('Error deleting Facebook link:', error);
      alert('Error deleting Facebook link');
    }
  };

  const resetForm = () => {
    setFormData({
      entityType: 'team',
      entityId: '',
      entityName: '',
      facebookUrl: '',
      isActive: true,
      notes: ''
    });
    setEditingLink(null);
    setShowForm(false);
  };

  const toggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
    try {
      const link = links.find(l => l.id === linkId);
      if (!link) return;

      const response = await fetch(`/api/facebook-links/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...link, isActive: !currentStatus })
      });

      if (response.ok) {
        await fetchLinks();
        alert(`Facebook link ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (error) {
      console.error('Error toggling link status:', error);
      alert('Error updating link status');
    }
  };

  const filteredLinks = filterType === 'all' 
    ? links 
    : links.filter(link => link.entityType === filterType);

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'team': return 'fa-users';
      case 'player': return 'fa-user';
      case 'coach': return 'fa-whistle';
      case 'league': return 'fa-trophy';
      case 'season': return 'fa-calendar';
      default: return 'fa-link';
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'team': return 'primary';
      case 'player': return 'success';
      case 'coach': return 'info';
      case 'league': return 'warning';
      case 'season': return 'secondary';
      default: return 'dark';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Facebook links...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fab fa-facebook me-2 text-primary"></i>
          Facebook Links Management
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Add Facebook Link
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="btn-group w-100" role="group">
            <button
              className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterType('all')}
            >
              <i className="fas fa-globe me-1"></i>
              All ({links.length})
            </button>
            <button
              className={`btn ${filterType === 'team' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterType('team')}
            >
              <i className="fas fa-users me-1"></i>
              Teams ({links.filter(l => l.entityType === 'team').length})
            </button>
            <button
              className={`btn ${filterType === 'player' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilterType('player')}
            >
              <i className="fas fa-user me-1"></i>
              Players ({links.filter(l => l.entityType === 'player').length})
            </button>
            <button
              className={`btn ${filterType === 'coach' ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setFilterType('coach')}
            >
              <i className="fas fa-whistle me-1"></i>
              Coaches ({links.filter(l => l.entityType === 'coach').length})
            </button>
            <button
              className={`btn ${filterType === 'league' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setFilterType('league')}
            >
              <i className="fas fa-trophy me-1"></i>
              Leagues ({links.filter(l => l.entityType === 'league').length})
            </button>
            <button
              className={`btn ${filterType === 'season' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterType('season')}
            >
              <i className="fas fa-calendar me-1"></i>
              Seasons ({links.filter(l => l.entityType === 'season').length})
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
                  <i className="fab fa-facebook me-2"></i>
                  {editingLink ? 'Edit Facebook Link' : 'Add Facebook Link'}
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
                    <div className="col-md-6">
                      <label className="form-label">Entity Type *</label>
                      <select
                        className="form-select"
                        value={formData.entityType || 'team'}
                        onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value as any }))}
                        required
                      >
                        <option value="team">Team</option>
                        <option value="player">Player</option>
                        <option value="coach">Coach</option>
                        <option value="league">League</option>
                        <option value="season">Season</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Entity ID *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.entityId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, entityId: e.target.value }))}
                        placeholder="e.g., team_123, player_456"
                        required
                      />
                      <small className="text-muted">The unique ID of the team, player, coach, league, or season</small>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Entity Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.entityName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, entityName: e.target.value }))}
                        placeholder="e.g., Thunder Bolts, John Smith, 2024 Season"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Facebook URL *</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fab fa-facebook"></i>
                        </span>
                        <input
                          type="url"
                          className="form-control"
                          value={formData.facebookUrl || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, facebookUrl: e.target.value }))}
                          placeholder="https://www.facebook.com/..."
                          required
                        />
                      </div>
                      <small className="text-muted">Full Facebook page or profile URL</small>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.notes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes or information..."
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.isActive || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <label className="form-check-label">
                          Active (Display this link publicly)
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
                    <i className="fab fa-facebook me-2"></i>
                    {editingLink ? 'Update Link' : 'Add Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className="text-center py-5">
          <i className="fab fa-facebook fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">No Facebook links found</h4>
          <p className="text-muted">
            {filterType === 'all' 
              ? 'Add your first Facebook link to get started.' 
              : `No ${filterType} Facebook links found.`}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Type</th>
                    <th>Entity Name</th>
                    <th>Entity ID</th>
                    <th>Facebook URL</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link) => (
                    <tr key={link.id}>
                      <td>
                        <span className={`badge bg-${getEntityColor(link.entityType)}`}>
                          <i className={`fas ${getEntityIcon(link.entityType)} me-1`}></i>
                          {link.entityType}
                        </span>
                      </td>
                      <td>
                        <strong>{link.entityName}</strong>
                        {link.notes && (
                          <div className="small text-muted">{link.notes}</div>
                        )}
                      </td>
                      <td>
                        <code className="small">{link.entityId}</code>
                      </td>
                      <td>
                        <a 
                          href={link.facebookUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          <i className="fab fa-facebook me-1"></i>
                          View Page
                          <i className="fas fa-external-link-alt ms-1 small"></i>
                        </a>
                      </td>
                      <td>
                        <span className={`badge ${link.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(link)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className={`btn ${link.isActive ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                            onClick={() => toggleLinkStatus(link.id!, link.isActive)}
                            title={link.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`fas ${link.isActive ? 'fa-toggle-off' : 'fa-toggle-on'}`}></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(link.id!)}
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
              <h5 className="card-title">Total Links</h5>
              <h2>{links.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Active Links</h5>
              <h2>{links.filter(l => l.isActive).length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Teams</h5>
              <h2>{links.filter(l => l.entityType === 'team').length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">Players</h5>
              <h2>{links.filter(l => l.entityType === 'player').length}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
