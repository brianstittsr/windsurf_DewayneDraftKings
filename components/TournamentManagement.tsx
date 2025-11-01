'use client';

import React, { useState, useEffect } from 'react';
import TournamentBracket from './TournamentBracket';
import { TournamentMatch } from '@/lib/firestore-schema';

interface Tournament {
  id: string;
  name: string;
  description: string;
  leagueId: string;
  seasonId: string;
  type: 'single-elimination' | 'double-elimination';
  status: 'draft' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  teams: any[];
  matches: TournamentMatch[];
  createdAt: string;
}

export default function TournamentManagement() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leagueId: '',
    seasonId: '',
    type: 'single-elimination' as Tournament['type'],
    startDate: '',
    endDate: '',
    selectedTeams: [] as string[]
  });

  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchTournaments();
    fetchLeagues();
    fetchTeams();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments');
      if (response.ok) {
        const data = await response.json();
        setTournaments(data.tournaments || []);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/leagues');
      if (response.ok) {
        const data = await response.json();
        setLeagues(data.leagues || []);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
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

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedTeamsData = teams.filter(t => formData.selectedTeams.includes(t.id));
      
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teams: selectedTeamsData
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Tournament created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchTournaments();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      leagueId: '',
      seasonId: '',
      type: 'single-elimination',
      startDate: '',
      endDate: '',
      selectedTeams: []
    });
  };

  const handleMatchUpdate = async (match: any) => {
    if (!selectedTournament) return;

    try {
      await fetch(`/api/tournaments/${selectedTournament.id}/matches`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match })
      });
    } catch (error) {
      console.error('Error updating match:', error);
    }
  };

  return (
    <div className="tournament-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="fas fa-trophy me-2"></i>
            Tournament Management
          </h2>
          <p className="text-muted mb-0">Create and manage tournament brackets</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Create Tournament
        </button>
      </div>

      {/* Tournament List */}
      {!selectedTournament ? (
        <div className="row">
          {tournaments.length === 0 ? (
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="fas fa-trophy fa-3x text-muted mb-3"></i>
                  <h4 className="text-muted">No Tournaments Yet</h4>
                  <p className="text-muted">Create your first tournament to get started</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Create Tournament
                  </button>
                </div>
              </div>
            </div>
          ) : (
            tournaments.map(tournament => (
              <div key={tournament.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">{tournament.name}</h5>
                  </div>
                  <div className="card-body">
                    <p className="card-text">{tournament.description}</p>
                    <div className="mb-2">
                      <small className="text-muted">Type:</small>
                      <br />
                      <span className="badge bg-info">
                        {tournament.type === 'single-elimination' ? 'Single Elimination' : 'Double Elimination'}
                      </span>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Teams:</small>
                      <br />
                      <strong>{tournament.teams?.length || 0}</strong>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Status:</small>
                      <br />
                      <span className={`badge bg-${
                        tournament.status === 'active' ? 'success' :
                        tournament.status === 'completed' ? 'secondary' : 'warning'
                      }`}>
                        {tournament.status}
                      </span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button
                      className="btn btn-primary btn-sm w-100"
                      onClick={() => setSelectedTournament(tournament)}
                    >
                      <i className="fas fa-eye me-2"></i>
                      View Bracket
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {/* Back button */}
          <button
            className="btn btn-secondary mb-3"
            onClick={() => setSelectedTournament(null)}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Tournaments
          </button>

          {/* Bracket display */}
          <TournamentBracket
            tournamentId={selectedTournament.id}
            tournamentName={selectedTournament.name}
            teams={selectedTournament.teams}
            matches={selectedTournament.matches}
            type={selectedTournament.type}
            onMatchUpdate={handleMatchUpdate}
          />
        </>
      )}

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Tournament</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateTournament}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Tournament Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Type *</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      >
                        <option value="single-elimination">Single Elimination</option>
                        <option value="double-elimination">Double Elimination</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">League</label>
                      <select
                        className="form-select"
                        value={formData.leagueId}
                        onChange={(e) => setFormData({...formData, leagueId: e.target.value})}
                      >
                        <option value="">Select League</option>
                        {leagues.map(league => (
                          <option key={league.id} value={league.id}>
                            {league.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Season</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.seasonId}
                        onChange={(e) => setFormData({...formData, seasonId: e.target.value})}
                        placeholder="e.g., Fall 2024"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Select Teams *</label>
                    <select
                      className="form-select"
                      multiple
                      size={8}
                      value={formData.selectedTeams}
                      onChange={(e) => setFormData({
                        ...formData,
                        selectedTeams: Array.from(e.target.selectedOptions, option => option.value)
                      })}
                      required
                    >
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.players?.length || 0} players)
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      Hold Ctrl/Cmd to select multiple teams. Selected: {formData.selectedTeams.length}
                    </small>
                  </div>

                  {formData.selectedTeams.length > 0 && (
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Bracket will have {Math.ceil(Math.log2(formData.selectedTeams.length))} rounds</strong>
                      {formData.selectedTeams.length !== Math.pow(2, Math.ceil(Math.log2(formData.selectedTeams.length))) && (
                        <div className="mt-2">
                          <small>
                            Note: {Math.pow(2, Math.ceil(Math.log2(formData.selectedTeams.length))) - formData.selectedTeams.length} teams will receive first-round byes
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || formData.selectedTeams.length < 2}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Create Tournament
                      </>
                    )}
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
