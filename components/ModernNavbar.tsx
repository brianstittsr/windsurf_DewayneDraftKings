'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ModernNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="dk-navbar sticky-top">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center py-3">
          {/* Logo/Brand */}
          <Link href="/" className="d-flex align-items-center text-decoration-none">
            <div className="feature-icon me-3">
              <i className="fas fa-trophy"></i>
            </div>
            <div>
              <h4 className="mb-0 gradient-text fw-bold">All Pro Sports</h4>
              <small className="text-muted">Elite Athletic League</small>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center">
            <div className="rounded-nav-container me-4">
              <ul className="nav rounded-nav">
                <li className="nav-item">
                  <Link href="/league" className="nav-link rounded-nav-link">
                    League
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/leaderboard" className="nav-link rounded-nav-link">
                    Leaderboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/pricing" className="nav-link rounded-nav-link">
                    Pricing
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/admin" className="nav-link rounded-nav-link">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* CTA Button */}
            <Link href="/register" className="btn dk-btn-primary me-2">
              <i className="fas fa-user-plus me-2"></i>
              Join League
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="btn d-lg-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} fs-5`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="d-lg-none border-top pt-3 pb-2">
            <div className="d-flex flex-column">
              <Link 
                href="/league" 
                className="nav-link text-dark py-2 px-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-trophy me-2"></i>
                League
              </Link>
              <Link 
                href="/leaderboard" 
                className="nav-link text-dark py-2 px-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-chart-line me-2"></i>
                Leaderboard
              </Link>
              <Link 
                href="/pricing" 
                className="nav-link text-dark py-2 px-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-dollar-sign me-2"></i>
                Pricing
              </Link>
              <Link 
                href="/admin" 
                className="nav-link text-dark py-2 px-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-cog me-2"></i>
                Admin
              </Link>
              <div className="mt-3">
                <Link 
                  href="/register" 
                  className="btn dk-btn-primary w-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user-plus me-2"></i>
                  Join League
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
