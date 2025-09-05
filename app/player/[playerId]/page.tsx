'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { COLLECTIONS, Player } from '@/lib/firestore-schema';

export default function PlayerProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const playerId = params.playerId as string;
  const paymentSuccess = searchParams.get('payment') === 'success';
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        if (!playerId) return;
        
        const playerDoc = await getDoc(doc(db, COLLECTIONS.PLAYERS, playerId));
        if (playerDoc.exists()) {
          setPlayer({ id: playerDoc.id, ...playerDoc.data() } as Player);
        } else {
          setError('Player not found');
        }
      } catch (err) {
        setError('Failed to load player information');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  if (loading) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card dk-card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading player profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card dk-card">
              <div className="card-body text-center">
                <h2 className="text-danger mb-3">⚠️ Error</h2>
                <p className="mb-3">{error}</p>
                <button 
                  className="btn dk-btn-primary"
                  onClick={() => window.location.href = '/register'}
                >
                  Register New Player
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!player) return null;

  return (
    <div className="container my-5">
      {/* Payment Success Alert */}
      {paymentSuccess && (
        <div className="row justify-content-center mb-4">
          <div className="col-md-10">
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <h5 className="alert-heading">🎉 Payment Successful!</h5>
              <p className="mb-0">
                Welcome to All Pro Sports, {player.firstName}! Your registration is complete and your player profile is now active.
              </p>
              <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Player Profile Card */}
        <div className="col-md-8">
          <div className="card dk-card mb-4">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col">
                  <h1 className="card-title h3 mb-0">
                    🏈 {player.firstName} {player.lastName}
                  </h1>
                  <p className="text-muted mb-0">
                    {player.position.charAt(0).toUpperCase() + player.position.slice(1)} • 
                    {player.playerTag.charAt(0).toUpperCase() + player.playerTag.slice(1).replace('-', ' ')}
                  </p>
                </div>
                <div className="col-auto">
                  <span className={`badge ${player.registrationStatus === 'confirmed' ? 'bg-success' : 'bg-warning'} fs-6`}>
                    {player.registrationStatus === 'confirmed' ? '✅ Registered' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* Basic Info */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">📋 Basic Information</h6>
                  <p><strong>Phone:</strong> {player.phone}</p>
                  <p><strong>Email:</strong> {player.email || 'Not provided'}</p>
                  <p><strong>Date of Birth:</strong> {new Date(player.dateOfBirth.toDate()).toLocaleDateString()}</p>
                  <p><strong>Registration Date:</strong> {new Date(player.registrationDate.toDate()).toLocaleDateString()}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">🏈 Player Details</h6>
                  <p><strong>Position:</strong> {player.position.charAt(0).toUpperCase() + player.position.slice(1)}</p>
                  <p><strong>Player Type:</strong> {player.playerTag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <p><strong>Team Status:</strong> {player.isDrafted ? 'Drafted' : 'Available'}</p>
                  <p><strong>Payment Status:</strong> 
                    <span className={`ms-2 badge ${player.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                      {player.paymentStatus.charAt(0).toUpperCase() + player.paymentStatus.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mb-4">
                <h6 className="text-primary mb-3">🚨 Emergency Contact</h6>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Name:</strong> {player.emergencyContact?.name || 'Not provided'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Phone:</strong> {player.emergencyContact?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Referral Info */}
              {player.referredBy && (
                <div className="mb-4">
                  <h6 className="text-primary mb-3">👥 Referral Information</h6>
                  <p><strong>Referred By:</strong> {player.referredBy}</p>
                  <p><strong>Referral Level:</strong> {player.referralLevel}</p>
                  <p><strong>Referral Rewards:</strong> {player.referralRewards} points</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="card dk-card">
            <div className="card-header">
              <h5 className="card-title mb-0">📊 Player Statistics</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-2">
                  <div className="mb-3">
                    <div className="h4 text-primary mb-1">{player.stats.gamesPlayed}</div>
                    <small className="text-muted">Games</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="mb-3">
                    <div className="h4 text-success mb-1">{player.stats.touchdowns}</div>
                    <small className="text-muted">TDs</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="mb-3">
                    <div className="h4 text-info mb-1">{player.stats.yards}</div>
                    <small className="text-muted">Yards</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="mb-3">
                    <div className="h4 text-warning mb-1">{player.stats.tackles}</div>
                    <small className="text-muted">Tackles</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="mb-3">
                    <div className="h4 text-danger mb-1">{player.stats.interceptions}</div>
                    <small className="text-muted">INTs</small>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="mb-3">
                    <div className="h4 text-secondary mb-1">{player.stats.attendance}</div>
                    <small className="text-muted">Attendance</small>
                  </div>
                </div>
              </div>
              <div className="text-center mt-3">
                <small className="text-muted">
                  Statistics will be updated as the season progresses
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-md-4">
          {/* QR Code Card */}
          <div className="card dk-card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">📱 Player QR Code</h5>
            </div>
            <div className="card-body text-center">
              <img 
                src={player.qrCode} 
                alt="Player QR Code" 
                className="img-fluid mb-3 border rounded"
                style={{ maxWidth: '200px' }}
              />
              <p className="text-muted mb-3">
                Scan this QR code to quickly access this player profile
              </p>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigator.clipboard.writeText(player.qrCodeUrl)}
              >
                📋 Copy Profile Link
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card dk-card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">⚡ Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  📧 Contact Player
                </button>
                <button className="btn btn-outline-success btn-sm">
                  📊 Update Stats
                </button>
                <button className="btn btn-outline-info btn-sm">
                  🏥 Medical Info
                </button>
                <button className="btn btn-outline-warning btn-sm">
                  💰 Payment History
                </button>
              </div>
            </div>
          </div>

          {/* Team Info */}
          {player.teamId ? (
            <div className="card dk-card">
              <div className="card-header">
                <h5 className="card-title mb-0">🏆 Team Information</h5>
              </div>
              <div className="card-body">
                <p><strong>Team:</strong> {player.teamId}</p>
                <p><strong>Draft Round:</strong> {player.draftRound || 'N/A'}</p>
                <p><strong>Draft Pick:</strong> {player.draftPick || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="card dk-card">
              <div className="card-header">
                <h5 className="card-title mb-0">🎯 Draft Status</h5>
              </div>
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-clock-history display-4 text-muted"></i>
                </div>
                <p className="text-muted">
                  Available for draft
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
