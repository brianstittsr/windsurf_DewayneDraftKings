'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestore-schema';
import { DraftSession, DraftPick, DraftQueue } from '@/lib/firestore-schema';

interface DraftSessionWithStats extends DraftSession {
  totalPicks: number;
  completedPicks: number;
  activeTeams: number;
}

export default function DraftManagement() {
  const [sessions, setSessions] = useState<DraftSessionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'create'>('sessions');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    leagueId: '',
    seasonId: '',
    totalRounds: 10,
    pickTimerSeconds: 60,
    autoPickEnabled: true,
    allowTrades: true,
    draftOrder: 'snake' as 'snake' | 'linear' | 'custom'
  });

  useEffect(() => {
    loadDraftSessions();
  }, []);

  const loadDraftSessions = async () => {
    try {
      setLoading(true);
      const sessionsRef = collection(db, COLLECTIONS.DRAFTS);
      const q = query(sessionsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const sessionsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const sessionData = { id: doc.id, ...doc.data() } as DraftSession;

          // Get pick count for this session
          const picksQuery = query(
            collection(db, COLLECTIONS.DRAFT_PICKS),
            where('sessionId', '==', doc.id)
          );
          const picksSnapshot = await getDocs(picksQuery);

          return {
            ...sessionData,
            totalPicks: picksSnapshot.size,
            completedPicks: picksSnapshot.docs.filter(pick => pick.data().pickType !== 'pending').length,
            activeTeams: sessionData.draftOrder?.length || 0
          } as DraftSessionWithStats;
        })
      );

      setSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load draft sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      if (!createForm.name || !createForm.leagueId || !createForm.seasonId) {
        alert('Please fill in all required fields');
        return;
      }

      const sessionData = {
        ...createForm,
        status: 'scheduled' as const,
        currentRound: 1,
        currentPick: 1,
        draftOrder: [], // Will be set when teams are assigned
        currentTeamId: '',
        timerExpiresAt: Timestamp.now(),
        pickType: createForm.draftOrder,
        createdBy: 'admin', // TODO: Get from auth
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, COLLECTIONS.DRAFTS), sessionData);

      setShowCreateModal(false);
      setCreateForm({
        name: '',
        leagueId: '',
        seasonId: '',
        totalRounds: 10,
        pickTimerSeconds: 60,
        autoPickEnabled: true,
        allowTrades: true,
        draftOrder: 'snake'
      });

      loadDraftSessions();
      alert('Draft session created successfully!');
    } catch (error) {
      console.error('Failed to create draft session:', error);
      alert('Failed to create draft session. Please try again.');
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      const sessionRef = doc(db, COLLECTIONS.DRAFTS, sessionId);
      await updateDoc(sessionRef, {
        status: 'active',
        startedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      loadDraftSessions();
      alert('Draft session started!');
    } catch (error) {
      console.error('Failed to start draft session:', error);
      alert('Failed to start draft session.');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this draft session? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.DRAFTS, sessionId));
      loadDraftSessions();
      alert('Draft session deleted successfully.');
    } catch (error) {
      console.error('Failed to delete draft session:', error);
      alert('Failed to delete draft session.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      scheduled: 'badge-warning',
      active: 'badge-success',
      paused: 'badge-info',
      completed: 'badge-secondary',
      cancelled: 'badge-danger'
    };

    return (
      <span className={`badge ${statusClasses[status as keyof typeof statusClasses] || 'badge-secondary'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Loading draft sessions...</p>
      </div>
    );
  }

  return (
    <div className="draft-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">Draft Management</h1>
          <p className="text-muted">Manage fantasy football draft sessions</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus fa-sm mr-2"></i>
          Create Draft Session
        </button>
      </div>

      {/* Sessions Table */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Draft Sessions</h6>
        </div>
        <div className="card-body">
          {sessions.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-gavel fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No Draft Sessions</h5>
              <p className="text-muted">Create your first draft session to get started.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Round</th>
                    <th>Progress</th>
                    <th>Teams</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <div>
                          <strong>{session.name}</strong>
                          <br />
                          <small className="text-muted">
                            {session.totalRounds} rounds, {session.pickTimerSeconds}s timer
                          </small>
                        </div>
                      </td>
                      <td>{getStatusBadge(session.status)}</td>
                      <td>{session.currentRound}/{session.totalRounds}</td>
                      <td>
                        <div className="progress" style={{ height: '20px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${session.totalPicks > 0 ? (session.completedPicks / session.totalPicks) * 100 : 0}%`
                            }}
                            aria-valuenow={session.completedPicks}
                            aria-valuemin={0}
                            aria-valuemax={session.totalPicks}
                          >
                            {session.completedPicks}/{session.totalPicks}
                          </div>
                        </div>
                      </td>
                      <td>{session.activeTeams}</td>
                      <td>
                        {session.createdAt?.toDate().toLocaleDateString()}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          {session.status === 'scheduled' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleStartSession(session.id)}
                              title="Start Draft"
                            >
                              <i className="fas fa-play"></i>
                            </button>
                          )}
                          {session.status === 'active' && (
                            <a
                              href={`/draft/${session.id}`}
                              className="btn btn-sm btn-primary"
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View Live Draft"
                            >
                              <i className="fas fa-external-link-alt"></i>
                            </a>
                          )}
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => {/* TODO: Edit session */}}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteSession(session.id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Draft Session</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowCreateModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Draft Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={createForm.name}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Fall 2025 Draft"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>League ID *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={createForm.leagueId}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, leagueId: e.target.value }))}
                          placeholder="league-123"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Season ID *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={createForm.seasonId}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, seasonId: e.target.value }))}
                          placeholder="season-2025"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Total Rounds</label>
                        <input
                          type="number"
                          className="form-control"
                          value={createForm.totalRounds}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, totalRounds: parseInt(e.target.value) }))}
                          min="1"
                          max="20"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Pick Timer (seconds)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={createForm.pickTimerSeconds}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, pickTimerSeconds: parseInt(e.target.value) }))}
                          min="10"
                          max="300"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Draft Order Type</label>
                        <select
                          className="form-control"
                          value={createForm.draftOrder}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, draftOrder: e.target.value as any }))}
                        >
                          <option value="snake">Snake Draft</option>
                          <option value="linear">Linear Draft</option>
                          <option value="custom">Custom Order</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="autoPickEnabled"
                          checked={createForm.autoPickEnabled}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, autoPickEnabled: e.target.checked }))}
                        />
                        <label className="form-check-label" htmlFor="autoPickEnabled">
                          Enable Auto-Pick
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="allowTrades"
                          checked={createForm.allowTrades}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, allowTrades: e.target.checked }))}
                        />
                        <label className="form-check-label" htmlFor="allowTrades">
                          Allow Trades
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateSession}
                >
                  Create Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
