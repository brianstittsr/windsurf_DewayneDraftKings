import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { FaFootballBall, FaVolleyballBall, FaBasketballBall, FaRunning } from 'react-icons/fa'
import { GiKickScooter } from 'react-icons/gi'
import Link from 'next/link'
import { StatsOverview } from '@/components/StatsOverview'
import { RecentActivity } from '@/components/RecentActivity'
import { CallToAction } from '@/components/CallToAction'

export default function Home() {
  const sports = [
    { 
      name: 'Flag Football', 
      icon: <FaFootballBall />, 
      color: 'sport-flag-football',
      players: 156,
      teams: 12
    },
    { 
      name: 'Volleyball', 
      icon: <FaVolleyballBall />, 
      color: 'sport-volleyball',
      players: 89,
      teams: 8
    },
    { 
      name: 'Kickball', 
      icon: <GiKickScooter />, 
      color: 'sport-kickball',
      players: 134,
      teams: 10
    },
    { 
      name: 'Basketball', 
      icon: <FaBasketballBall />, 
      color: 'sport-basketball',
      players: 201,
      teams: 16
    }
  ]

  return (
    <Container fluid className="py-4">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col>
          <div className="text-center py-5" style={{ 
            background: 'linear-gradient(135deg, #53d337 0%, #45b82e 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <h1 className="display-4 fw-bold mb-3">Sports Tracker Pro</h1>
            <p className="lead mb-4">Track, Train, and Dominate across multiple sports</p>
            <div className="d-flex justify-content-center gap-3">
              <Link href="/register">
                <Button size="lg" className="dk-btn-primary px-4">
                  Join Now
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="lg" variant="outline-light" className="px-4">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      {/* Sports Overview */}
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">Sports Categories</h2>
        </Col>
      </Row>
      <Row className="g-4 mb-5">
        {sports.map((sport, index) => (
          <Col md={6} lg={3} key={index}>
            <Card className="dk-card h-100 text-center">
              <Card.Body className="d-flex flex-column">
                <div className={`sport-icon ${sport.color} mx-auto mb-3`}>
                  {sport.icon}
                </div>
                <Card.Title className="text-white">{sport.name}</Card.Title>
                <div className="mt-auto">
                  <div className="d-flex justify-content-between text-muted mb-3">
                    <small>{sport.players} Players</small>
                    <small>{sport.teams} Teams</small>
                  </div>
                  <Link href={`/sports/${sport.name.toLowerCase().replace(' ', '-')}`}>
                    <Button className="dk-btn-primary w-100">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Stats Overview */}
      <Row className="mb-5">
        <Col>
          <StatsOverview />
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row className="g-4">
        {/* Recent Activity */}
        <Col lg={8}>
          <RecentActivity />
        </Col>
        
        {/* Call to Action Sidebar */}
        <Col lg={4}>
          <CallToAction />
          
          {/* Quick Actions */}
          <Card className="dk-card mt-4">
            <Card.Header>
              <h5 className="mb-0 text-white">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Link href="/dashboard/metrics">
                  <Button className="dk-btn-primary w-100">
                    <FaRunning className="me-2" />
                    Log Workout
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button className="dk-btn-secondary w-100">
                    Update Profile
                  </Button>
                </Link>
                <Link href="/teams">
                  <Button variant="outline-light" className="w-100">
                    Find Teams
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
