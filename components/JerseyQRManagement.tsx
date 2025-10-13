'use client';

import { useState, useEffect } from 'react';
import { Player, Team, COLLECTIONS, JerseyQRCode } from '@/lib/firestore-schema';
import { QRCodeGenerator } from '@/lib/qr-generator';
import { collection, doc, updateDoc, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface JerseyQRManagementProps {
  playerId?: string; // If provided, show only this player's jersey QR
}

export default function JerseyQRManagement({ playerId }: JerseyQRManagementProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [jerseyQRs, setJerseyQRs] = useState<JerseyQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Form state for jersey assignment
  const [jerseyForm, setJerseyForm] = useState({
    playerId: '',
    teamId: '',
    jerseyNumber: '',
    printStatus: 'pending' as 'pending' | 'printed' | 'delivered' | 'active'
  });

  useEffect(() => {
    fetchData();
  }, [playerId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch players
      const playersQuery = playerId
        ? query(collection(db, COLLECTIONS.PLAYERS), where('__name__', '==', playerId))
        : collection(db, COLLECTIONS.PLAYERS);

      const [playersSnap, teamsSnap, jerseySnap] = await Promise.all([
        getDocs(playersQuery),
        getDocs(collection(db, COLLECTIONS.TEAMS)),
        getDocs(collection(db, COLLECTIONS.JERSEY_QR_CODES))
      ]);

      const playersData = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Player[];
      const teamsData = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Team[];
      const jerseyData = jerseySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JerseyQRCode[];

      setPlayers(playersData);
      setTeams(teamsData);
      setJerseyQRs(jerseyData);

      // If specific playerId provided, set as selected
      if (playerId && playersData.length > 0) {
        setSelectedPlayer(playersData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJerseyQR = async () => {
    if (!jerseyForm.playerId || !jerseyForm.teamId || !jerseyForm.jerseyNumber) {
      alert('Please fill in all required fields');
      return;
    }

    setGenerating(true);
    try {
      const player = players.find(p => p.id === jerseyForm.playerId);
      const team = teams.find(t => t.id === jerseyForm.teamId);

      if (!player || !team) {
        alert('Player or team not found');
        return;
      }

      // Generate QR code
      const { qrCode, url, data } = await QRCodeGenerator.generateJerseyQRWithData(
        jerseyForm.playerId,
        parseInt(jerseyForm.jerseyNumber),
        team.name,
        `${player.firstName} ${player.lastName}`
      );

      // Save to Firestore
      const jerseyQRData = {
        playerId: jerseyForm.playerId,
        teamId: jerseyForm.teamId,
        jerseyNumber: parseInt(jerseyForm.jerseyNumber),
        qrCodeUrl: qrCode,
        landingPageUrl: url,
        scanCount: 0,
        printStatus: jerseyForm.printStatus,
        specifications: {
          placement: 'chest',
          size: '2x2 inches',
          color: 'black',
          material: 'sublimation'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, COLLECTIONS.JERSEY_QR_CODES), jerseyQRData);

      // Update player with jersey number
      await updateDoc(doc(db, COLLECTIONS.PLAYERS, jerseyForm.playerId), {
        jerseyNumber: parseInt(jerseyForm.jerseyNumber),
        updatedAt: new Date()
      });

      alert('Jersey QR code generated successfully!');
      setShowGenerateModal(false);
      setJerseyForm({
        playerId: '',
        teamId: '',
        jerseyNumber: '',
        printStatus: 'pending'
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error generating jersey QR:', error);
      alert('Failed to generate jersey QR code');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteJerseyQR = async (jerseyQRId: string) => {
    if (!confirm('Are you sure you want to delete this jersey QR code?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.JERSEY_QR_CODES, jerseyQRId));
      fetchData();
      alert('Jersey QR code deleted successfully');
    } catch (error) {
      console.error('Error deleting jersey QR:', error);
      alert('Failed to delete jersey QR code');
    }
  };

  const handlePrintJerseyQR = (jerseyQR: JerseyQRCode) => {
    // Open print dialog with QR code
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Jersey QR Code - ${jerseyQR.jerseyNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { margin: 20px auto; max-width: 300px; }
              .jersey-info { margin: 20px 0; }
              .print-info { font-size: 12px; color: #666; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h2>All Pro Sports - Jersey QR Code</h2>
            <div class="jersey-info">
              <h3>Jersey #${jerseyQR.jerseyNumber}</h3>
              <p>Player ID: ${jerseyQR.playerId}</p>
              <p>Team ID: ${jerseyQR.teamId}</p>
            </div>
            <div class="qr-container">
              <img src="${jerseyQR.qrCodeUrl}" alt="Jersey QR Code" style="max-width: 100%; height: auto;" />
            </div>
            <div class="print-info">
              <p>Scan this QR code to view player information</p>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Loading jersey QR codes...</p>
      </div>
    );
  }

  return (
    <div className="jersey-qr-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">Jersey QR Code Management</h1>
          <p className="text-muted">Generate and manage QR codes for player jerseys</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowGenerateModal(true)}
        >
          <i className="fas fa-plus fa-sm mr-2"></i>
          Generate Jersey QR
        </button>
      </div>

      {/* Jersey QR Codes Table */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Jersey QR Codes</h6>
        </div>
        <div className="card-body">
          {jerseyQRs.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-qrcode fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No Jersey QR Codes</h5>
              <p className="text-muted">Generate your first jersey QR code to get started.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Jersey #</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Print Status</th>
                    <th>Scan Count</th>
                    <th>QR Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jerseyQRs.map((jerseyQR) => {
                    const player = players.find(p => p.id === jerseyQR.playerId);
                    const team = teams.find(t => t.id === jerseyQR.teamId);

                    return (
                      <tr key={jerseyQR.id}>
                        <td>
                          <strong>#{jerseyQR.jerseyNumber}</strong>
                        </td>
                        <td>
                          {player ? `${player.firstName} ${player.lastName}` : 'Unknown Player'}
                        </td>
                        <td>
                          {team ? team.name : 'Unknown Team'}
                        </td>
                        <td>
                          <span className={`badge badge-${jerseyQR.printStatus === 'active' ? 'success' : jerseyQR.printStatus === 'printed' ? 'info' : 'warning'}`}>
                            {jerseyQR.printStatus.charAt(0).toUpperCase() + jerseyQR.printStatus.slice(1)}
                          </span>
                        </td>
                        <td>{jerseyQR.scanCount}</td>
                        <td>
                          <img
                            src={jerseyQR.qrCodeUrl}
                            alt={`Jersey QR #${jerseyQR.jerseyNumber}`}
                            style={{ width: '50px', height: '50px', cursor: 'pointer' }}
                            onClick={() => window.open(jerseyQR.qrCodeUrl, '_blank')}
                          />
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => handlePrintJerseyQR(jerseyQR)}
                              title="Print QR Code"
                            >
                              <i className="fas fa-print"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => {/* TODO: Edit jersey QR */}}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteJerseyQR(jerseyQR.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Generate Jersey QR Modal */}
      {showGenerateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Generate Jersey QR Code</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowGenerateModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Player *</label>
                        <select
                          className="form-control"
                          value={jerseyForm.playerId}
                          onChange={(e) => setJerseyForm(prev => ({ ...prev, playerId: e.target.value }))}
                          required
                        >
                          <option value="">Select Player</option>
                          {players.map(player => (
                            <option key={player.id} value={player.id}>
                              {player.firstName} {player.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Team *</label>
                        <select
                          className="form-control"
                          value={jerseyForm.teamId}
                          onChange={(e) => setJerseyForm(prev => ({ ...prev, teamId: e.target.value }))}
                          required
                        >
                          <option value="">Select Team</option>
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Jersey Number *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={jerseyForm.jerseyNumber}
                          onChange={(e) => setJerseyForm(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                          placeholder="e.g., 23"
                          min="0"
                          max="99"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Print Status</label>
                        <select
                          className="form-control"
                          value={jerseyForm.printStatus}
                          onChange={(e) => setJerseyForm(prev => ({ ...prev, printStatus: e.target.value as any }))}
                        >
                          <option value="pending">Pending</option>
                          <option value="printed">Printed</option>
                          <option value="delivered">Delivered</option>
                          <option value="active">Active</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerateJerseyQR}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate QR Code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
