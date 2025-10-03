'use client';

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Team {
  id: string;
  name: string;
  seed?: number;
}

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  team1?: Team;
  team2?: Team;
  winner?: Team;
  score1?: number;
  score2?: number;
  scheduled?: Date;
  completed?: boolean;
}

interface TournamentBracketProps {
  tournamentId: string;
  tournamentName: string;
  teams: Team[];
  matches?: Match[];
  type?: 'single-elimination' | 'double-elimination';
  onMatchUpdate?: (match: Match) => void;
}

export default function TournamentBracket({
  tournamentId,
  tournamentName,
  teams,
  matches: initialMatches,
  type = 'single-elimination',
  onMatchUpdate
}: TournamentBracketProps) {
  const bracketRef = useRef<HTMLDivElement>(null);
  const [matches, setMatches] = useState<Match[]>(initialMatches || generateBracket(teams, type));
  const [loading, setLoading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  // Generate bracket structure
  function generateBracket(teams: Team[], bracketType: string): Match[] {
    const sortedTeams = [...teams].sort((a, b) => (a.seed || 0) - (b.seed || 0));
    const numTeams = sortedTeams.length;
    const numRounds = Math.ceil(Math.log2(numTeams));
    const totalSlots = Math.pow(2, numRounds);
    
    // Add byes if needed
    const teamsWithByes = [...sortedTeams];
    while (teamsWithByes.length < totalSlots) {
      teamsWithByes.push({ id: `bye-${teamsWithByes.length}`, name: 'BYE' });
    }

    const generatedMatches: Match[] = [];
    let matchId = 1;

    // Generate first round
    for (let i = 0; i < totalSlots / 2; i++) {
      const team1 = teamsWithByes[i * 2];
      const team2 = teamsWithByes[i * 2 + 1];
      
      generatedMatches.push({
        id: `match-${matchId}`,
        round: 1,
        matchNumber: i + 1,
        team1: team1.name !== 'BYE' ? team1 : undefined,
        team2: team2.name !== 'BYE' ? team2 : undefined,
        winner: team1.name === 'BYE' ? team2 : team2.name === 'BYE' ? team1 : undefined,
        completed: team1.name === 'BYE' || team2.name === 'BYE'
      });
      matchId++;
    }

    // Generate subsequent rounds
    for (let round = 2; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        generatedMatches.push({
          id: `match-${matchId}`,
          round,
          matchNumber: i + 1,
          completed: false
        });
        matchId++;
      }
    }

    return generatedMatches;
  }

  // Update match result
  const updateMatch = (matchId: string, score1: number, score2: number) => {
    const updatedMatches = matches.map(match => {
      if (match.id === matchId) {
        const winner = score1 > score2 ? match.team1 : match.team2;
        const updated = {
          ...match,
          score1,
          score2,
          winner,
          completed: true
        };
        
        // Advance winner to next round
        advanceWinner(updated);
        
        if (onMatchUpdate) {
          onMatchUpdate(updated);
        }
        
        return updated;
      }
      return match;
    });
    
    setMatches(updatedMatches);
  };

  // Advance winner to next round
  const advanceWinner = (match: Match) => {
    if (!match.winner || !match.completed) return;

    const nextRound = match.round + 1;
    const nextMatchNumber = Math.ceil(match.matchNumber / 2);
    
    setMatches(prev => prev.map(m => {
      if (m.round === nextRound && m.matchNumber === nextMatchNumber) {
        // Determine if winner goes to team1 or team2 slot
        const isTeam1Slot = match.matchNumber % 2 === 1;
        return {
          ...m,
          [isTeam1Slot ? 'team1' : 'team2']: match.winner
        };
      }
      return m;
    }));
  };

  // Export bracket as PDF
  const exportToPDF = async () => {
    if (!bracketRef.current) return;
    
    setLoading(true);
    try {
      const canvas = await html2canvas(bracketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${tournamentName.replace(/\s+/g, '-')}-bracket.pdf`);
      
      alert('✅ Bracket downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  // Email bracket
  const emailBracket = async () => {
    if (!emailAddress || !bracketRef.current) return;
    
    setLoading(true);
    try {
      const canvas = await html2canvas(bracketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const response = await fetch('/api/tournaments/email-bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailAddress,
          tournamentName,
          bracketImage: imgData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Bracket emailed to ${emailAddress}!`);
        setEmailModalOpen(false);
        setEmailAddress('');
      } else {
        const errorMsg = data.details 
          ? `${data.error}\n\n${data.details}` 
          : data.error;
        alert(`❌ Error: ${errorMsg}`);
        console.error('Email error:', data);
      }
    } catch (error) {
      console.error('Error emailing bracket:', error);
      alert('❌ Failed to email bracket. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Get matches by round
  const getMatchesByRound = (round: number) => {
    return matches.filter(m => m.round === round).sort((a, b) => a.matchNumber - b.matchNumber);
  };

  const numRounds = Math.max(...matches.map(m => m.round));

  return (
    <div className="tournament-bracket">
      {/* Header with actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>{tournamentName}</h3>
          <p className="text-muted mb-0">
            {type === 'single-elimination' ? 'Single Elimination' : 'Double Elimination'} Tournament
          </p>
        </div>
        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={exportToPDF}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-download me-2"></i>
                Download PDF
              </>
            )}
          </button>
          <button
            className="btn btn-success"
            onClick={() => setEmailModalOpen(true)}
            disabled={loading}
          >
            <i className="fas fa-envelope me-2"></i>
            Email Bracket
          </button>
        </div>
      </div>

      {/* Bracket visualization */}
      <div ref={bracketRef} className="bracket-container p-4 bg-white rounded shadow-sm">
        <div className="bracket-header text-center mb-4">
          <h2>{tournamentName}</h2>
          <p className="text-muted">Tournament Bracket</p>
        </div>

        <div className="bracket-rounds d-flex justify-content-around">
          {Array.from({ length: numRounds }, (_, i) => i + 1).map(round => (
            <div key={round} className="bracket-round" style={{ flex: 1 }}>
              <h5 className="text-center mb-3">
                {round === numRounds ? 'Finals' : 
                 round === numRounds - 1 ? 'Semi-Finals' :
                 round === numRounds - 2 ? 'Quarter-Finals' :
                 `Round ${round}`}
              </h5>
              
              <div className="matches">
                {getMatchesByRound(round).map((match, index) => (
                  <div 
                    key={match.id} 
                    className="match-card card mb-3"
                    style={{ 
                      marginTop: index > 0 ? `${Math.pow(2, round - 1) * 20}px` : '0'
                    }}
                  >
                    <div className="card-body p-2">
                      {/* Team 1 */}
                      <div className={`team-slot d-flex justify-content-between align-items-center p-2 ${
                        match.winner?.id === match.team1?.id ? 'bg-success text-white' : 'bg-light'
                      }`}>
                        <span className="team-name">
                          {match.team1?.name || 'TBD'}
                          {match.team1?.seed && <small className="ms-2 text-muted">#{match.team1.seed}</small>}
                        </span>
                        {match.completed && (
                          <strong className="score">{match.score1 || 0}</strong>
                        )}
                      </div>
                      
                      <div className="divider my-1"></div>
                      
                      {/* Team 2 */}
                      <div className={`team-slot d-flex justify-content-between align-items-center p-2 ${
                        match.winner?.id === match.team2?.id ? 'bg-success text-white' : 'bg-light'
                      }`}>
                        <span className="team-name">
                          {match.team2?.name || 'TBD'}
                          {match.team2?.seed && <small className="ms-2 text-muted">#{match.team2.seed}</small>}
                        </span>
                        {match.completed && (
                          <strong className="score">{match.score2 || 0}</strong>
                        )}
                      </div>
                      
                      {/* Match info */}
                      {!match.completed && match.team1 && match.team2 && (
                        <div className="text-center mt-2">
                          <small className="text-muted">
                            {match.scheduled ? new Date(match.scheduled).toLocaleDateString() : 'Not scheduled'}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Email Tournament Bracket</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEmailModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <p className="text-muted small">
                  The tournament bracket will be sent as a PDF attachment.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEmailModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={emailBracket}
                  disabled={!emailAddress || loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-envelope me-2"></i>
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bracket-container {
          overflow-x: auto;
          min-width: 100%;
        }
        
        .bracket-rounds {
          min-width: ${numRounds * 300}px;
        }
        
        .bracket-round {
          min-width: 250px;
          padding: 0 10px;
        }
        
        .match-card {
          border: 2px solid #dee2e6;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .match-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .team-slot {
          border-radius: 4px;
          min-height: 40px;
          transition: all 0.2s ease;
        }
        
        .team-name {
          font-weight: 500;
          font-size: 14px;
        }
        
        .score {
          font-size: 18px;
          min-width: 30px;
          text-align: center;
        }
        
        .divider {
          height: 1px;
          background-color: #dee2e6;
        }
        
        @media print {
          .btn-group {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
