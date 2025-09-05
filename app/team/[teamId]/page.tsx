'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function TeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [loading, setLoading] = useState(true);

  // Sample team data - in production this would come from Firestore
  const teamData = {
    id: teamId,
    name: 'Thunder Bolts',
    division: 'men',
    coach: 'Coach Johnson',
    stats: {
      wins: 5,
      losses: 2,
      ties: 0,
      pointsFor: 245,
      pointsAgainst: 180
    },
    players: [
      { id: '1', name: 'John Smith', position: 'quarterback', stats: { touchdowns: 12, yards: 850 } },
      { id: '2', name: 'Mike Davis', position: 'receiver', stats: { touchdowns: 8, yards: 620 } },
      { id: '3', name: 'Chris Wilson', position: 'rusher', stats: { touchdowns: 6, yards: 480 } },
      { id: '4', name: 'David Brown', position: 'defender', stats: { tackles: 25, interceptions: 3 } }
    ]
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card dk-card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading team information...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        {/* Team Header */}
        <div className="col-12 mb-4">
          <div className="card dk-card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <h1 className="card-title h2 mb-2">🏆 {teamData.name}</h1>
                  <p className="text-muted mb-0">
                    Coach: {teamData.coach} • Division: {teamData.division.charAt(0).toUpperCase() + teamData.division.slice(1)}
                  </p>
                </div>
                <div className="col-auto">
                  <div className="text-center">
                    <div className="h3 text-primary mb-0">
                      {teamData.stats.wins}-{teamData.stats.losses}
                      {teamData.stats.ties > 0 && `-${teamData.stats.ties}`}
                    </div>
                    <small className="text-muted">Record</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="col-md-8 mb-4">
          <div className="card dk-card">
            <div className="card-header">
              <h5 className="card-title mb-0">📊 Team Statistics</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-3">
                  <div className="mb-3">
                    <div className="h4 text-success mb-1">{teamData.stats.wins}</div>
                    <small className="text-muted">Wins</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="mb-3">
                    <div className="h4 text-danger mb-1">{teamData.stats.losses}</div>
                    <small className="text-muted">Losses</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="mb-3">
                    <div className="h4 text-primary mb-1">{teamData.stats.pointsFor}</div>
                    <small className="text-muted">Points For</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="mb-3">
                    <div className="h4 text-warning mb-1">{teamData.stats.pointsAgainst}</div>
                    <small className="text-muted">Points Against</small>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${(teamData.stats.wins / (teamData.stats.wins + teamData.stats.losses)) * 100}%` }}
                  ></div>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <small className="text-muted">Win Percentage: {Math.round((teamData.stats.wins / (teamData.stats.wins + teamData.stats.losses)) * 100)}%</small>
                  <small className="text-muted">Point Differential: +{teamData.stats.pointsFor - teamData.stats.pointsAgainst}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Player Roster */}
          <div className="card dk-card mt-4">
            <div className="card-header">
              <h5 className="card-title mb-0">👥 Team Roster</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Position</th>
                      <th>TDs</th>
                      <th>Yards</th>
                      <th>Other</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamData.players.map((player) => (
                      <tr key={player.id}>
                        <td>
                          <strong>{player.name}</strong>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {player.position.charAt(0).toUpperCase() + player.position.slice(1)}
                          </span>
                        </td>
                        <td>{player.stats.touchdowns || 0}</td>
                        <td>{player.stats.yards || 0}</td>
                        <td>
                          {player.stats.tackles && `${player.stats.tackles} tackles`}
                          {player.stats.interceptions && ` • ${player.stats.interceptions} INTs`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-md-4">
          {/* Quick Stats */}
          <div className="card dk-card mb-4">
            <div className="card-header">
              <h6 className="card-title mb-0">⚡ Quick Stats</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Games Played:</span>
                  <strong>{teamData.stats.wins + teamData.stats.losses}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Avg Points/Game:</span>
                  <strong>{Math.round(teamData.stats.pointsFor / (teamData.stats.wins + teamData.stats.losses))}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Roster Size:</span>
                  <strong>{teamData.players.length}</strong>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between">
                  <span>Division Rank:</span>
                  <strong>2nd</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Games */}
          <div className="card dk-card mb-4">
            <div className="card-header">
              <h6 className="card-title mb-0">🏈 Recent Games</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>vs Lightning Strikes</strong>
                    <br />
                    <small className="text-muted">Oct 15, 2024</small>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-success">W</span>
                    <br />
                    <small>28-21</small>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>@ Storm Chasers</strong>
                    <br />
                    <small className="text-muted">Oct 8, 2024</small>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-success">W</span>
                    <br />
                    <small>35-14</small>
                  </div>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>vs Wind Warriors</strong>
                    <br />
                    <small className="text-muted">Oct 1, 2024</small>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-danger">L</span>
                    <br />
                    <small>17-24</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Team */}
          <div className="card dk-card">
            <div className="card-header">
              <h6 className="card-title mb-0">📞 Contact Team</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  📧 Email Coach
                </button>
                <button className="btn btn-outline-success btn-sm">
                  📱 Team Group Chat
                </button>
                <button className="btn btn-outline-info btn-sm">
                  📅 View Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
