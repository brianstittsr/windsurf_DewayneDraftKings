'use client'

import { Navbar as BSNavbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { FaUser, FaTrophy, FaChartLine, FaUsers, FaCog } from 'react-icons/fa'

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <BSNavbar expand="lg" className="dk-navbar" variant="dark">
      <Container fluid>
        <Link href="/" className="navbar-brand">
          <strong style={{ color: 'var(--dk-primary)' }}>Sports</strong>Tracker
        </Link>
        
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link href="/leaderboard" className="nav-link">
              <FaTrophy className="me-1" /> Leaderboard
            </Link>
            <Link href="/teams" className="nav-link">
              <FaUsers className="me-1" /> Teams
            </Link>
            <NavDropdown title="Sports" id="sports-dropdown">
              <Link href="/sports/flag-football" className="dropdown-item">
                Flag Football
              </Link>
              <Link href="/sports/volleyball" className="dropdown-item">
                Volleyball
              </Link>
              <Link href="/sports/kickball" className="dropdown-item">
                Kickball
              </Link>
              <Link href="/sports/basketball" className="dropdown-item">
                Basketball
              </Link>
            </NavDropdown>
          </Nav>
          
          <Nav>
            {status === 'loading' ? (
              <Nav.Link disabled>Loading...</Nav.Link>
            ) : session ? (
              <>
                <NavDropdown 
                  title={
                    <span>
                      <FaUser className="me-1" />
                      {session.user?.name || 'User'}
                    </span>
                  } 
                  id="user-dropdown"
                >
                  <Link href="/dashboard" className="dropdown-item">
                    <FaChartLine className="me-2" />
                    Dashboard
                  </Link>
                  <Link href="/dashboard/profile" className="dropdown-item">
                    <FaUser className="me-2" />
                    Profile
                  </Link>
                  <Link href="/dashboard/metrics" className="dropdown-item">
                    <FaChartLine className="me-2" />
                    My Metrics
                  </Link>
                  <NavDropdown.Divider />
                  <Link href="/settings" className="dropdown-item">
                    <FaCog className="me-2" />
                    Settings
                  </Link>
                  <NavDropdown.Divider />
                  <button 
                    className="dropdown-item" 
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </button>
                </NavDropdown>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={() => signIn()}
                >
                  Sign In
                </Button>
                <Link href="/register">
                  <Button className="dk-btn-primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}
