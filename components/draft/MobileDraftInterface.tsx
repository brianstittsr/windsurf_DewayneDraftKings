'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraft } from './DraftProvider';
import { Player } from '@/lib/firestore-schema';

interface PlayerCardProps {
  player: Player;
  isAvailable: boolean;
  isSelected: boolean;
  onSelect: (playerId: string) => void;
  onDetails: (playerId: string) => void;
}

function PlayerCard({ player, isAvailable, isSelected, onSelect, onDetails }: PlayerCardProps) {
  const handleTap = () => {
    if (isAvailable && !isSelected) {
      onSelect(player.id);
    }
  };

  const handleLongPress = () => {
    onDetails(player.id);
  };

  return (
    <motion.div
      className={`player-card ${isAvailable ? 'available' : 'drafted'} ${isSelected ? 'selected' : ''}`}
      whileTap={{ scale: 0.95 }}
      onTap={handleTap}
      onLongPress={handleLongPress}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="player-card-header">
        <div className="player-avatar">
          {player.profilePhoto ? (
            <img src={player.profilePhoto} alt={player.firstName} />
          ) : (
            <div className="avatar-placeholder">
              {player.firstName[0]}{player.lastName[0]}
            </div>
          )}
        </div>
        <div className="player-info">
          <h4 className="player-name">
            {player.firstName} {player.lastName}
          </h4>
          <div className="player-details">
            <span className="position">{player.position}</span>
            {player.jerseyNumber && (
              <span className="jersey">#{player.jerseyNumber}</span>
            )}
          </div>
        </div>
      </div>

      <div className="player-stats">
        <div className="stat">
          <span className="label">Games</span>
          <span className="value">{player.stats?.gamesPlayed || 0}</span>
        </div>
        <div className="stat">
          <span className="label">TD</span>
          <span className="value">{player.stats?.touchdowns || 0}</span>
        </div>
        <div className="stat">
          <span className="label">Yards</span>
          <span className="value">{player.stats?.yards || 0}</span>
        </div>
      </div>

      {!isAvailable && (
        <div className="drafted-overlay">
          <span className="drafted-text">Drafted</span>
        </div>
      )}

      {isSelected && (
        <motion.div
          className="selection-indicator"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="checkmark">✓</div>
        </motion.div>
      )}
    </motion.div>
  );
}

interface DraftTimerProps {
  timeRemaining: number;
  isMyTurn: boolean;
  totalTime: number;
}

function DraftTimer({ timeRemaining, isMyTurn, totalTime }: DraftTimerProps) {
  const percentage = (timeRemaining / totalTime) * 100;
  const isUrgent = timeRemaining <= 10;

  return (
    <motion.div
      className={`draft-timer ${isMyTurn ? 'my-turn' : ''} ${isUrgent ? 'urgent' : ''}`}
      animate={isUrgent ? {
        scale: [1, 1.05, 1],
        transition: { duration: 0.5, repeat: Infinity }
      } : {}}
    >
      <div className="timer-display">
        <div className="time-text">
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
        <div className="timer-label">
          {isMyTurn ? 'Your Turn' : 'Waiting'}
        </div>
      </div>

      <div className="progress-ring">
        <svg width="60" height="60">
          <circle
            cx="30"
            cy="30"
            r="26"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="progress-bg"
          />
          <motion.circle
            cx="30"
            cy="30"
            r="26"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="progress-fill"
            strokeDasharray={`${2 * Math.PI * 26}`}
            strokeDashoffset={`${2 * Math.PI * 26 * (1 - percentage / 100)}`}
            transform="rotate(-90 30 30)"
            initial={{ strokeDashoffset: `${2 * Math.PI * 26}` }}
            animate={{ strokeDashoffset: `${2 * Math.PI * 26 * (1 - percentage / 100)}` }}
            transition={{ duration: 0.5 }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

interface TeamQueueProps {
  teamId: string;
  teamName: string;
  isCurrent: boolean;
  nextPickIn: number;
}

function TeamQueue({ teamId, teamName, isCurrent, nextPickIn }: TeamQueueProps) {
  return (
    <motion.div
      className={`team-queue-item ${isCurrent ? 'current' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="team-info">
        <div className="team-avatar">
          {teamName[0]}
        </div>
        <div className="team-details">
          <div className="team-name">{teamName}</div>
          {isCurrent ? (
            <div className="pick-status current">Picking now...</div>
          ) : (
            <div className="pick-status">Next in {nextPickIn} picks</div>
          )}
        </div>
      </div>

      {isCurrent && (
        <motion.div
          className="current-indicator"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          →
        </motion.div>
      )}
    </motion.div>
  );
}

interface MobileDraftInterfaceProps {
  sessionId: string;
}

export default function MobileDraftInterface({ sessionId }: MobileDraftInterfaceProps) {
  const {
    session,
    loading,
    error,
    currentRound,
    currentPick,
    timeRemaining,
    isMyTurn,
    availablePlayers,
    teams,
    recentPicks,
    connectionStatus,
    makePick,
    updateQueue
  } = useDraft();

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showPlayerDetails, setShowPlayerDetails] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter players based on search
  const filteredPlayers = availablePlayers.filter(player =>
    `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current team info
  const currentTeam = teams.find(team => team.id === session?.currentTeamId);

  const handlePlayerSelect = (playerId: string) => {
    if (isMyTurn && !selectedPlayer) {
      setSelectedPlayer(playerId);
    }
  };

  const handleConfirmPick = async () => {
    if (!selectedPlayer) return;

    const success = await makePick(selectedPlayer);
    if (success) {
      setSelectedPlayer(null);
    }
  };

  const handlePlayerDetails = (playerId: string) => {
    setShowPlayerDetails(playerId);
  };

  if (loading) {
    return (
      <div className="draft-loading">
        <div className="loading-spinner"></div>
        <p>Connecting to draft...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="draft-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="draft-not-found">
        <p>Draft session not found</p>
      </div>
    );
  }

  return (
    <div className="mobile-draft-interface">
      {/* Header */}
      <div className="draft-header">
        <div className="draft-info">
          <h1>{session.name}</h1>
          <div className="draft-status">
            <span className="round">Round {currentRound}</span>
            <span className="pick">Pick {currentPick}</span>
          </div>
        </div>

        <div className="connection-status">
          <div className={`status-indicator ${connectionStatus}`}></div>
          <span>{connectionStatus}</span>
        </div>
      </div>

      {/* Timer */}
      <div className="timer-section">
        <DraftTimer
          timeRemaining={timeRemaining}
          isMyTurn={isMyTurn}
          totalTime={session.pickTimerSeconds}
        />
      </div>

      {/* Current Team */}
      {currentTeam && (
        <div className="current-team-section">
          <h3>On the Clock</h3>
          <div className="current-team-card">
            <div className="team-avatar">{currentTeam.name[0]}</div>
            <div className="team-info">
              <div className="team-name">{currentTeam.name}</div>
              <div className="team-coach">Coach: {currentTeam.coachName}</div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="player-search"
        />
      </div>

      {/* Player Grid */}
      <div className="player-grid">
        <AnimatePresence>
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isAvailable={true} // TODO: Check if player is available
              isSelected={selectedPlayer === player.id}
              onSelect={handlePlayerSelect}
              onDetails={handlePlayerDetails}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Recent Picks */}
      <div className="recent-picks-section">
        <h3>Recent Picks</h3>
        <div className="recent-picks-list">
          {recentPicks.slice(0, 5).map((pick) => {
            const player = availablePlayers.find(p => p.id === pick.playerId);
            const team = teams.find(t => t.id === pick.teamId);

            return (
              <div key={pick.id} className="recent-pick-item">
                <div className="pick-info">
                  <span className="round-pick">R{pick.round} P{pick.pickNumber}</span>
                  <span className="team-name">{team?.name}</span>
                  <span className="player-name">
                    {player?.firstName} {player?.lastName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      {isMyTurn && selectedPlayer && (
        <motion.div
          className="action-buttons"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
        >
          <button
            className="confirm-pick-btn"
            onClick={handleConfirmPick}
          >
            Confirm Pick
          </button>
          <button
            className="cancel-pick-btn"
            onClick={() => setSelectedPlayer(null)}
          >
            Cancel
          </button>
        </motion.div>
      )}

      {/* Player Details Modal */}
      <AnimatePresence>
        {showPlayerDetails && (
          <motion.div
            className="player-details-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPlayerDetails(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Player details content */}
              <button
                className="close-modal"
                onClick={() => setShowPlayerDetails(null)}
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
