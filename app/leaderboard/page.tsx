'use client'

import { Container, Row, Col, Card, Table, Badge, Nav, Button } from 'react-bootstrap'

export default function LeaderboardPage() {
  const leaderboardData = {
    workouts: [
      { rank: 1, name: 'Sarah Johnson', value: '45 workouts', sport: 'Basketball', tag: 'CLIENT', avatar: '/api/placeholder/40/40' },
      { rank: 2, name: 'Mike Wilson', value: '42 workouts', sport: 'Flag Football', tag: 'DRAFT_PICK', avatar: '/api/placeholder/40/40' },
      { rank: 3, name: 'Emma Davis', value: '38 workouts', sport: 'Volleyball', tag: 'PROSPECT', avatar: '/api/placeholder/40/40' },
      { rank: 4, name: 'John Doe', value: '35 workouts', sport: 'Kickball', tag: 'FREE_AGENT', avatar: '/api/placeholder/40/40' },
      { rank: 5, name: 'Lisa Chen', value: '33 workouts', sport: 'Basketball', tag: 'CLIENT', avatar: '/api/placeholder/40/40' }
    ],
    weightLoss: [
      { rank: 1, name: 'Tom Rodriguez', value: '15.2 lbs', sport: 'Flag Football', tag: 'CLIENT', avatar: '/api/placeholder/40/40' },
      { rank: 2, name: 'Amy Foster', value: '12.8 lbs', sport: 'Volleyball', tag: 'PROSPECT', avatar: '/api/placeholder/40/40' },
      { rank: 3, name: 'David Kim', value: '11.5 lbs', sport: 'Basketball', tag: 'DRAFT_PICK', avatar: '/api/placeholder/40/40' },
      { rank: 4, name: 'Rachel Green', value: '9.3 lbs', sport: 'Kickball', tag: 'MEET_GREET', avatar: '/api/placeholder/40/40' },
      { rank: 5, name: 'Chris Taylor', value: '8.7 lbs', sport: 'Flag Football', tag: 'FREE_AGENT', avatar: '/api/placeholder/40/40' }
    ],
    calories: [
      { rank: 1, name: 'Alex Martinez', value: '12,450 cal', sport: 'Basketball', tag: 'CLIENT', avatar: '/api/placeholder/40/40' },
      { rank: 2, name: 'Jessica Wong', value: '11,890 cal', sport: 'Volleyball', tag: 'DRAFT_PICK', avatar: '/api/placeholder/40/40' },
      { rank: 3, name: 'Ryan O\'Connor', value: '11,230 cal', sport: 'Flag Football', tag: 'PROSPECT', avatar: '/api/placeholder/40/40' },
      { rank: 4, name: 'Maria Lopez', value: '10,780 cal', sport: 'Kickball', tag: 'CLIENT', avatar: '/api/placeholder/40/40' },
      { rank: 5, name: 'Kevin Brown', value: '10,340 cal', sport: 'Basketball', tag: 'FREE_AGENT', avatar: '/api/placeholder/40/40' }
    ]
  }

  const getPlayerTagBadge = (tag: string) => {
    const tagClasses = {
      'FREE_AGENT': 'tag-free-agent',
      'DRAFT_PICK': 'tag-draft-pick',
      'PROSPECT': 'tag-prospect',
      'MEET_GREET': 'tag-meet-greet',
      'CLIENT': 'tag-client'
    }
    return <Badge className={`player-tag ${tagClasses[tag as keyof typeof tagClasses]}`}>
      {tag.replace('_', ' ')}
    </Badge>
  }

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <span style={{ color: '#ffd700', fontSize: '1.2em' }}>🏆</span>
      case 2: return <span style={{ color: '#c0c0c0', fontSize: '1.2em' }}>🥈</span>
      case 3: return <span style={{ color: '#cd7f32', fontSize: '1.2em' }}>🥉</span>
      default: return <span className="text-muted">#{rank}</span>
    }
  }

  const getSportIcon = (sport: string) => {
    const sportClasses = {
      'Basketball': 'sport-basketball',
      'Flag Football': 'sport-flag-football',
      'Volleyball': 'sport-volleyball',
      'Kickball': 'sport-kickball'
    }
    return <div className={`sport-icon ${sportClasses[sport as keyof typeof sportClasses]} me-2`} style={{ width: '24px', height: '24px', fontSize: '12px' }}>
      {sport.charAt(0)}
    </div>
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h1 className="display-5 fw-bold text-white mb-2">
              <span className="me-3" style={{ color: 'var(--dk-primary)', fontSize: '1.5em' }}>🏆</span>
              Leaderboards
            </h1>
            <p className="text-muted">Compete and track your progress across all sports</p>
          </div>
        </Col>
      </Row>

      {/* Category Tabs */}
      <Row className="mb-4">
        <Col>
          <Nav variant="pills" className="justify-content-center">
            <Nav.Item>
              <Nav.Link active className="dk-btn-primary">
                🏃 Most Workouts
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className="text-white">
                ⚖️ Weight Loss
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className="text-white">
                🔥 Calories Burned
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className="text-white">
                💪 Strength Gains
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
      </Row>

      {/* Leaderboard Cards */}
      <Row className="g-4">
        {/* Most Workouts */}
        <Col lg={4}>
          <Card className="dk-leaderboard h-100">
            <Card.Header className="text-center">
              <h5 className="mb-0 text-white">
                🏃 Most Workouts This Month
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table variant="dark" className="mb-0">
                <tbody>
                  {leaderboardData.workouts.map((player, index) => (
                    <tr key={index}>
                      <td className="text-center" style={{ width: '60px' }}>
                        {getRankIcon(player.rank)}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={`https://via.placeholder.com/40x40/333/fff?text=${player.name.charAt(0)}`}
                            alt={player.name}
                            className="rounded-circle me-2"
                            width="32"
                            height="32"
                          />
                          <div>
                            <div className="fw-bold text-white">{player.name}</div>
                            <div className="d-flex align-items-center">
                              {getSportIcon(player.sport)}
                              {getPlayerTagBadge(player.tag)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end">
                        <strong style={{ color: 'var(--dk-primary)' }}>
                          {player.value}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Weight Loss */}
        <Col lg={4}>
          <Card className="dk-leaderboard h-100">
            <Card.Header className="text-center">
              <h5 className="mb-0 text-white">
                ⚖️ Weight Loss Champions
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table variant="dark" className="mb-0">
                <tbody>
                  {leaderboardData.weightLoss.map((player, index) => (
                    <tr key={index}>
                      <td className="text-center" style={{ width: '60px' }}>
                        {getRankIcon(player.rank)}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={`https://via.placeholder.com/40x40/333/fff?text=${player.name.charAt(0)}`}
                            alt={player.name}
                            className="rounded-circle me-2"
                            width="32"
                            height="32"
                          />
                          <div>
                            <div className="fw-bold text-white">{player.name}</div>
                            <div className="d-flex align-items-center">
                              {getSportIcon(player.sport)}
                              {getPlayerTagBadge(player.tag)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end">
                        <strong style={{ color: 'var(--dk-orange)' }}>
                          {player.value}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Calories Burned */}
        <Col lg={4}>
          <Card className="dk-leaderboard h-100">
            <Card.Header className="text-center">
              <h5 className="mb-0 text-white">
                🔥 Calories Burned
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table variant="dark" className="mb-0">
                <tbody>
                  {leaderboardData.calories.map((player, index) => (
                    <tr key={index}>
                      <td className="text-center" style={{ width: '60px' }}>
                        {getRankIcon(player.rank)}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={`https://via.placeholder.com/40x40/333/fff?text=${player.name.charAt(0)}`}
                            alt={player.name}
                            className="rounded-circle me-2"
                            width="32"
                            height="32"
                          />
                          <div>
                            <div className="fw-bold text-white">{player.name}</div>
                            <div className="d-flex align-items-center">
                              {getSportIcon(player.sport)}
                              {getPlayerTagBadge(player.tag)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end">
                        <strong style={{ color: '#dc3545' }}>
                          {player.value}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Call to Action */}
      <Row className="mt-5">
        <Col className="text-center">
          <Card className="dk-card">
            <Card.Body className="py-4">
              <h4 className="text-white mb-3">Want to see your name here?</h4>
              <p className="text-muted mb-4">
                Start tracking your workouts and compete with other athletes in your sport!
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Button className="dk-btn-primary px-4">
                  Log Your First Workout
                </Button>
                <Button variant="outline-light" className="px-4">
                  Join a Team
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
