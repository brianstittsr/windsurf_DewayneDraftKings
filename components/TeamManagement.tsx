'use client';

import { useState, useEffect } from 'react';
import { Team } from '../lib/firestore-schema';

interface TeamFormData {
  name: string;
  shortName: string;
  division: 'men' | 'women' | 'mixed';
  coachId: string;
  coachName: string;
  description: string;
  maxRosterSize: number;
  ageGroup: 'youth' | 'adult' | 'senior' | 'mixed';
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  primaryColor: string;
  secondaryColor: string;
  homeField: string;
  isActive: boolean;
}

const initialFormData: TeamFormData = {
  name: '',
  shortName: '',
  division: 'mixed',
  coachId: '',
  coachName: '',
  description: '',
  maxRosterSize: 15,
  ageGroup: 'adult',
  skillLevel: 'intermediate',
  primaryColor: '#007bff',
  secondaryColor: '#6c757d',
  homeField: '',
  isActive: true
};

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'delete'>('create');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');

  // Available coaches for dropdown
  const [availableCoaches, setAvailableCoaches] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetchTeams();
    fetchCoaches();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else {
        console.error('Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      const response = await fetch('/api/users?role=coach');
      if (response.ok) {
        const data = await response.json();
        setAvailableCoaches(data.users?.map((coach: any) => ({
          id: coach.id,
          name: `${coach.firstName} ${coach.lastName}`
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = modalMode === 'create' ? '/api/teams' : `/api/teams/${selectedTeam?.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchTeams();
        setShowModal(false);
        setFormData(initialFormData);
        setSelectedTeam(null);
        alert(`Team ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Error saving team');
    }
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      shortName: team.shortName || '',
      division: team.division,
      coachId: team.coachId,
      coachName: team.coachName,
      description: team.description || '',
      maxRosterSize: team.maxRosterSize,
      ageGroup: team.ageGroup || 'adult',
      skillLevel: team.skillLevel || 'intermediate',
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
      homeField: team.homeField || '',
      isActive: team.isActive
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (team: Team) => {
    setSelectedTeam(team);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (team: Team) => {
    if (!confirm(`Are you sure you want to delete team "${team.name}"?`)) return;

    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchTeams();
        alert('Team deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error deleting team');
    }
  };

  const handleCreate = () => {
    setSelectedTeam(null);
    setFormData(initialFormData);
    setModalMode('create');
    setShowModal(true);
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.coachName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = divisionFilter === 'all' || team.division === divisionFilter;
    return matchesSearch && matchesDivision;
  });

  return (
    <div className="team-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Team Management</h3>
          <p className="text-muted mb-0">Create and manage teams</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCreate}
        >
          <i className="fas fa-plus me-2"></i>
          Create Team
        </button>
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
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
          >
            <option value="all">All Divisions</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      {/* Teams Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No teams found</h5>
              <p className="text-muted">Create your first team to get started.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Division</th>
                    <th>Coach</th>
                    <th>Roster</th>
                    <th>Record</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team) => (
                    <tr key={team.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="team-color-indicator me-2"
                            style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: team.primaryColor,
                              borderRadius: '3px'
                            }}
                          ></div>
                          <div>
                            <div className="fw-bold">{team.name}</div>
                            {team.shortName && (
                              <small className="text-muted">{team.shortName}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          team.division === 'men' ? 'bg-primary' :
                          team.division === 'women' ? 'bg-info' : 'bg-success'
                        }`}>
                          {team.division.charAt(0).toUpperCase() + team.division.slice(1)}
                        </span>
                      </td>
                      <td>{team.coachName}</td>
                      <td>
                        <span className="text-muted">
                          {team.currentRosterSize || 0}/{team.maxRosterSize}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted">
                          {team.stats?.wins || 0}-{team.stats?.losses || 0}-{team.stats?.ties || 0}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${team.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {team.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleView(team)}
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEdit(team)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(team)}
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'create' && <><i className="fas fa-plus me-2"></i>Create Team</>}
                  {modalMode === 'edit' && <><i className="fas fa-edit me-2"></i>Edit Team</>}
                  {modalMode === 'view' && <><i className="fas fa-eye me-2"></i>View Team</>}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {modalMode === 'view' && selectedTeam ? (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary mb-3">Team Information</h6>
                      <p><strong>Name:</strong> {selectedTeam.name}</p>
                      <p><strong>Short Name:</strong> {selectedTeam.shortName || 'N/A'}</p>
                      <p><strong>Division:</strong> {selectedTeam.division}</p>
                      <p><strong>Coach:</strong> {selectedTeam.coachName}</p>
                      <p><strong>Description:</strong> {selectedTeam.description || 'N/A'}</p>
                      <p><strong>Home Field:</strong> {selectedTeam.homeField || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-success mb-3">Team Details</h6>
                      <p><strong>Max Roster Size:</strong> {selectedTeam.maxRosterSize}</p>
                      <p><strong>Current Roster:</strong> {selectedTeam.currentRosterSize || 0}</p>
                      <p><strong>Age Group:</strong> {selectedTeam.ageGroup || 'N/A'}</p>
                      <p><strong>Skill Level:</strong> {selectedTeam.skillLevel || 'N/A'}</p>
                      <p><strong>Status:</strong> 
                        <span className={`badge ms-2 ${selectedTeam.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {selectedTeam.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                      <div className="d-flex align-items-center">
                        <strong>Team Colors:</strong>
                        <div className="ms-2 d-flex">
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: selectedTeam.primaryColor,
                              border: '1px solid #ccc',
                              marginRight: '5px'
                            }}
                          ></div>
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: selectedTeam.secondaryColor,
                              border: '1px solid #ccc'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Team Name *</label>
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
                            placeholder="e.g., LAK"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Division *</label>
                          <select
                            className="form-select"
                            value={formData.division}
                            onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value as 'men' | 'women' | 'mixed' }))}
                            required
                          >
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Coach *</label>
                          <select
                            className="form-select"
                            value={formData.coachId}
                            onChange={(e) => {
                              const selectedCoach = availableCoaches.find(c => c.id === e.target.value);
                              setFormData(prev => ({ 
                                ...prev, 
                                coachId: e.target.value,
                                coachName: selectedCoach?.name || ''
                              }));
                            }}
                            required
                          >
                            <option value="">Select a coach</option>
                            {availableCoaches.map(coach => (
                              <option key={coach.id} value={coach.id}>{coach.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Team description..."
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Max Roster Size *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.maxRosterSize}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxRosterSize: parseInt(e.target.value) }))}
                            min="1"
                            max="50"
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Age Group</label>
                          <select
                            className="form-select"
                            value={formData.ageGroup}
                            onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value as any }))}
                          >
                            <option value="youth">Youth</option>
                            <option value="adult">Adult</option>
                            <option value="senior">Senior</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Skill Level</label>
                          <select
                            className="form-select"
                            value={formData.skillLevel}
                            onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value as any }))}
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="professional">Professional</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Home Field</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.homeField}
                            onChange={(e) => setFormData(prev => ({ ...prev, homeField: e.target.value }))}
                            placeholder="e.g., All Pro Sports Complex"
                          />
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <div className="mb-3">
                              <label className="form-label">Primary Color</label>
                              <input
                                type="color"
                                className="form-control form-control-color"
                                value={formData.primaryColor}
                                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="mb-3">
                              <label className="form-label">Secondary Color</label>
                              <input
                                type="color"
                                className="form-control form-control-color"
                                value={formData.secondaryColor}
                                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.isActive}
                              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                            <label className="form-check-label">
                              Active Team
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
                    {modalMode === 'create' ? 'Create Team' : 'Update Team'}
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
