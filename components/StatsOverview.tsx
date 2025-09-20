'use client'

import { useState, useEffect } from 'react'
import { Row, Col, Card } from 'react-bootstrap'

export function StatsOverview() {
  const [stats, setStats] = useState([
    {
      title: 'Total Players',
      value: '0',
      change: '+0%',
      icon: '👥',
      color: 'var(--dk-primary)'
    },
    {
      title: 'Active Workouts',
      value: '0',
      change: '+0%',
      icon: '🏃',
      color: 'var(--dk-orange)'
    },
    {
      title: 'Competitions',
      value: '0',
      change: '+0%',
      icon: '🏆',
      color: 'var(--dk-blue)'
    },
    {
      title: 'Calories Burned',
      value: '0',
      change: '+0%',
      icon: '🔥',
      color: '#dc3545'
    }
  ]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch stats from API endpoints
      const [playersRes, workoutsRes, competitionsRes] = await Promise.all([
        fetch('/api/players/stats'),
        fetch('/api/workouts/stats'),
        fetch('/api/competitions/stats')
      ]);
      
      const [playersData, workoutsData, competitionsData] = await Promise.all([
        playersRes.json(),
        workoutsRes.json(),
        competitionsRes.json()
      ]);
      
      // Update stats with real data
      const updatedStats = [...stats];
      
      if (playersData.success) {
        updatedStats[0] = {
          ...updatedStats[0],
          value: playersData.total.toString(),
          change: playersData.change
        };
      }
      
      if (workoutsData.success) {
        updatedStats[1] = {
          ...updatedStats[1],
          value: workoutsData.total.toLocaleString(),
          change: workoutsData.change
        };
      }
      
      if (competitionsData.success) {
        updatedStats[2] = {
          ...updatedStats[2],
          value: competitionsData.total.toString(),
          change: competitionsData.change
        };
      }
      
      // For calories burned, we would need to calculate from workout data
      // This is a placeholder value
      updatedStats[3] = {
        ...updatedStats[3],
        value: '0',
        change: '+0%'
      };
      
      setStats(updatedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-0 text-white">Loading...</h3>
                    <p className="text-muted mb-0">{stat.title}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

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
