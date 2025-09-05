'use client';

import { useState, useEffect } from 'react';

interface Team {
  id: string;
  name: string;
  division: 'men' | 'women' | 'mixed';
  coachName: string;
  currentRosterSize: number;
  maxRosterSize: number;
  stats: {
    wins: number;
    losses: number;
    ties: number;
    gamesPlayed: number;
    winPercentage: number;
    pointsFor: number;
    pointsAgainst: number;
  };
  primaryColor: string;
  secondaryColor: string;
}

interface Game {
  id: string;
  gameNumber: number;
  week: number;
  homeTeamName: string;
  awayTeamName: string;
  scheduledDate: any;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  score: {
    home: number;
    away: number;
  };
  venue: string;
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teams');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreateGameModal, setShowCreateGameModal] = useState(false);
  const [showGameResultModal, setShowGameResultModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Form states
  const [teamForm, setTeamForm] = useState({
    name: '',
    division: 'mixed' as 'men' | 'women' | 'mixed',
    coachName: '',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d'
  });

  const [gameForm, setGameForm] = useState({
    homeTeamId: '',
    awayTeamId: '',
    scheduledDate: '',
    week: 1,
    venue: 'All Pro Sports Complex'
  });

  const [gameResult, setGameResult] = useState({
    homeScore: 0,
    awayScore: 0
  });

  useEffect(() => {
    fetchTeams();
    fetchGames();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams?seasonId=2024-fall');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games?seasonId=2024-fall');
      if (response.ok) {
        const data = await response.json();
        setGames(data.games || []);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...teamForm,
          coachId: 'temp-coach-id',
          seasonId: '2024-fall',
          leagueId: 'all-pro-sports'
        })
      });

      if (response.ok) {
        setShowCreateTeamModal(false);
        setTeamForm({
          name: '',
          division: 'mixed',
          coachName: '',
          primaryColor: '#007bff',
          secondaryColor: '#6c757d'
        });
        fetchTeams();
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const homeTeam = teams.find(t => t.id === gameForm.homeTeamId);
      const awayTeam = teams.find(t => t.id === gameForm.awayTeamId);

      if (!homeTeam || !awayTeam) return;

      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameNumber: games.length + 1,
          week: gameForm.week,
          seasonId: '2024-fall',
          leagueId: 'all-pro-sports',
          homeTeamId: gameForm.homeTeamId,
          awayTeamId: gameForm.awayTeamId,
          homeTeamName: homeTeam.name,
          awayTeamName: awayTeam.name,
          scheduledDate: gameForm.scheduledDate,
          venue: gameForm.venue
        })
      });

      if (response.ok) {
        setShowCreateGameModal(false);
        setGameForm({
          homeTeamId: '',
          awayTeamId: '',
          scheduledDate: '',
          week: 1,
          venue: 'All Pro Sports Complex'
        });
        fetchGames();
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleRecordResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;

    try {
      const response = await fetch('/api/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedGame.id,
          status: 'completed',
          score: {
            home: gameResult.homeScore,
            away: gameResult.awayScore
          },
          seasonId: '2024-fall'
        })
      });

      if (response.ok) {
        setShowGameResultModal(false);
        setSelectedGame(null);
        setGameResult({ homeScore: 0, awayScore: 0 });
        fetchGames();
      }
    } catch (error) {
      console.error('Error recording game result:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Tab Navigation */}
      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <i className="fas fa-users me-2"></i>Teams
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            <i className="fas fa-calendar-alt me-2"></i>Games & Schedule
          </button>
        </li>
      </ul>

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="fade-in">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>Team Management</h4>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateTeamModal(true)}
            >
              <i className="fas fa-plus me-2"></i>Create Team
            </button>
          </div>

          <div className="row">
            {teams.map((team) => (
              <div key={team.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card stats-card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{team.name}</h6>
                    <span className={`badge ${team.division === 'men' ? 'bg-primary' : team.division === 'women' ? 'bg-success' : 'bg-info'}`}>
                      {team.division}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="text-muted mb-2">Coach: {team.coachName}</p>
                    <p className="text-muted mb-3">Roster: {team.currentRosterSize}/{team.maxRosterSize}</p>
                    
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="h5 text-success mb-1">{team.stats.wins}</div>
                        <small className="text-muted">Wins</small>
                      </div>
                      <div className="col-4">
                        <div className="h5 text-danger mb-1">{team.stats.losses}</div>
                        <small className="text-muted">Losses</small>
                      </div>
                      <div className="col-4">
                        <div className="h5 text-primary mb-1">{Math.round(team.stats.winPercentage * 100)}%</div>
                        <small className="text-muted">Win %</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Games Tab */}
      {activeTab === 'games' && (
        <div className="fade-in">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>Games & Schedule</h4>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateGameModal(true)}
            >
              <i className="fas fa-plus me-2"></i>Schedule Game
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Matchup</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id}>
                    <td>{game.week}</td>
                    <td>{game.homeTeamName} vs {game.awayTeamName}</td>
                    <td>{new Date(game.scheduledDate.seconds * 1000).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${
                        game.status === 'completed' ? 'bg-success' :
                        game.status === 'in_progress' ? 'bg-warning' :
                        game.status === 'scheduled' ? 'bg-primary' : 'bg-secondary'
                      }`}>
                        {game.status}
                      </span>
                    </td>
                    <td>
                      {game.status === 'completed' ? 
                        `${game.score.home} - ${game.score.away}` : 
                        '-'
                      }
                    </td>
                    <td>
                      {game.status === 'scheduled' && (
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setSelectedGame(game);
                            setShowGameResultModal(true);
                          }}
                        >
                          Record Result
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Team</h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowCreateTeamModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateTeam}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Team Name</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Division</label>
                    <select 
                      className="form-select"
                      value={teamForm.division}
                      onChange={(e) => setTeamForm({...teamForm, division: e.target.value as any})}
                    >
                      <option value="mixed">Mixed</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Coach Name</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={teamForm.coachName}
                      onChange={(e) => setTeamForm({...teamForm, coachName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTeamModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Game Modal */}
      {showCreateGameModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule New Game</h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowCreateGameModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateGame}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Home Team</label>
                    <select 
                      className="form-select"
                      value={gameForm.homeTeamId}
                      onChange={(e) => setGameForm({...gameForm, homeTeamId: e.target.value})}
                      required
                    >
                      <option value="">Select Home Team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Away Team</label>
                    <select 
                      className="form-select"
                      value={gameForm.awayTeamId}
                      onChange={(e) => setGameForm({...gameForm, awayTeamId: e.target.value})}
                      required
                    >
                      <option value="">Select Away Team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Game Date & Time</label>
                    <input 
                      type="datetime-local"
                      className="form-control"
                      value={gameForm.scheduledDate}
                      onChange={(e) => setGameForm({...gameForm, scheduledDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Week</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={gameForm.week}
                      onChange={(e) => setGameForm({...gameForm, week: parseInt(e.target.value)})}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateGameModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Schedule Game
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Record Game Result Modal */}
      {showGameResultModal && selectedGame && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Record Game Result</h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowGameResultModal(false)}
                ></button>
              </div>
              <form onSubmit={handleRecordResult}>
                <div className="modal-body">
                  <h6 className="mb-3">{selectedGame.homeTeamName} vs {selectedGame.awayTeamName}</h6>
                  <div className="row">
                    <div className="col-6">
                      <label className="form-label">{selectedGame.homeTeamName} Score</label>
                      <input 
                        type="number"
                        className="form-control"
                        value={gameResult.homeScore}
                        onChange={(e) => setGameResult({...gameResult, homeScore: parseInt(e.target.value) || 0})}
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">{selectedGame.awayTeamName} Score</label>
                      <input 
                        type="number"
                        className="form-control"
                        value={gameResult.awayScore}
                        onChange={(e) => setGameResult({...gameResult, awayScore: parseInt(e.target.value) || 0})}
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowGameResultModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Record Result
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
