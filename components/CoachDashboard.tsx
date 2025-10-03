'use client';

import { useState, useEffect } from 'react';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position?: string;
  jerseyNumber?: number;
  stats?: {
    games: number;
    touchdowns: number;
    yards: number;
    tackles: number;
  };
  attendance?: number;
  status: string;
}

interface Team {
  id: string;
  name: string;
  division: string;
  players: Player[];
  coachId: string;
  coachName: string;
}

export default function CoachDashboard({ coachId }: { coachId?: string }) {
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (coachId) {
      fetchMyTeams();
    }
  }, [coachId]);

  const fetchMyTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coaches/${coachId}/teams`);
      if (response.ok) {
        const data = await response.json();
        setMyTeams(data.teams || []);
        if (data.teams?.length > 0) {
          setSelectedTeam(data.teams[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (myTeams.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <h4>No Teams Assigned</h4>
          <p className="text-muted">You haven't been assigned to any teams yet.</p>
          <p className="text-muted">Contact an administrator to be assigned to a team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coach-dashboard">
      <div className="row mb-4">
        <div className="col-md-12">
          <h2>
            <i className="fas fa-clipboard-list me-2"></i>
            My Teams & Players
          </h2>
          <p className="text-muted">Manage your team roster and player information</p>
        </div>
      </div>

      {/* Team Selector */}
      {myTeams.length > 1 && (
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold">Select Team</label>
            <select
              className="form-select"
              value={selectedTeam?.id || ''}
              onChange={(e) => {
                const team = myTeams.find(t => t.id === e.target.value);
                setSelectedTeam(team || null);
              }}
            >
              {myTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.players?.length || 0} players)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Team Overview */}
      {selectedTeam && (
        <>
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h6 className="text-white-50">Total Players</h6>
                  <h2 className="mb-0">{selectedTeam.players?.length || 0}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h6 className="text-white-50">Active Players</h6>
                  <h2 className="mb-0">
                    {selectedTeam.players?.filter(p => p.status === 'active').length || 0}
                  </h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h6 className="text-white-50">Avg Attendance</h6>
                  <h2 className="mb-0">
                    {selectedTeam.players?.length > 0
                      ? Math.round(
                          selectedTeam.players.reduce((sum, p) => sum + (p.attendance || 0), 0) /
                          selectedTeam.players.length
                        )
                      : 0}%
                  </h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h6 className="text-white-50">Division</h6>
                  <h2 className="mb-0">{selectedTeam.division}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Player Roster */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                {selectedTeam.name} - Player Roster
              </h5>
            </div>
            <div className="card-body">
              {selectedTeam.players && selectedTeam.players.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Contact</th>
                        <th>Stats</th>
                        <th>Attendance</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTeam.players.map((player, index) => (
                        <tr key={player.id}>
                          <td>{player.jerseyNumber || index + 1}</td>
                          <td>
                            <strong>{player.firstName} {player.lastName}</strong>
                          </td>
                          <td>{player.position || 'N/A'}</td>
                          <td>
                            <small>
                              <i className="fas fa-envelope me-1"></i>
                              {player.email}
                              <br />
                              <i className="fas fa-phone me-1"></i>
                              {player.phone}
                            </small>
                          </td>
                          <td>
                            <small>
                              {player.stats ? (
                                <>
                                  G: {player.stats.games} | 
                                  TD: {player.stats.touchdowns} | 
                                  YDS: {player.stats.yards}
                                </>
                              ) : (
                                'No stats'
                              )}
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${
                              (player.attendance || 0) >= 80 ? 'bg-success' :
                              (player.attendance || 0) >= 60 ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {player.attendance || 0}%
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              player.status === 'active' ? 'bg-success' : 'bg-secondary'
                            }`}>
                              {player.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary me-1"
                              onClick={() => window.location.href = `/admin?tab=players&id=${player.id}`}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => window.location.href = `mailto:${player.email}`}
                            >
                              <i className="fas fa-envelope"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No players on this team yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="btn-group" role="group">
                    <button
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/admin?tab=attendance'}
                    >
                      <i className="fas fa-user-check me-2"></i>
                      Take Attendance
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => window.location.href = '/admin?tab=practice-plans'}
                    >
                      <i className="fas fa-calendar-check me-2"></i>
                      Practice Plans
                    </button>
                    <button
                      className="btn btn-info"
                      onClick={() => window.location.href = '/admin?tab=player-evaluations'}
                    >
                      <i className="fas fa-star me-2"></i>
                      Player Evaluations
                    </button>
                    <button
                      className="btn btn-warning"
                      onClick={() => {
                        const emails = selectedTeam.players.map(p => p.email).join(',');
                        window.location.href = `mailto:${emails}`;
                      }}
                    >
                      <i className="fas fa-envelope me-2"></i>
                      Email All Players
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
