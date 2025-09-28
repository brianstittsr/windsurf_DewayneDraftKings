'use client';

import Link from 'next/link';

export default function LeaguePage() {
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
            <Link href="/leaderboard" className="nav-link">Leaderboard</Link>
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
                <i className="fas fa-trophy me-3"></i>
                League Information
              </h1>
              <p className="lead text-muted">
                Stay updated with league standings, schedules, and team information
              </p>
            </div>

            {/* Coming Soon Card */}
            <div className="card shadow-lg border-0 mb-5">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-construction text-warning" style={{ fontSize: '4rem' }}></i>
                </div>
                <h2 className="card-title text-primary mb-3">Coming Soon!</h2>
                <p className="card-text text-muted mb-4">
                  We're working hard to bring you comprehensive league information including:
                </p>
                
                <div className="row g-4 mb-4">
                  <div className="col-md-4">
                    <div className="p-3">
                      <i className="fas fa-calendar-alt text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                      <h5>Game Schedules</h5>
                      <p className="text-muted small">View upcoming games and match schedules</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3">
                      <i className="fas fa-users text-success mb-2" style={{ fontSize: '2rem' }}></i>
                      <h5>Team Rosters</h5>
                      <p className="text-muted small">Browse team compositions and player info</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3">
                      <i className="fas fa-chart-line text-info mb-2" style={{ fontSize: '2rem' }}></i>
                      <h5>League Standings</h5>
                      <p className="text-muted small">Track team rankings and statistics</p>
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
                    Register Now
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="card border-0 bg-primary text-white">
              <div className="card-body text-center py-4">
                <h5 className="card-title mb-3">Stay Connected</h5>
                <p className="card-text mb-3">
                  For league updates and announcements, contact us:
                </p>
                <div className="d-flex justify-content-center gap-4">
                  <div>
                    <i className="fas fa-phone me-2"></i>
                    <span>(555) 123-4567</span>
                  </div>
                  <div>
                    <i className="fas fa-envelope me-2"></i>
                    <span>info@allprosportsnc.com</span>
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
