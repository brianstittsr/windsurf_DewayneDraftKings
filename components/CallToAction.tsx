'use client'

import { Card, Button, Alert } from 'react-bootstrap'
import { FaRocket, FaUsers, FaTrophy, FaBolt } from 'react-icons/fa'
import Link from 'next/link'

export function CallToAction() {
  const callToActions = [
    {
      title: 'Join a Team',
      description: 'Connect with players in your sport and compete together',
      icon: <FaUsers />,
      color: 'var(--dk-primary)',
      link: '/teams',
      buttonText: 'Find Teams'
    },
    {
      title: 'Climb the Leaderboard',
      description: 'Track your progress and compete for the top spot',
      icon: <FaTrophy />,
      color: 'var(--dk-orange)',
      link: '/leaderboard',
      buttonText: 'View Rankings'
    },
    {
      title: 'Upgrade to Pro',
      description: 'Get advanced analytics and personalized coaching',
      icon: <FaRocket />,
      color: 'var(--dk-blue)',
      link: '/register?plan=pro',
      buttonText: 'Upgrade Now'
    }
  ]

  return (
    <div>
      {/* Featured CTA */}
      <Alert className="text-center" style={{ 
        background: 'linear-gradient(135deg, var(--dk-primary) 0%, #45b82e 100%)',
        border: 'none',
        color: 'white'
      }}>
        <FaBolt className="mb-2" size={24} />
        <h6 className="mb-2">⚡ Limited Time Offer</h6>
        <p className="mb-3 small">Get 30% off Pro membership this month!</p>
        <Link href="/register?promo=SAVE30">
          <Button variant="light" size="sm" className="fw-bold">
            Claim Offer
          </Button>
        </Link>
      </Alert>

      {/* Action Cards */}
      {callToActions.map((cta, index) => (
        <Card key={index} className="dk-card mb-3">
          <Card.Body className="text-center">
            <div 
              className="rounded-circle p-3 mx-auto mb-3"
              style={{ 
                backgroundColor: `${cta.color}20`,
                color: cta.color,
                fontSize: '1.5rem',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {cta.icon}
            </div>
            <Card.Title className="text-white h6">{cta.title}</Card.Title>
            <Card.Text className="text-muted small mb-3">
              {cta.description}
            </Card.Text>
            <Link href={cta.link}>
              <Button 
                className="dk-btn-primary w-100"
                size="sm"
              >
                {cta.buttonText}
              </Button>
            </Link>
          </Card.Body>
        </Card>
      ))}
    </div>
  )
}
