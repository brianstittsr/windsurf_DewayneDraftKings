'use client';

import { useState, useEffect } from 'react';
import { Player, Team, COLLECTIONS } from '@/lib/firestore-schema';
import { collection, doc, getDoc, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PublicPlayerProfileProps {
  playerId: string;
}

export default function PublicPlayerProfile({ playerId }: PublicPlayerProfileProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'gallery' | 'achievements'>('overview');

  useEffect(() => {
    fetchPlayerData();
  }, [playerId]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);

      // Fetch player data
      const playerDoc = await getDoc(doc(db, COLLECTIONS.PLAYERS, playerId));
      if (!playerDoc.exists()) {
        setError('Player not found');
        return;
      }

      const playerData = { id: playerDoc.id, ...playerDoc.data() } as Player;
      setPlayer(playerData);

      // Fetch team data if player has a team
      if (playerData.teamId) {
        const teamDoc = await getDoc(doc(db, COLLECTIONS.TEAMS, playerData.teamId));
        if (teamDoc.exists()) {
          setTeam({ id: teamDoc.id, ...teamDoc.data() } as Team);
        }
      }

    } catch (error) {
      console.error('Error fetching player data:', error);
      setError('Failed to load player information');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${player?.firstName} ${player?.lastName} - All Pro Sports Player Profile`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      alert('Profile link copied to clipboard!');
    }
  };

  const handleFollow = () => {
    // In a real implementation, this would handle following functionality
    alert('Follow functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="public-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading player profile...</p>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="public-profile-error">
        <div className="error-icon">⚠️</div>
        <h2>Player Not Found</h2>
        <p>{error || 'The requested player profile could not be found.'}</p>
        <button onClick={() => window.history.back()} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="public-player-profile">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-background">
          {team && (
            <div className="team-banner">
              <img src={team.logoUrl || '/default-team-logo.png'} alt={team.name} />
              <span>{team.name}</span>
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="player-avatar">
            {player.profilePhoto ? (
              <img src={player.profilePhoto} alt={`${player.firstName} ${player.lastName}`} />
            ) : (
              <div className="avatar-placeholder">
                {player.firstName[0]}{player.lastName[0]}
              </div>
            )}
          </div>

          <div className="player-details">
            <h1 className="player-name">{player.firstName} {player.lastName}</h1>
            <div className="player-meta">
              <span className="position">{player.position}</span>
              {player.jerseyNumber && (
                <span className="jersey">#{player.jerseyNumber}</span>
              )}
              {team && <span className="team-name">{team.name}</span>}
            </div>

            <div className="player-stats-summary">
              <div className="stat">
                <span className="value">{player.stats.gamesPlayed}</span>
                <span className="label">Games</span>
              </div>
              <div className="stat">
                <span className="value">{player.stats.touchdowns}</span>
                <span className="label">TDs</span>
              </div>
              <div className="stat">
                <span className="value">{player.stats.yards}</span>
                <span className="label">Yards</span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="action-btn primary" onClick={handleFollow}>
              <i className="fas fa-heart"></i>
              Follow
            </button>
            <button className="action-btn secondary" onClick={handleShare}>
              <i className="fas fa-share"></i>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery
        </button>
        <button
          className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="bio-section">
              <h3>About {player.firstName}</h3>
              <p className="bio-text">
                {player.playerTag === 'veteran' ? 'A seasoned player with years of experience on the field.' :
                 player.playerTag === 'rookie' ? 'An exciting new talent ready to make their mark.' :
                 player.playerTag === 'meet-greet' ? 'Always ready to meet fans and share the game experience.' :
                 'A dedicated athlete committed to excellence on and off the field.'}
              </p>

              <div className="player-details-grid">
                <div className="detail-item">
                  <span className="label">Position:</span>
                  <span className="value">{player.position}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Experience:</span>
                  <span className="value">{player.playerTag}</span>
                </div>
                {player.dateOfBirth && (
                  <div className="detail-item">
                    <span className="label">Age:</span>
                    <span className="value">
                      {new Date().getFullYear() - new Date(player.dateOfBirth.seconds * 1000).getFullYear()}
                    </span>
                  </div>
                )}
                {player.jerseySize && (
                  <div className="detail-item">
                    <span className="label">Jersey Size:</span>
                    <span className="value">{player.jerseySize}</span>
                  </div>
                )}
              </div>
            </div>

            {team && (
              <div className="team-section">
                <h3>Team Information</h3>
                <div className="team-card">
                  <div className="team-logo">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} />
                    ) : (
                      <div className="logo-placeholder">
                        {team.name.split(' ').map(word => word[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div className="team-info">
                    <h4>{team.name}</h4>
                    <p>Division: {team.division}</p>
                    <p>Record: {team.stats.wins}-{team.stats.losses}-{team.stats.ties}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-tab">
            <h3>Season Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎮</div>
                <div className="stat-info">
                  <div className="stat-value">{player.stats.gamesPlayed}</div>
                  <div className="stat-label">Games Played</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <div className="stat-value">{player.stats.touchdowns}</div>
                  <div className="stat-label">Touchdowns</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📏</div>
                <div className="stat-info">
                  <div className="stat-value">{player.stats.yards}</div>
                  <div className="stat-label">Total Yards</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🛡️</div>
                <div className="stat-info">
                  <div className="stat-value">{player.stats.tackles}</div>
                  <div className="stat-label">Tackles</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🚫</div>
                <div className="stat-info">
                  <div className="stat-value">{player.stats.interceptions}</div>
                  <div className="stat-label">Interceptions</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <div className="stat-value">{player.stats.attendance}%</div>
                  <div className="stat-label">Attendance Rate</div>
                </div>
              </div>
            </div>

            <div className="stats-chart-placeholder">
              <h4>Performance Over Time</h4>
              <div className="chart-placeholder">
                <p>Performance chart would be displayed here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="gallery-tab">
            <h3>Photo Gallery</h3>
            <div className="gallery-grid">
              {/* Placeholder for photo gallery */}
              <div className="gallery-item placeholder">
                <div className="placeholder-content">
                  <i className="fas fa-camera"></i>
                  <p>Game Action Photos</p>
                </div>
              </div>
              <div className="gallery-item placeholder">
                <div className="placeholder-content">
                  <i className="fas fa-users"></i>
                  <p>Team Photos</p>
                </div>
              </div>
              <div className="gallery-item placeholder">
                <div className="placeholder-content">
                  <i className="fas fa-award"></i>
                  <p>Achievement Photos</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-tab">
            <h3>Achievements & Awards</h3>
            <div className="achievements-list">
              {/* Dynamic achievements based on stats */}
              {player.stats.gamesPlayed >= 5 && (
                <div className="achievement-card">
                  <div className="achievement-icon">🏈</div>
                  <div className="achievement-info">
                    <h4>Game Warrior</h4>
                    <p>Played {player.stats.gamesPlayed} games</p>
                  </div>
                </div>
              )}

              {player.stats.touchdowns >= 3 && (
                <div className="achievement-card">
                  <div className="achievement-icon">🏆</div>
                  <div className="achievement-info">
                    <h4>Scoring Machine</h4>
                    <p>Scored {player.stats.touchdowns} touchdowns</p>
                  </div>
                </div>
              )}

              {player.stats.yards >= 100 && (
                <div className="achievement-card">
                  <div className="achievement-icon">📏</div>
                  <div className="achievement-info">
                    <h4>Yard Master</h4>
                    <p>Gained {player.stats.yards} total yards</p>
                  </div>
                </div>
              )}

              {player.stats.attendance >= 90 && (
                <div className="achievement-card">
                  <div className="achievement-icon">⭐</div>
                  <div className="achievement-info">
                    <h4>Reliable Player</h4>
                    <p>{player.stats.attendance}% attendance rate</p>
                  </div>
                </div>
              )}

              {player.playerTag === 'veteran' && (
                <div className="achievement-card">
                  <div className="achievement-icon">👑</div>
                  <div className="achievement-info">
                    <h4>Team Veteran</h4>
                    <p>Experienced leader and role model</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="profile-footer">
        <p>© 2025 All Pro Sports - Player Profile</p>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
