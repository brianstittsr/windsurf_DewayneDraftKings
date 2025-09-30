'use client';

import Link from 'next/link';

export default function Season2025() {
  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" href="/">
            <i className="fas fa-football-ball text-primary me-2"></i>
            All Pro Sports
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link" href="/">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" href="/pricing">Pricing</Link></li>
              <li className="nav-item"><Link className="nav-link" href="/leaderboard">League</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">
                <i className="fas fa-football-ball me-3"></i>
                2025 Fall Flag Football Season
              </h1>
              <p className="lead mb-4">
                Welcome to the 2025 All Pro Sports Flag Football League! We're excited to kick off another season of competition, teamwork, and community.
              </p>
              <div className="d-flex gap-3">
                <Link href="/pricing">
                  <button className="btn btn-warning btn-lg">
                    <i className="fas fa-user-plus me-2"></i>
                    Register Now
                  </button>
                </Link>
              </div>
            </div>
            <div className="col-lg-4 text-center">
              <div className="bg-white text-dark rounded-3 p-4 shadow">
                <h3 className="text-primary mb-3">Season Info</h3>
                <p className="mb-2"><strong>Dates:</strong><br/>Sep 28 - Nov 16, 2025</p>
                <p className="mb-2"><strong>Registration Closes:</strong><br/>Nov 9, 2025 at 6:00 PM</p>
                <p className="mb-0"><strong>Fee:</strong><br/><span className="h4 text-primary">$59</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration & Fees */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                  <h2 className="h4 mb-0">
                    <i className="fas fa-dollar-sign me-2"></i>
                    Registration & Fees
                  </h2>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <i className="fas fa-user-check fa-2x text-primary mb-2"></i>
                        <h5>Registration Fee</h5>
                        <p className="h3 text-primary mb-0">$59</p>
                        <small className="text-muted">Required before playing</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <i className="fas fa-cog fa-2x text-info mb-2"></i>
                        <h5>Setup Fee</h5>
                        <p className="h3 text-info mb-0">$3</p>
                        <small className="text-muted">One-time fee</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <i className="fas fa-tshirt fa-2x text-success mb-2"></i>
                        <h5>Jersey Fee</h5>
                        <p className="h3 text-success mb-0">$26.50</p>
                        <small className="text-muted">League-issued jersey</small>
                      </div>
                    </div>
                  </div>
                  <div className="alert alert-info mt-4">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Trial Option:</strong> You may play in one game before deciding to continue, but your registration and setup fees are still due unless you opt out of the season.
                  </div>
                </div>
              </div>

              {/* Expectations */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-success text-white">
                  <h2 className="h4 mb-0">
                    <i className="fas fa-check-circle me-2"></i>
                    Expectations Once You Are Drafted
                  </h2>
                </div>
                <div className="card-body">
                  <p className="lead">Once you've been drafted, you are officially part of the league. Here's what's expected:</p>
                  
                  <div className="row g-4 mt-3">
                    <div className="col-md-6">
                      <div className="d-flex">
                        <i className="fas fa-calendar-check fa-2x text-primary me-3"></i>
                        <div>
                          <h5>Commitment to the Season</h5>
                          <ul className="mb-0">
                            <li>Show up for practices and games on time</li>
                            <li>Notify your coach in advance if you cannot attend</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="d-flex">
                        <i className="fas fa-tshirt fa-2x text-success me-3"></i>
                        <div>
                          <h5>Uniform & Equipment</h5>
                          <ul className="mb-0">
                            <li>League-issued jersey must be worn during all games</li>
                            <li>Bring your own cleats, mouthguards, and shorts (no pockets)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="d-flex">
                        <i className="fas fa-handshake fa-2x text-info me-3"></i>
                        <div>
                          <h5>Respect & Sportsmanship</h5>
                          <ul className="mb-0">
                            <li>Show respect to referees, teammates, opponents, and coaches</li>
                            <li>No unsportsmanlike conduct, arguing, or foul language</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="d-flex">
                        <i className="fas fa-comments fa-2x text-warning me-3"></i>
                        <div>
                          <h5>Team Communication</h5>
                          <ul className="mb-0">
                            <li>Stay connected with your coach and team chat</li>
                            <li>Respond promptly to communications</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="d-flex">
                        <i className="fas fa-book fa-2x text-danger me-3"></i>
                        <div>
                          <h5>League Rules</h5>
                          <ul className="mb-0">
                            <li>Follow all league rules and gameplay guidelines</li>
                            <li>Accept referee decisions as final</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="d-flex">
                        <i className="fas fa-heartbeat fa-2x text-danger me-3"></i>
                        <div>
                          <h5>Health & Safety</h5>
                          <ul className="mb-0">
                            <li>Play responsibly—safety comes first</li>
                            <li>Report any injuries immediately</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-12">
                      <div className="d-flex">
                        <i className="fas fa-users fa-2x text-primary me-3"></i>
                        <div>
                          <h5>League Growth</h5>
                          <ul className="mb-0">
                            <li>Help grow the league by inviting friends, family, and supporters</li>
                            <li>Be a positive representative of All Pro Sports on and off the field</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="alert alert-warning mt-4">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>Reminder:</strong> Once you are drafted, your spot is reserved, and fees must be current to participate. We're building a strong, competitive, and fun environment, and your commitment helps make that possible!
                  </div>
                </div>
              </div>

              {/* Registration Options */}
              <div className="card shadow-sm">
                <div className="card-header bg-warning text-dark">
                  <h2 className="h4 mb-0">
                    <i className="fas fa-clipboard-list me-2"></i>
                    Registration Options
                  </h2>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="card h-100 border-primary">
                        <div className="card-body text-center">
                          <i className="fas fa-male fa-3x text-primary mb-3"></i>
                          <h3 className="card-title">Flag Football Men</h3>
                          <p className="text-muted mb-3">
                            <i className="fas fa-calendar me-2"></i>
                            Season: 09/28/2025 - 11/16/2025
                          </p>
                          <p className="text-muted mb-3">
                            <i className="fas fa-clock me-2"></i>
                            Registration closes: 11/09/2025 at 06:00 PM
                          </p>
                          <p className="h2 text-primary mb-4">$59.00</p>
                          <Link href="/pricing">
                            <button className="btn btn-primary btn-lg w-100">
                              <i className="fas fa-plus me-2"></i>
                              Register Now
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100 border-danger">
                        <div className="card-body text-center">
                          <i className="fas fa-female fa-3x text-danger mb-3"></i>
                          <h3 className="card-title">Flag Football Women</h3>
                          <p className="text-muted mb-3">
                            <i className="fas fa-calendar me-2"></i>
                            Season: 09/28/2025 - 11/16/2025
                          </p>
                          <p className="text-muted mb-3">
                            <i className="fas fa-clock me-2"></i>
                            Registration closes: 11/09/2025 at 06:00 PM
                          </p>
                          <p className="h2 text-danger mb-4">$59.00</p>
                          <Link href="/pricing">
                            <button className="btn btn-danger btn-lg w-100">
                              <i className="fas fa-plus me-2"></i>
                              Register Now
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-dark text-white py-5">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Join the 2025 Season?</h2>
          <p className="lead mb-4">Don't miss out on the action. Register today and secure your spot!</p>
          <Link href="/pricing">
            <button className="btn btn-warning btn-lg">
              <i className="fas fa-user-plus me-2"></i>
              Register Now - $59
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white-50 py-4">
        <div className="container text-center">
          <p className="mb-0">Copyright © All Pro Sports 2025</p>
        </div>
      </footer>
    </div>
  );
}
