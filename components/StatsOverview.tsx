'use client'

import { Row, Col, Card } from 'react-bootstrap'

export function StatsOverview() {
  const stats = [
    {
      title: 'Total Players',
      value: '580',
      change: '+12%',
      icon: '👥',
      color: 'var(--dk-primary)'
    },
    {
      title: 'Active Workouts',
      value: '1,234',
      change: '+8%',
      icon: '🏃',
      color: 'var(--dk-orange)'
    },
    {
      title: 'Competitions',
      value: '46',
      change: '+15%',
      icon: '🏆',
      color: 'var(--dk-blue)'
    },
    {
      title: 'Calories Burned',
      value: '45.2K',
      change: '+22%',
      icon: '🔥',
      color: '#dc3545'
    }
  ]

  return (
    <Row className="g-4">
      {stats.map((stat, index) => (
        <Col md={6} lg={3} key={index}>
          <Card className="dk-stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle p-3 me-3"
                  style={{ 
                    backgroundColor: `${stat.color}20`,
                    color: stat.color,
                    fontSize: '1.5rem'
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <h3 className="mb-0 text-white">{stat.value}</h3>
                  <p className="text-muted mb-0">{stat.title}</p>
                  <small style={{ color: stat.color }}>{stat.change} this month</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
