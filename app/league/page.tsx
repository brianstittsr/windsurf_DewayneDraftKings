'use client';

import { useState, useEffect } from 'react';

interface TeamStanding {
  teamId: string;
  teamName: string;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  gamesPlayed: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifferential: number;
  winPercentage: number;
  record: string;
}

interface LeagueLeader {
  playerId: string;
  playerName: string;
  teamName: string;
  stat: string;
  category: string;
}

interface UpcomingGame {
  date: string;
  teams: string;
  time: string;
  venue: string;
}

interface LeagueData {
  name: string;
  season: string;
  totalTeams: number;
  totalPlayers: number;
  gamesPlayed: number;
  totalTouchdowns: number;
  standings: TeamStanding[];
  topPlayers: LeagueLeader[];
  upcomingGames: UpcomingGame[];
}

export default function LeaguePage() {
  const [loading, setLoading] = useState(true);
  const [leagueData, setLeagueData] = useState<LeagueData>({
    name: 'All Pro Sports',
    season: '2024 Fall Season',
    totalTeams: 0,
    totalPlayers: 0,
    gamesPlayed: 0,
    totalTouchdowns: 0,
    standings: [],
    topPlayers: [],
    upcomingGames: []
  });

  useEffect(() => {
    fetchLeagueData();
  }, []);

  const fetchLeagueData = async () => {
    try {
      setLoading(true);
      
      // Fetch dynamic standings data
      const standingsResponse = await fetch('/api/standings?seasonId=2024-fall');
      let standingsData = null;
      
      if (standingsResponse.ok) {
        standingsData = await standingsResponse.json();
      }

      // Fetch teams data for league stats
      const teamsResponse = await fetch('/api/teams?seasonId=2024-fall');
      let teamsData = null;
      
      if (teamsResponse.ok) {
        teamsData = await teamsResponse.json();
      }

      // Fetch games data for league stats
      const gamesResponse = await fetch('/api/games?seasonId=2024-fall&status=completed');
      let gamesData = null;
      
      if (gamesResponse.ok) {
        gamesData = await gamesResponse.json();
      }

      // Calculate league statistics
      const totalTeams = teamsData?.teams?.length || 0;
      const totalGames = gamesData?.games?.length || 0;
      const totalTouchdowns = gamesData?.games?.reduce((sum: number, game: any) => 
        sum + (game.score?.home || 0) + (game.score?.away || 0), 0) || 0;

      setLeagueData({
        name: 'All Pro Sports',
        season: '2024 Fall Season',
        totalTeams,
        totalPlayers: totalTeams * 8, // Estimate 8 players per team
        gamesPlayed: totalGames,
        totalTouchdowns,
        standings: standingsData?.standings || [],
        topPlayers: standingsData?.leagueLeaders || [],
        upcomingGames: standingsData?.upcomingGames || []
      });

    } catch (error) {
      console.error('Error fetching league data:', error);
      // Keep default empty state on error
    } finally {
      setLoading(false);
    }
  };

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
                <p>Loading league information...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      {/* League Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card dk-card">
            <div className="card-body text-center">
              <h1 className="card-title h2 mb-2">🏈 {leagueData.name}</h1>
              <p className="text-muted mb-3">{leagueData.season}</p>
              <div className="row">
                <div className="col-md-3">
                  <div className="h4 text-primary mb-1">{leagueData.totalTeams}</div>
                  <small className="text-muted">Teams</small>
                </div>
                <div className="col-md-3">
                  <div className="h4 text-success mb-1">{leagueData.totalPlayers}</div>
                  <small className="text-muted">Players</small>
                </div>
                <div className="col-md-3">
                  <div className="h4 text-info mb-1">{leagueData.gamesPlayed}</div>
                  <small className="text-muted">Games Played</small>
                </div>
                <div className="col-md-3">
                  <div className="h4 text-warning mb-1">{leagueData.totalTouchdowns}</div>
                  <small className="text-muted">Total TDs</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Main Content */}
        <div className="col-md-8">
          {/* League Standings */}
          <div className="card dk-card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">🏆 League Standings</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team</th>
                      <th>Record</th>
                      <th>Points For</th>
                      <th>Win %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leagueData.standings.map((team) => (
                      <tr key={team.rank}>
                        <td>
                          <span className={`badge ${team.rank <= 2 ? 'bg-success' : team.rank <= 4 ? 'bg-warning' : 'bg-secondary'}`}>
                            #{team.rank}
                          </span>
                        </td>
                        <td><strong>{team.teamName}</strong></td>
                        <td>{team.record}</td>
                        <td>{team.pointsFor}</td>
                        <td>
                          {Math.round(team.winPercentage * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Players */}
          <div className="card dk-card">
            <div className="card-header">
              <h5 className="card-title mb-0">⭐ League Leaders</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {leagueData.topPlayers.map((player, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="card-title mb-1">{player.playerName}</h6>
                        <p className="text-muted mb-1">{player.teamName}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge bg-primary">{player.category}</span>
                          <strong className="text-success">{player.stat}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-md-4">
          {/* Upcoming Games */}
          <div className="card dk-card mb-4">
            <div className="card-header">
              <h6 className="card-title mb-0">📅 Upcoming Games</h6>
            </div>
            <div className="card-body">
              {leagueData.upcomingGames.map((game, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{game.teams}</strong>
                      <br />
                      <small className="text-muted">{game.date} at {game.time}</small>
                    </div>
                  </div>
                  {index < leagueData.upcomingGames.length - 1 && <hr />}
                </div>
              ))}
            </div>
          </div>

          {/* League Info */}
          <div className="card dk-card mb-4">
            <div className="card-header">
              <h6 className="card-title mb-0">ℹ️ League Information</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Season Format:</strong>
                <br />
                <small className="text-muted">7-game regular season + playoffs</small>
              </div>
              <div className="mb-3">
                <strong>Game Day:</strong>
                <br />
                <small className="text-muted">Tuesdays & Wednesdays</small>
              </div>
              <div className="mb-3">
                <strong>Location:</strong>
                <br />
                <small className="text-muted">All Pro Sports Complex</small>
              </div>
              <div>
                <strong>Registration:</strong>
                <br />
                <small className="text-muted">Open for next season</small>
              </div>
            </div>
          </div>

          {/* Join League */}
          <div className="card dk-card border-primary">
            <div className="card-header bg-primary text-white">
              <h6 className="card-title mb-0">🚀 Join the League!</h6>
            </div>
            <div className="card-body">
              <p className="card-text mb-3">
                Ready to compete? Register now for the next season!
              </p>
              <div className="d-grid gap-2">
                <a href="/register" className="btn btn-primary">
                  📝 Register Now
                </a>
                <button className="btn btn-outline-primary btn-sm">
                  📞 Contact League Office
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* League News */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card dk-card">
            <div className="card-header">
              <h5 className="card-title mb-0">📰 League News & Updates</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body">
                      <h6 className="card-title">🏆 Playoff Picture Taking Shape</h6>
                      <p className="card-text">With just two weeks left in the regular season, the playoff race is heating up...</p>
                      <small className="text-muted">Oct 18, 2024</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body">
                      <h6 className="card-title">⭐ Player of the Week</h6>
                      <p className="card-text">Marcus Johnson leads Lightning Strikes to victory with 4 touchdown performance...</p>
                      <small className="text-muted">Oct 16, 2024</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body">
                      <h6 className="card-title">📅 Championship Game Date Set</h6>
                      <p className="card-text">The league championship game has been scheduled for November 15th at 7:00 PM...</p>
                      <small className="text-muted">Oct 14, 2024</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
