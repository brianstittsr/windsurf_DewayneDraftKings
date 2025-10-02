'use client';

import React, { useState, useEffect } from 'react';

interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Player specific
  position?: string;
  jerseySize?: string;
  jerseyNumber?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  
  // Medical Info
  allergies?: string;
  medications?: string;
  medicalConditions?: string;
  
  // Current Assignment
  currentTeamId?: string;
  currentTeamName?: string;
  currentCoachId?: string;
  currentCoachName?: string;
  
  // Registration Info
  registrationDate?: string;
  paymentStatus?: string;
  planType?: string;
}

interface Team {
  id: string;
  name: string;
  coachId: string;
  coachName: string;
}

export default function PlayerSwapManagement() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetTeamId, setTargetTeamId] = useState('');
  const [swapReason, setSwapReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [editFormData, setEditFormData] = useState<Partial<PlayerData>>({});

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players');
      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players || []);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleSwapPlayer = async () => {
    if (!selectedPlayer || !targetTeamId) {
      alert('Please select a target team');
      return;
    }

    try {
      const response = await fetch('/api/players/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: selectedPlayer.id,
          fromTeamId: selectedPlayer.currentTeamId,
          toTeamId: targetTeamId,
          reason: swapReason
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Player swapped successfully!');
        setShowSwapModal(false);
        setSelectedPlayer(null);
        setTargetTeamId('');
        setSwapReason('');
        fetchPlayers();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error swapping player:', error);
      alert('Failed to swap player');
    }
  };

  const openSwapModal = (player: PlayerData) => {
    setSelectedPlayer(player);
    setShowSwapModal(true);
  };

  const openEditModal = (player: PlayerData) => {
    setSelectedPlayer(player);
    setEditFormData(player);
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    setEditFormData({});
    setShowCreateModal(true);
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Player created successfully!');
        setShowCreateModal(false);
        setEditFormData({});
        fetchPlayers();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating player:', error);
      alert('Failed to create player');
    }
  };

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlayer) return;

    try {
      const response = await fetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editFormData, id: selectedPlayer.id })
      });

      const data = await response.json();

      if (data.success) {
        alert('Player updated successfully!');
        setShowEditModal(false);
        setSelectedPlayer(null);
        setEditFormData({});
        fetchPlayers();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Failed to update player');
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/players?id=${playerId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Player deleted successfully');
        fetchPlayers();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Failed to delete player');
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = filterTeam === 'all' || player.currentTeamId === filterTeam;
    
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="player-swap-management">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-exchange-alt me-2"></i>
              Player Management & Swaps
            </h5>
            <button
              className="btn btn-light btn-sm"
              onClick={openCreateModal}
            >
              <i className="fas fa-plus me-2"></i>
              Add Player
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Player Swaps:</strong> Transfer players between teams/coaches. All registration data is preserved during the swap.
          </div>

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label">Search Players</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Filter by Team</label>
              <select
                className="form-select"
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
              >
                <option value="all">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} (Coach: {team.coachName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No Players Found</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Player Name</th>
                    <th>Contact</th>
                    <th>Position</th>
                    <th>Current Team</th>
                    <th>Current Coach</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.id}>
                      <td className="fw-bold">
                        {player.firstName} {player.lastName}
                      </td>
                      <td className="small">
                        <div>{player.email}</div>
                        <div className="text-muted">{player.phone}</div>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {player.position || 'N/A'}
                        </span>
                      </td>
                      <td>{player.currentTeamName || 'Unassigned'}</td>
                      <td>{player.currentCoachName || 'N/A'}</td>
                      <td>
                        <span className={`badge ${
                          player.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'
                        }`}>
                          {player.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-primary"
                            onClick={() => openSwapModal(player)}
                            title="Swap Team"
                          >
                            <i className="fas fa-exchange-alt"></i>
                          </button>
                          <button
                            className="btn btn-info"
                            onClick={() => openEditModal(player)}
                            title="Edit Player"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeletePlayer(player.id)}
                            title="Delete Player"
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

      {/* Swap Modal */}
      {showSwapModal && selectedPlayer && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-exchange-alt me-2"></i>
                  Swap Player: {selectedPlayer.firstName} {selectedPlayer.lastName}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowSwapModal(false);
                    setSelectedPlayer(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {/* Player Information */}
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="mb-0">Player Information</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Name:</strong> {selectedPlayer.firstName} {selectedPlayer.lastName}</p>
                        <p><strong>Email:</strong> {selectedPlayer.email}</p>
                        <p><strong>Phone:</strong> {selectedPlayer.phone}</p>
                        <p><strong>DOB:</strong> {selectedPlayer.dateOfBirth}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Position:</strong> {selectedPlayer.position || 'N/A'}</p>
                        <p><strong>Jersey:</strong> #{selectedPlayer.jerseyNumber} ({selectedPlayer.jerseySize})</p>
                        <p><strong>Registration:</strong> {selectedPlayer.registrationDate}</p>
                        <p><strong>Plan:</strong> {selectedPlayer.planType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Assignment */}
                <div className="alert alert-info">
                  <strong>Current Assignment:</strong><br/>
                  Team: {selectedPlayer.currentTeamName || 'Unassigned'}<br/>
                  Coach: {selectedPlayer.currentCoachName || 'N/A'}
                </div>

                {/* New Team Selection */}
                <div className="mb-3">
                  <label className="form-label">Select New Team *</label>
                  <select
                    className="form-select"
                    value={targetTeamId}
                    onChange={(e) => setTargetTeamId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Team --</option>
                    {teams
                      .filter(team => team.id !== selectedPlayer.currentTeamId)
                      .map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} (Coach: {team.coachName})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Reason */}
                <div className="mb-3">
                  <label className="form-label">Reason for Swap</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Optional: Explain why this player is being swapped..."
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                  />
                </div>

                {/* Emergency Contact & Medical Info */}
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Additional Information (Preserved)</h6>
                  </div>
                  <div className="card-body">
                    <p><strong>Emergency Contact:</strong> {selectedPlayer.emergencyContactName} ({selectedPlayer.emergencyContactRelationship}) - {selectedPlayer.emergencyContactPhone}</p>
                    {selectedPlayer.allergies && (
                      <p><strong>Allergies:</strong> {selectedPlayer.allergies}</p>
                    )}
                    {selectedPlayer.medications && (
                      <p><strong>Medications:</strong> {selectedPlayer.medications}</p>
                    )}
                    {selectedPlayer.medicalConditions && (
                      <p><strong>Medical Conditions:</strong> {selectedPlayer.medicalConditions}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowSwapModal(false);
                    setSelectedPlayer(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSwapPlayer}
                  disabled={!targetTeamId}
                >
                  <i className="fas fa-exchange-alt me-2"></i>
                  Confirm Swap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Player Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {showCreateModal ? 'Add New Player' : 'Edit Player'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditFormData({});
                  }}
                ></button>
              </div>
              <form onSubmit={showCreateModal ? handleCreatePlayer : handleUpdatePlayer}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.firstName || ''}
                        onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.lastName || ''}
                        onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editFormData.phone || ''}
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editFormData.dateOfBirth || ''}
                        onChange={(e) => setEditFormData({...editFormData, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Position</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.position || ''}
                        onChange={(e) => setEditFormData({...editFormData, position: e.target.value})}
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.address || ''}
                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.city || ''}
                        onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.state || ''}
                        onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.zipCode || ''}
                        onChange={(e) => setEditFormData({...editFormData, zipCode: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setEditFormData({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {showCreateModal ? 'Create Player' : 'Update Player'}
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
