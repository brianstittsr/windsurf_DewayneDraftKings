'use client'

import { useState, useEffect } from 'react'
import { Card, ListGroup, Badge } from 'react-bootstrap'

export function RecentActivity() {
  const [activities, setActivities] = useState([
    {
      id: '1',
      type: 'loading',
      user: 'Loading...',
      action: 'Fetching recent activity',
      time: 'Just now',
      icon: '🔄',
      color: 'var(--dk-primary)'
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      
      // Fetch recent activity from API
      const response = await fetch('/api/activity/recent');
      const data = await response.json();
      
      if (data.success && data.activities) {
        // Transform the data to match our expected format
        const formattedActivities = data.activities.map((activity: any) => {
          let icon = '📝';
          let color = 'var(--dk-primary)';
          
          switch (activity.type) {
            case 'workout':
              icon = '🏃';
              color = 'var(--dk-primary)';
              break;
            case 'weight':
              icon = '⚖️';
              color = 'var(--dk-orange)';
              break;
            case 'achievement':
              icon = '🏆';
              color = '#ffd700';
              break;
            case 'team':
              icon = '👥';
              color = 'var(--dk-blue)';
              break;
            case 'payment':
              icon = '💳';
              color = 'var(--dk-green)';
              break;
            case 'registration':
              icon = '📋';
              color = 'var(--dk-purple)';
              break;
            default:
              icon = '📝';
              color = 'var(--dk-primary)';
          }
          
          return {
            id: activity.id,
            type: activity.type,
            user: activity.user || 'System',
            action: activity.action || 'Performed an action',
            time: activity.time || 'Just now',
            icon,
            color
          };
        });
        
        setActivities(formattedActivities);
      } else {
        // Show a message if no activities are found
        setActivities([
          {
            id: 'none',
            type: 'info',
            user: 'No Activity',
            action: 'No recent activity found',
            time: 'Just now',
            icon: 'ℹ️',
            color: 'var(--dk-secondary)'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      
      // Show error message
      setActivities([
        {
          id: 'error',
          type: 'error',
          user: 'Error',
          action: 'Failed to load recent activity',
          time: 'Just now',
          icon: '⚠️',
          color: '#dc3545'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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
