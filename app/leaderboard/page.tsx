'use client';

import Link from 'next/link';

export default function LeaderboardPage() {
  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link href="/" className="navbar-brand fw-bold">
            <i className="fas fa-football-ball me-2"></i>
            All Pro Sports NC
          </Link>
          <div className="navbar-nav ms-auto">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/register" className="nav-link">Register</Link>
            <Link href="/league" className="nav-link">League</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Page Header */}
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-primary mb-3">
                <i className="fas fa-medal me-3"></i>
                Leaderboard
              </h1>
              <p className="lead text-muted">
                Track top performers and team standings
              </p>
            </div>

            {/* Coming Soon Card */}
            <div className="card shadow-lg border-0 mb-5">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-chart-bar text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h2 className="card-title text-primary mb-3">Statistics Coming Soon!</h2>
                <p className="card-text text-muted mb-4">
                  We're preparing comprehensive leaderboards and statistics including:
                </p>
                
                <div className="row g-4 mb-4">
                  <div className="col-md-3">
                    <div className="p-3">
                      <i className="fas fa-running text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                      <h6>Top Rushers</h6>
                      <p className="text-muted small">Leading rushing yards</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <i className="fas fa-football-ball text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                      <h6>Top Scorers</h6>
                      <p className="text-muted small">Most touchdowns</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <i className="fas fa-shield-alt text-success mb-2" style={{ fontSize: '2rem' }}></i>
                      <h6>Best Defense</h6>
                      <p className="text-muted small">Tackles and interceptions</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <i className="fas fa-trophy text-danger mb-2" style={{ fontSize: '2rem' }}></i>
                      <h6>Team Rankings</h6>
                      <p className="text-muted small">Overall team performance</p>
                    </div>
                  </div>
                </div>

                {/* Sample Leaderboard Preview */}
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <h5 className="card-title text-start mb-3">
                      <i className="fas fa-preview me-2"></i>
                      Preview: Top Players
                    </h5>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead className="table-primary">
                          <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Position</th>
                            <th>Points</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><span className="badge bg-warning">1st</span></td>
                            <td>Coming Soon</td>
                            <td>-</td>
                            <td>-</td>
                            <td><span className="badge bg-secondary">TBD</span></td>
                          </tr>
                          <tr>
                            <td><span className="badge bg-light text-dark">2nd</span></td>
                            <td>Coming Soon</td>
                            <td>-</td>
                            <td>-</td>
                            <td><span className="badge bg-secondary">TBD</span></td>
                          </tr>
                          <tr>
                            <td><span className="badge bg-light text-dark">3rd</span></td>
                            <td>Coming Soon</td>
                            <td>-</td>
                            <td>-</td>
                            <td><span className="badge bg-secondary">TBD</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <Link href="/" className="btn btn-primary">
                    <i className="fas fa-home me-2"></i>
                    Back to Home
                  </Link>
                  <Link href="/register" className="btn btn-outline-primary">
                    <i className="fas fa-user-plus me-2"></i>
                    Join the Competition
                  </Link>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card border-0 bg-primary text-white h-100">
                  <div className="card-body text-center">
                    <i className="fas fa-clock mb-3" style={{ fontSize: '2rem' }}></i>
                    <h5 className="card-title">Season Progress</h5>
                    <p className="card-text">
                      Statistics will be updated after each game and practice session.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 bg-success text-white h-100">
                  <div className="card-body text-center">
                    <i className="fas fa-users mb-3" style={{ fontSize: '2rem' }}></i>
                    <h5 className="card-title">Fair Competition</h5>
                    <p className="card-text">
                      All players get equal opportunities to showcase their skills and improve.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">
            © 2024 All Pro Sports NC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
