'use client';

import { useState, useEffect } from 'react';
import QRCodeService from '@/lib/qr-code-service';
import type { QRCodeData } from '@/lib/qr-code-service';

export default function QRCodeManagementPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'team' | 'league'>('team');

  useEffect(() => {
    loadQRCodes();
  }, [activeTab]);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      const codes = await QRCodeService.getQRCodesByType(activeTab);
      setQrCodes(codes);
    } catch (err) {
      setError('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  const generateTeamQR = async () => {
    setGenerating(true);
    setError('');

    try {
      // Sample teams - in production, this would come from the database
      const sampleTeams = [
        { id: 'team-1', name: 'Thunder Bolts' },
        { id: 'team-2', name: 'Lightning Strikes' },
        { id: 'team-3', name: 'Storm Chasers' },
        { id: 'team-4', name: 'Wind Warriors' },
        { id: 'team-5', name: 'Fire Dragons' },
        { id: 'team-6', name: 'Ice Wolves' }
      ];

      const response = await fetch('/api/qr-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'team',
          entityId: sampleTeams[0].id,
          entityName: sampleTeams[0].name
        })
      });

      if (!response.ok) throw new Error('Failed to generate QR code');

      await loadQRCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate team QR code');
    } finally {
      setGenerating(false);
    }
  };

  const generateLeagueQR = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/qr-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'league',
          entityId: 'main-league',
          entityName: 'All Pro Sports'
        })
      });

      if (!response.ok) throw new Error('Failed to generate QR code');

      await loadQRCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate league QR code');
    } finally {
      setGenerating(false);
    }
  };

  const downloadQRCode = (qrCode: string, filename: string) => {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = qrCode;
    link.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <div className="card dk-card">
            <div className="card-header">
              <h1 className="card-title h3 mb-0">📱 QR Code Management</h1>
              <p className="text-muted mb-0">Generate and manage QR codes for teams and league</p>
            </div>
            <div className="card-body">
              {/* Navigation Tabs */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'team' ? 'active' : ''}`}
                    onClick={() => setActiveTab('team')}
                  >
                    🏆 Team QR Codes
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'league' ? 'active' : ''}`}
                    onClick={() => setActiveTab('league')}
                  >
                    🏈 League QR Code
                  </button>
                </li>
              </ul>

              {/* Action Buttons */}
              <div className="mb-4">
                {activeTab === 'team' ? (
                  <button
                    className="btn dk-btn-primary me-2"
                    onClick={generateTeamQR}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Generating...
                      </>
                    ) : (
                      '➕ Generate Team QR Code'
                    )}
                  </button>
                ) : (
                  <button
                    className="btn dk-btn-primary me-2"
                    onClick={generateLeagueQR}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Generating...
                      </>
                    ) : (
                      '➕ Generate League QR Code'
                    )}
                  </button>
                )}
                <button
                  className="btn btn-outline-secondary"
                  onClick={loadQRCodes}
                  disabled={loading}
                >
                  🔄 Refresh
                </button>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* QR Codes Display */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3"></div>
                  <p>Loading QR codes...</p>
                </div>
              ) : qrCodes.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-qr-code display-1 text-muted"></i>
                  </div>
                  <h5 className="text-muted">No {activeTab} QR codes found</h5>
                  <p className="text-muted">
                    Generate your first {activeTab} QR code using the button above
                  </p>
                </div>
              ) : (
                <div className="row">
                  {qrCodes.map((qr) => (
                    <div key={qr.id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100">
                        <div className="card-body text-center">
                          <h6 className="card-title">{qr.entityName}</h6>
                          <div className="mb-3">
                            <img 
                              src={qr.qrCode} 
                              alt={`${qr.entityName} QR Code`}
                              className="img-fluid border rounded"
                              style={{ maxWidth: '150px' }}
                            />
                          </div>
                          <p className="small text-muted mb-3">
                            {qr.qrCodeUrl}
                          </p>
                          <div className="d-grid gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => downloadQRCode(qr.qrCode, `${qr.entityName}-qr`)}
                            >
                              📥 Download
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => copyToClipboard(qr.qrCodeUrl)}
                            >
                              📋 Copy Link
                            </button>
                          </div>
                          <div className="mt-2">
                            <span className={`badge ${qr.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {qr.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="card-footer">
                          <small className="text-muted">
                            Created: {new Date(qr.createdAt.toDate()).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Usage Instructions */}
              <div className="mt-5">
                <h5 className="text-primary mb-3">📋 Usage Instructions</h5>
                <div className="row">
                  <div className="col-md-6">
                    <h6>Team QR Codes</h6>
                    <ul className="text-muted">
                      <li>Link directly to team roster and stats</li>
                      <li>Perfect for team jerseys and merchandise</li>
                      <li>Can be printed on team materials</li>
                      <li>Updates automatically with team info</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>League QR Code</h6>
                    <ul className="text-muted">
                      <li>Links to main league information</li>
                      <li>Great for promotional materials</li>
                      <li>Use on flyers and advertisements</li>
                      <li>Shows overall league stats and news</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Technical Notes */}
              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="text-primary">🔧 Technical Notes</h6>
                <ul className="mb-0 text-muted small">
                  <li>QR codes are generated as PNG images</li>
                  <li>All codes link to responsive mobile-friendly pages</li>
                  <li>URLs automatically update if site structure changes</li>
                  <li>QR codes can be regenerated if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
