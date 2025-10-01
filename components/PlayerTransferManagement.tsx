'use client';

import { useState, useEffect } from 'react';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  teamId?: string;
  teamName?: string;
  position?: string;
  jerseyNumber?: string;
  status: string;
}

interface Team {
  id: string;
  name: string;
  season: string;
  coachName?: string;
  playerCount?: number;
}

interface TransferRequest {
  id?: string;
  playerId: string;
  playerName: string;
  fromTeamId: string;
  fromTeamName: string;
  toTeamId: string;
  toTeamName: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export default function PlayerTransferManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [targetTeamId, setTargetTeamId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchPlayers(),
        fetchTeams(),
        fetchTransfers()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      setPlayers(data.players || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchTransfers = async () => {
    try {
      const response = await fetch('/api/player-transfers');
      const data = await response.json();
      setTransfers(data.transfers || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  const initiateTransfer = (player: Player) => {
    setSelectedPlayer(player);
    setTargetTeamId('');
    setTransferNotes('');
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async () => {
    if (!selectedPlayer || !targetTeamId) {
      alert('Please select a target team');
      return;
    }

    if (selectedPlayer.teamId === targetTeamId) {
      alert('Player is already on this team');
      return;
    }

    try {
      const targetTeam = teams.find(t => t.id === targetTeamId);
      const currentTeam = teams.find(t => t.id === selectedPlayer.teamId);

      const transferData = {
        playerId: selectedPlayer.id,
        playerName: `${selectedPlayer.firstName} ${selectedPlayer.lastName}`,
        fromTeamId: selectedPlayer.teamId || '',
        fromTeamName: currentTeam?.name || 'Unassigned',
        toTeamId: targetTeamId,
        toTeamName: targetTeam?.name || '',
        notes: transferNotes,
        requestedBy: 'Coach', // This should be the actual coach's name from auth
        status: 'pending'
      };

      const response = await fetch('/api/player-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData)
      });

      if (response.ok) {
        await fetchTransfers();
        setShowTransferModal(false);
        setSelectedPlayer(null);
        alert('Transfer request submitted successfully!');
      } else {
        throw new Error('Failed to submit transfer request');
      }
    } catch (error) {
      console.error('Error submitting transfer:', error);
      alert('Error submitting transfer request');
    }
  };

  const approveTransfer = async (transfer: TransferRequest) => {
    if (!confirm(`Approve transfer of ${transfer.playerName} to ${transfer.toTeamName}?`)) return;

    try {
      // Update transfer status
      const response = await fetch(`/api/player-transfers/${transfer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transfer,
          status: 'approved',
          approvedBy: 'Admin', // Should be actual admin name
          approvedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Update player's team
        await fetch(`/api/players/${transfer.playerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId: transfer.toTeamId,
            teamName: transfer.toTeamName
          })
        });

        await fetchData();
        alert('Transfer approved successfully!');
      }
    } catch (error) {
      console.error('Error approving transfer:', error);
      alert('Error approving transfer');
    }
  };

  const rejectTransfer = async (transfer: TransferRequest) => {
    if (!confirm(`Reject transfer of ${transfer.playerName}?`)) return;

    try {
      const response = await fetch(`/api/player-transfers/${transfer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transfer,
          status: 'rejected',
          approvedBy: 'Admin',
          approvedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        await fetchTransfers();
        alert('Transfer rejected');
      }
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      alert('Error rejecting transfer');
    }
  };

  const quickSwap = async (player: Player, newTeamId: string) => {
    if (!confirm(`Immediately move ${player.firstName} ${player.lastName} to the selected team?`)) return;

    try {
      const newTeam = teams.find(t => t.id === newTeamId);
      
      await fetch(`/api/players/${player.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: newTeamId,
          teamName: newTeam?.name || ''
        })
      });

      await fetchPlayers();
      alert('Player moved successfully!');
    } catch (error) {
      console.error('Error moving player:', error);
      alert('Error moving player');
    }
  };

  const filteredPlayers = players.filter(player => {
    if (filterTeam !== 'all' && player.teamId !== filterTeam) return false;
    return true;
  });

  const filteredTransfers = transfers.filter(transfer => {
    if (filterStatus !== 'all' && transfer.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger'
    };
    return badges[status as keyof typeof badges] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading player transfer system...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-exchange-alt me-2"></i>
          Player Transfer Management
        </h2>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && selectedPlayer && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-exchange-alt me-2"></i>
                  Transfer Player
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTransferModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Player</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`${selectedPlayer.firstName} ${selectedPlayer.lastName}`}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Current Team</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedPlayer.teamName || 'Unassigned'}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Transfer To Team *</label>
                  <select
                    className="form-select"
                    value={targetTeamId}
                    onChange={(e) => setTargetTeamId(e.target.value)}
                    required
                  >
                    <option value="">Select Team...</option>
                    {teams
                      .filter(t => t.id !== selectedPlayer.teamId)
                      .map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.season})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="Reason for transfer..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTransferModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleTransferSubmit}
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Submit Transfer Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className="nav-link active"
            data-bs-toggle="tab"
            data-bs-target="#players-tab"
          >
            <i className="fas fa-users me-2"></i>
            Players ({players.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#transfers-tab"
          >
            <i className="fas fa-exchange-alt me-2"></i>
            Transfer Requests ({transfers.filter(t => t.status === 'pending').length} pending)
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {/* Players Tab */}
        <div className="tab-pane fade show active" id="players-tab">
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
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
                        {team.name} ({team.playerCount || 0} players)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Player</th>
                      <th>Current Team</th>
                      <th>Position</th>
                      <th>Jersey #</th>
                      <th>Quick Transfer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player) => (
                      <tr key={player.id}>
                        <td>
                          <strong>{player.firstName} {player.lastName}</strong>
                          <div className="small text-muted">{player.email}</div>
                        </td>
                        <td>
                          <span className="badge bg-primary">
                            {player.teamName || 'Unassigned'}
                          </span>
                        </td>
                        <td>{player.position || '-'}</td>
                        <td>{player.jerseyNumber || '-'}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            onChange={(e) => {
                              if (e.target.value) {
                                quickSwap(player, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          >
                            <option value="">Move to...</option>
                            {teams
                              .filter(t => t.id !== player.teamId)
                              .map(team => (
                                <option key={team.id} value={team.id}>
                                  {team.name}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => initiateTransfer(player)}
                          >
                            <i className="fas fa-exchange-alt me-1"></i>
                            Request Transfer
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

        {/* Transfers Tab */}
        <div className="tab-pane fade" id="transfers-tab">
          <div className="card mb-4">
            <div className="card-body">
              <div className="btn-group w-100" role="group">
                <button
                  className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All ({transfers.length})
                </button>
                <button
                  className={`btn ${filterStatus === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending ({transfers.filter(t => t.status === 'pending').length})
                </button>
                <button
                  className={`btn ${filterStatus === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setFilterStatus('approved')}
                >
                  Approved ({transfers.filter(t => t.status === 'approved').length})
                </button>
                <button
                  className={`btn ${filterStatus === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setFilterStatus('rejected')}
                >
                  Rejected ({transfers.filter(t => t.status === 'rejected').length})
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Player</th>
                      <th>From Team</th>
                      <th>To Team</th>
                      <th>Requested By</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransfers.map((transfer) => (
                      <tr key={transfer.id}>
                        <td>
                          <strong>{transfer.playerName}</strong>
                          {transfer.notes && (
                            <div className="small text-muted">{transfer.notes}</div>
                          )}
                        </td>
                        <td>{transfer.fromTeamName}</td>
                        <td>{transfer.toTeamName}</td>
                        <td>{transfer.requestedBy}</td>
                        <td>
                          <small>{new Date(transfer.requestedAt).toLocaleDateString()}</small>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(transfer.status)}`}>
                            {transfer.status}
                          </span>
                        </td>
                        <td>
                          {transfer.status === 'pending' && (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-success"
                                onClick={() => approveTransfer(transfer)}
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => rejectTransfer(transfer)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          )}
                          {transfer.status !== 'pending' && transfer.approvedBy && (
                            <small className="text-muted">
                              By {transfer.approvedBy}
                            </small>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
