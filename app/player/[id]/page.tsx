'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface PlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position?: string;
  jerseyNumber?: number;
  teamId?: string;
  teamName?: string;
  profilePhoto?: string;
  stats?: {
    gamesPlayed: number;
    touchdowns: number;
    yards: number;
    tackles: number;
  };
  qrCode?: string;
  qrCodeUrl?: string;
}

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = params.id as string;
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (playerId) {
      fetchPlayer();
    }
  }, [playerId]);

  const fetchPlayer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/players/${playerId}`);
      const data = await response.json();
      
      if (data.success && data.player) {
        setPlayer(data.player);
      } else {
        setError('Player not found');
      }
    } catch (err) {
      console.error('Error fetching player:', err);
      setError('Failed to load player profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p>Loading player profile...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <i className="fas fa-user-slash fa-4x text-muted mb-3"></i>
          <h2>Player Not Found</h2>
          <p className="text-muted">{error || 'This player profile does not exist.'}</p>
          <Link href="/" className="btn btn-primary mt-3">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link href="/" className="navbar-brand">
            <strong>All Pro Sports NC</strong>
          </Link>
          <Link href="/" className="btn btn-outline-light btn-sm">
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Player Profile */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Player Card */}
            <div className="card shadow-lg mb-4">
              <div className="card-header bg-primary text-white py-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h2 className="mb-1">
                      {player.firstName} {player.lastName}
                    </h2>
                    <p className="mb-0 opacity-75">
                      {player.position || 'Position TBD'} • {player.teamName || 'Free Agent'}
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end">
                    {player.jerseyNumber && (
                      <div className="jersey-badge">
                        <div className="badge bg-white text-primary" style={{ fontSize: '2rem', padding: '1rem 1.5rem' }}>
                          #{player.jerseyNumber}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-body p-4">
                {/* Contact Information */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h5 className="mb-3">
                      <i className="fas fa-address-card me-2 text-primary"></i>
                      Contact Information
                    </h5>
                    <p className="mb-2">
                      <i className="fas fa-envelope me-2 text-muted"></i>
                      <a href={`mailto:${player.email}`}>{player.email}</a>
                    </p>
                    <p className="mb-0">
                      <i className="fas fa-phone me-2 text-muted"></i>
                      <a href={`tel:${player.phone}`}>{player.phone}</a>
                    </p>
                  </div>

                  {/* Player Stats */}
                  {player.stats && (
                    <div className="col-md-6">
                      <h5 className="mb-3">
                        <i className="fas fa-chart-line me-2 text-primary"></i>
                        Season Stats
                      </h5>
                      <div className="row g-2">
                        <div className="col-6">
                          <div className="card bg-light">
                            <div className="card-body p-2 text-center">
                              <div className="h4 mb-0">{player.stats.gamesPlayed}</div>
                              <small className="text-muted">Games</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="card bg-light">
                            <div className="card-body p-2 text-center">
                              <div className="h4 mb-0">{player.stats.touchdowns}</div>
                              <small className="text-muted">TDs</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="card bg-light">
                            <div className="card-body p-2 text-center">
                              <div className="h4 mb-0">{player.stats.yards}</div>
                              <small className="text-muted">Yards</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="card bg-light">
                            <div className="card-body p-2 text-center">
                              <div className="h4 mb-0">{player.stats.tackles}</div>
                              <small className="text-muted">Tackles</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Code Section */}
                {player.qrCode && (
                  <div className="border-top pt-4">
                    <h5 className="mb-3">
                      <i className="fas fa-qrcode me-2 text-primary"></i>
                      Player QR Code
                    </h5>
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <div className="text-center bg-light p-3 rounded">
                          <img 
                            src={player.qrCode} 
                            alt="Player QR Code" 
                            style={{ width: '200px', height: '200px' }}
                            className="img-fluid"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <p className="text-muted mb-3">
                          Use this QR code for quick check-in at games and events.
                        </p>
                        <a 
                          href={player.qrCode} 
                          download={`${player.firstName}_${player.lastName}_QR.png`}
                          className="btn btn-primary w-100"
                        >
                          <i className="fas fa-download me-2"></i>
                          Download QR Code
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verified Badge */}
                <div className="text-center mt-4 pt-4 border-top">
                  <div className="badge bg-success p-3">
                    <i className="fas fa-check-circle me-2"></i>
                    Verified Player Profile
                  </div>
                  <p className="text-muted mt-2 mb-0 small">
                    This profile has been verified by All Pro Sports NC
                  </p>
                </div>
              </div>
            </div>

            {/* Information Notice */}
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Note:</strong> This is a public player profile. For privacy reasons, 
              some information may be hidden. If you need to update your information, please 
              contact us or log in to your account.
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <Link href="/" className="btn btn-outline-primary me-2">
                <i className="fas fa-home me-2"></i>
                Back to Home
              </Link>
              <Link href="/contact" className="btn btn-outline-secondary">
                <i className="fas fa-envelope me-2"></i>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-2">&copy; {new Date().getFullYear()} All Pro Sports NC. All rights reserved.</p>
          <p className="mb-0 small">
            <Link href="/privacy" className="text-white-50 me-3">Privacy Policy</Link>
            <Link href="/tos" className="text-white-50">Terms of Service</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
