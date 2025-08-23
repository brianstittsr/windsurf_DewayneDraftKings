'use client'

import { Card, ListGroup, Badge } from 'react-bootstrap'
import { FaRunning, FaWeight, FaTrophy, FaUsers } from 'react-icons/fa'

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'workout',
      user: 'John Doe',
      action: 'completed a 45-minute basketball training session',
      time: '2 hours ago',
      icon: <FaRunning />,
      color: 'var(--dk-primary)'
    },
    {
      id: 2,
      type: 'weight',
      user: 'Sarah Johnson',
      action: 'updated weight metrics - lost 2.5 lbs this week',
      time: '4 hours ago',
      icon: <FaWeight />,
      color: 'var(--dk-orange)'
    },
    {
      id: 3,
      type: 'achievement',
      user: 'Mike Wilson',
      action: 'reached top 10 in Flag Football leaderboard',
      time: '6 hours ago',
      icon: <FaTrophy />,
      color: '#ffd700'
    },
    {
      id: 4,
      type: 'team',
      user: 'Lightning Bolts',
      action: 'won their volleyball match 3-1',
      time: '8 hours ago',
      icon: <FaUsers />,
      color: 'var(--dk-blue)'
    },
    {
      id: 5,
      type: 'workout',
      user: 'Emma Davis',
      action: 'logged 500 calories burned in kickball practice',
      time: '12 hours ago',
      icon: <FaRunning />,
      color: 'var(--dk-primary)'
    }
  ]

  return (
    <Card className="dk-card">
      <Card.Header>
        <h5 className="mb-0 text-white">Recent Activity</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <ListGroup variant="flush">
          {activities.map((activity) => (
            <ListGroup.Item 
              key={activity.id}
              className="bg-transparent text-white border-secondary"
            >
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle p-2 me-3"
                  style={{ 
                    backgroundColor: `${activity.color}20`,
                    color: activity.color,
                    fontSize: '0.9rem'
                  }}
                >
                  {activity.icon}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{activity.user}</strong> {activity.action}
                    </div>
                    <Badge bg="secondary" className="ms-2">
                      {activity.time}
                    </Badge>
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  )
}
