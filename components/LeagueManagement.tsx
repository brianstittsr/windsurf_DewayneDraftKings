'use client';

import { useState, useEffect } from 'react';
import { League } from '../lib/firestore-schema';

interface LeagueFormData {
  name: string;
  shortName: string;
  description: string;
  sport: 'flag_football' | 'basketball' | 'soccer' | 'volleyball' | 'other';
  type: 'recreational' | 'competitive' | 'professional' | 'youth';
  format: 'round-robin' | 'playoff' | 'tournament' | 'ladder';
  maxTeams: number;
  minTeams: number;
  maxPlayersPerTeam: number;
  gameLength: number;
  seasonStartDate: string;
  seasonEndDate: string;
  registrationDeadline: string;
  registrationFee: number;
  teamFee: number;
  playerFee: number;
  minAge?: number;
  maxAge?: number;
  isActive: boolean;
  isAcceptingRegistrations: boolean;
  organizerId: string;
  location: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
}

const initialFormData: LeagueFormData = {
  name: '',
  shortName: '',
  description: '',
  sport: 'flag_football',
  type: 'recreational',
  format: 'round-robin',
  maxTeams: 12,
  minTeams: 4,
  maxPlayersPerTeam: 15,
  gameLength: 60,
  seasonStartDate: '',
  seasonEndDate: '',
  registrationDeadline: '',
  registrationFee: 50,
  teamFee: 200,
  playerFee: 25,
  minAge: undefined,
  maxAge: undefined,
  isActive: true,
  isAcceptingRegistrations: true,
  organizerId: '',
  location: '',
  website: '',
  contactEmail: '',
  contactPhone: ''
};

export default function LeagueManagement() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'delete'>('create');
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [formData, setFormData] = useState<LeagueFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leagues');
      if (response.ok) {
        const data = await response.json();
        setLeagues(data.leagues || []);
      } else {
        console.error('Failed to fetch leagues');
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = modalMode === 'create' ? '/api/leagues' : `/api/leagues/${selectedLeague?.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchLeagues();
        setShowModal(false);
        setFormData(initialFormData);
        setSelectedLeague(null);
        alert(`League ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving league:', error);
      alert('Error saving league');
    }
  };

  const handleEdit = (league: League) => {
    setSelectedLeague(league);
    setFormData({
      name: league.name,
      shortName: league.shortName || '',
      description: league.description || '',
      sport: league.sport,
      type: league.type || 'recreational',
      format: league.format || 'round-robin',
      maxTeams: league.maxTeams,
      minTeams: league.minTeams || 4,
      maxPlayersPerTeam: league.maxPlayersPerTeam,
      gameLength: league.gameLength,
      seasonStartDate: league.seasonStartDate ? new Date(league.seasonStartDate.toDate()).toISOString().split('T')[0] : '',
      seasonEndDate: league.seasonEndDate ? new Date(league.seasonEndDate.toDate()).toISOString().split('T')[0] : '',
      registrationDeadline: league.registrationDeadline ? new Date(league.registrationDeadline.toDate()).toISOString().split('T')[0] : '',
      registrationFee: league.registrationFee || 50,
      teamFee: league.teamFee || 200,
      playerFee: league.playerFee || 25,
      minAge: league.ageRestrictions?.minAge,
      maxAge: league.ageRestrictions?.maxAge,
      isActive: league.isActive,
      isAcceptingRegistrations: league.isAcceptingRegistrations || false,
      organizerId: league.organizerId || '',
      location: league.location || '',
      website: league.website || '',
      contactEmail: league.contactEmail || '',
      contactPhone: league.contactPhone || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (league: League) => {
    setSelectedLeague(league);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (league: League) => {
    if (!confirm(`Are you sure you want to delete league "${league.name}"?`)) return;

    try {
      const response = await fetch(`/api/leagues/${league.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchLeagues();
        alert('League deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting league:', error);
      alert('Error deleting league');
    }
  };

  const handleCreate = () => {
    setSelectedLeague(null);
    setFormData(initialFormData);
    setModalMode('create');
    setShowModal(true);
  };

  const filteredLeagues = leagues.filter(league => {
    const matchesSearch = league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         league.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         league.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === 'all' || league.sport === sportFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && league.isActive) ||
                         (statusFilter === 'inactive' && !league.isActive) ||
                         (statusFilter === 'accepting' && league.isAcceptingRegistrations);
    return matchesSearch && matchesSport && matchesStatus;
  });

  return (
    <div className="league-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">League Management</h3>
          <p className="text-muted mb-0">Create and manage leagues</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCreate}
        >
          <i className="fas fa-plus me-2"></i>
          Create League
        </button>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search leagues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
          >
            <option value="all">All Sports</option>
            <option value="flag_football">Flag Football</option>
            <option value="basketball">Basketball</option>
            <option value="soccer">Soccer</option>
            <option value="volleyball">Volleyball</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="accepting">Accepting Registrations</option>
          </select>
        </div>
      </div>

      {/* Leagues Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredLeagues.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-trophy fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No leagues found</h5>
              <p className="text-muted">Create your first league to get started.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>League Name</th>
                    <th>Sport</th>
                    <th>Type</th>
                    <th>Teams</th>
                    <th>Season</th>
                    <th>Registration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeagues.map((league) => (
                    <tr key={league.id}>
                      <td>
                        <div>
                          <div className="fw-bold">{league.name}</div>
                          {league.shortName && (
                            <small className="text-muted">{league.shortName}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {league.sport.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted">
                          {league.type?.charAt(0).toUpperCase() + league.type?.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted">
                          {league.stats?.totalTeams || 0}/{league.maxTeams}
                        </span>
                      </td>
                      <td>
                        {league.seasonStartDate && league.seasonEndDate ? (
                          <span className="text-muted small">
                            {new Date(league.seasonStartDate.toDate()).toLocaleDateString()} - 
                            {new Date(league.seasonEndDate.toDate()).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted">Not set</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${league.isAcceptingRegistrations ? 'bg-success' : 'bg-secondary'}`}>
                          {league.isAcceptingRegistrations ? 'Open' : 'Closed'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${league.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {league.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleView(league)}
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEdit(league)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(league)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'create' && <><i className="fas fa-plus me-2"></i>Create League</>}
                  {modalMode === 'edit' && <><i className="fas fa-edit me-2"></i>Edit League</>}
                  {modalMode === 'view' && <><i className="fas fa-eye me-2"></i>View League</>}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {modalMode === 'view' && selectedLeague ? (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary mb-3">League Information</h6>
                      <p><strong>Name:</strong> {selectedLeague.name}</p>
                      <p><strong>Short Name:</strong> {selectedLeague.shortName || 'N/A'}</p>
                      <p><strong>Sport:</strong> {selectedLeague.sport.replace('_', ' ').toUpperCase()}</p>
                      <p><strong>Type:</strong> {selectedLeague.type}</p>
                      <p><strong>Format:</strong> {selectedLeague.format}</p>
                      <p><strong>Description:</strong> {selectedLeague.description || 'N/A'}</p>
                      <p><strong>Location:</strong> {selectedLeague.location || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-success mb-3">League Details</h6>
                      <p><strong>Max Teams:</strong> {selectedLeague.maxTeams}</p>
                      <p><strong>Players per Team:</strong> {selectedLeague.maxPlayersPerTeam}</p>
                      <p><strong>Game Length:</strong> {selectedLeague.gameLength} minutes</p>
                      <p><strong>Registration Fee:</strong> ${selectedLeague.registrationFee || 0}</p>
                      <p><strong>Team Fee:</strong> ${selectedLeague.teamFee || 0}</p>
                      <p><strong>Player Fee:</strong> ${selectedLeague.playerFee || 0}</p>
                      <p><strong>Contact:</strong> {selectedLeague.contactEmail || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      {/* Basic Information */}
                      <div className="col-12">
                        <h6 className="text-primary mb-3">Basic Information</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">League Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Short Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.shortName}
                            onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                            placeholder="e.g., APFL"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Sport *</label>
                          <select
                            className="form-select"
                            value={formData.sport}
                            onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value as any }))}
                            required
                          >
                            <option value="flag_football">Flag Football</option>
                            <option value="basketball">Basketball</option>
                            <option value="soccer">Soccer</option>
                            <option value="volleyball">Volleyball</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Type</label>
                          <select
                            className="form-select"
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                          >
                            <option value="recreational">Recreational</option>
                            <option value="competitive">Competitive</option>
                            <option value="professional">Professional</option>
                            <option value="youth">Youth</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Format</label>
                          <select
                            className="form-select"
                            value={formData.format}
                            onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as any }))}
                          >
                            <option value="round-robin">Round Robin</option>
                            <option value="playoff">Playoff</option>
                            <option value="tournament">Tournament</option>
                            <option value="ladder">Ladder</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="League description..."
                          />
                        </div>
                      </div>

                      {/* League Configuration */}
                      <div className="col-12">
                        <h6 className="text-info mb-3 mt-4">League Configuration</h6>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Max Teams *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.maxTeams}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxTeams: parseInt(e.target.value) }))}
                            min="2"
                            max="50"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Min Teams</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.minTeams}
                            onChange={(e) => setFormData(prev => ({ ...prev, minTeams: parseInt(e.target.value) }))}
                            min="2"
                            max="20"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Players per Team *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.maxPlayersPerTeam}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxPlayersPerTeam: parseInt(e.target.value) }))}
                            min="5"
                            max="30"
                            required
                          />
                        </div>
                      </div>

                      {/* Season Information */}
                      <div className="col-12">
                        <h6 className="text-warning mb-3 mt-4">Season Information</h6>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Season Start Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.seasonStartDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, seasonStartDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Season End Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.seasonEndDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, seasonEndDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Registration Deadline</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.registrationDeadline}
                            onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Pricing and Contact */}
                      <div className="col-12">
                        <h6 className="text-success mb-3 mt-4">Pricing & Contact</h6>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Registration Fee</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.registrationFee}
                            onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: parseFloat(e.target.value) }))}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Team Fee</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.teamFee}
                            onChange={(e) => setFormData(prev => ({ ...prev, teamFee: parseFloat(e.target.value) }))}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Player Fee</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.playerFee}
                            onChange={(e) => setFormData(prev => ({ ...prev, playerFee: parseFloat(e.target.value) }))}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Contact Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Contact Phone</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-12">
                        <h6 className="text-secondary mb-3 mt-4">Status & Settings</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.isActive}
                              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                            <label className="form-check-label">
                              Active League
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.isAcceptingRegistrations}
                              onChange={(e) => setFormData(prev => ({ ...prev, isAcceptingRegistrations: e.target.checked }))}
                            />
                            <label className="form-check-label">
                              Accepting Registrations
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    {modalMode === 'create' ? 'Create League' : 'Update League'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
