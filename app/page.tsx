'use client'

import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import Link from 'next/link'
import { StatsOverview } from '@/components/StatsOverview'
import { RecentActivity } from '@/components/RecentActivity'
import { CallToAction } from '@/components/CallToAction'
import ModernNavbar from '@/components/ModernNavbar'

export default function Home() {
  const sports = [
    { 
      name: 'Flag Football', 
      icon: '🏈', 
      color: 'sport-flag-football',
      players: 156,
      teams: 12
    },
    { 
      name: 'Volleyball', 
      icon: '🏐', 
      color: 'sport-volleyball',
      players: 89,
      teams: 8
    },
    { 
      name: 'Kickball', 
      icon: '⚽', 
      color: 'sport-kickball',
      players: 134,
      teams: 10
    },
    { 
      name: 'Basketball', 
      icon: '🏀', 
      color: 'sport-basketball',
      players: 201,
      teams: 16
    }
  ]

  return (
    <div>
      <ModernNavbar />
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">All Pro Sports</h1>
              <p className="lead mb-4">
                Join our elite athletic league with automated SMS updates, player profiles, and real-time notifications.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link href="/register">
                  <button className="btn btn-light btn-lg px-4 me-3 hover-lift">
                    <i className="fas fa-user-plus me-2"></i>
                    Join League Now
                  </button>
                </Link>
                <Link href="/leaderboard">
                  <button className="btn btn-outline-light btn-lg px-4 hover-lift">
                    <i className="fas fa-trophy me-2"></i>
                    View Leaderboard
                  </button>
                </Link>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="feature-icon" style={{ width: '120px', height: '120px', fontSize: '3rem', margin: '0 auto' }}>
                <i className="fas fa-trophy"></i>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="display-5 fw-bold mb-3">League Sports</h2>
            <p className="lead text-muted">Choose your sport and join the competition</p>
          </Col>
        </Row>
        
        <Row className="g-4 mb-5">
          {sports.map((sport, index) => (
            <Col md={6} lg={3} key={index}>
              <div className="dk-card h-100 hover-lift fade-in">
                <div className="card-body text-center p-4">
                  <div className={`sport-icon ${sport.color} mx-auto mb-3`}>
                    {sport.icon}
                  </div>
                  <h5 className="card-title mb-3">{sport.name}</h5>
                  <div className="row text-center mb-4">
                    <div className="col">
                      <div className="h6 text-primary mb-0">{sport.players}</div>
                      <small className="text-muted">Players</small>
                    </div>
                    <div className="col">
                      <div className="h6 text-success mb-0">{sport.teams}</div>
                      <small className="text-muted">Teams</small>
                    </div>
                  </div>
                  <Link href={`/register`}>
                    <button className="btn dk-btn-primary w-100">
                      Join {sport.name}
                    </button>
                  </Link>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Stats Section */}
      <div className="py-5" style={{ backgroundColor: 'var(--gray-50)' }}>
        <Container>
          <Row className="text-center mb-4">
            <Col>
              <h2 className="display-6 fw-bold">Live League Statistics</h2>
            </Col>
          </Row>
          <StatsOverview />
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-5">
        <Row className="g-4">
          <Col lg={8}>
            <div className="mb-4">
              <h3 className="fw-bold">Recent Activity</h3>
            </div>
            <RecentActivity />
          </Col>
          
          <Col lg={4}>
            <div className="mb-4">
              <h3 className="fw-bold">Quick Actions</h3>
            </div>
            <CallToAction />
            
            <div className="dk-card mt-4">
              <div className="card-header">
                <h5 className="mb-0">League Management</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link href="/register">
                    <button className="btn dk-btn-primary w-100">
                      <i className="fas fa-mobile-alt me-2"></i>
                      Player Registration
                    </button>
                  </Link>
                  <Link href="/admin">
                    <button className="btn dk-btn-secondary w-100">
                      <i className="fas fa-chart-bar me-2"></i>
                      Admin Dashboard
                    </button>
                  </Link>
                  <Link href="/leaderboard">
                    <button className="btn btn-outline-primary w-100">
                      <i className="fas fa-trophy me-2"></i>
                      View Rankings
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="stats-card mt-4">
              <div className="card-header">
                <h6 className="mb-0">League Statistics</h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Active Players</span>
                  <span className="modern-badge">580</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>SMS Notifications</span>
                  <span className="modern-badge" style={{ background: 'var(--warning)' }}>1,234</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Registration Rate</span>
                  <span className="modern-badge" style={{ background: 'var(--success)' }}>98.5%</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
