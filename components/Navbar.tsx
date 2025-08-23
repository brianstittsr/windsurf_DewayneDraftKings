'use client'

import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap'
import Link from 'next/link'
import { FaTrophy } from 'react-icons/fa'

export function Navbar() {
  return (
    <BSNavbar expand="lg" className="dk-navbar" variant="dark">
      <Container fluid>
        <Link href="/" className="navbar-brand">
          <strong style={{ color: 'var(--dk-primary)' }}>DraftKings</strong>League
        </Link>
        
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link href="/leaderboard" className="nav-link">
              <FaTrophy className="me-1" /> Leaderboard
            </Link>
            <Link href="/register" className="nav-link">
              📱 Register for SMS
            </Link>
            <Link href="/admin" className="nav-link">
              📊 Admin Dashboard
            </Link>
          </Nav>
          
          <Nav>
            <div className="d-flex gap-2">
              <Link href="/register">
                <Button className="dk-btn-primary" size="sm">
                  Join League
                </Button>
              </Link>
            </div>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}
