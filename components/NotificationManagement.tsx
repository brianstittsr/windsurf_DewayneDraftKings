'use client';

import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'players' | 'coaches' | 'specific';
  targetUsers?: string[];
  status: 'draft' | 'scheduled' | 'sent' | 'archived';
  scheduledFor?: string;
  sentAt?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
  readCount?: number;
  totalRecipients?: number;
  actionUrl?: string;
  actionLabel?: string;
}

export default function NotificationManagement() {
  const [activeTab, setActiveTab] = useState<'create' | 'active' | 'history'>('create');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create notification form
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    priority: 'medium' as Notification['priority'],
    targetAudience: 'all' as Notification['targetAudience'],
    targetUsers: [] as string[],
    scheduledFor: '',
    expiresAt: '',
    actionUrl: '',
    actionLabel: ''
  });

  const [players, setPlayers] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const [playersRes, coachesRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/coaches')
      ]);

      if (playersRes.ok) {
        const data = await playersRes.json();
        setPlayers(data.players || []);
      }
      if (coachesRes.ok) {
        const data = await coachesRes.json();
        setCoaches(data.coaches || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Notification created successfully!');
        setFormData({
          title: '',
          message: '',
          type: 'info',
          priority: 'medium',
          targetAudience: 'all',
          targetUsers: [],
          scheduledFor: '',
          expiresAt: '',
          actionUrl: '',
          actionLabel: ''
        });
        fetchNotifications();
        setActiveTab('active');
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this notification?')) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const activeNotifications = notifications.filter(n => n.status === 'sent' || n.status === 'scheduled');
  const archivedNotifications = notifications.filter(n => n.status === 'archived');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'error': return 'fa-times-circle';
      case 'announcement': return 'fa-bullhorn';
      default: return 'fa-info-circle';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      case 'announcement': return 'primary';
      default: return 'info';
    }
  };

  return (
    <div className="notification-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="fas fa-bell me-2"></i>
            Notification Management
          </h2>
          <p className="text-muted mb-0">Create and manage in-app notifications for users</p>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <i className="fas fa-plus-circle me-2"></i>
            Create Notification
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <i className="fas fa-bell me-2"></i>
            Active ({activeNotifications.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fas fa-archive me-2"></i>
            History ({archivedNotifications.length})
          </button>
        </li>
      </ul>

      {/* Create Notification Tab */}
      {activeTab === 'create' && (
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-plus-circle me-2"></i>
                  Create New Notification
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Title */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Notification title"
                      required
                      maxLength={100}
                    />
                  </div>

                  {/* Message */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Message *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Notification message"
                      required
                      maxLength={500}
                    />
                    <small className="text-muted">{formData.message.length}/500 characters</small>
                  </div>

                  {/* Type and Priority */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Type</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      >
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                        <option value="announcement">Announcement</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Target Audience</label>
                    <select
                      className="form-select"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({...formData, targetAudience: e.target.value as any})}
                    >
                      <option value="all">All Users</option>
                      <option value="players">All Players</option>
                      <option value="coaches">All Coaches</option>
                      <option value="specific">Specific Users</option>
                    </select>
                  </div>

                  {/* Specific Users */}
                  {formData.targetAudience === 'specific' && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Select Users</label>
                      <select
                        className="form-select"
                        multiple
                        size={5}
                        value={formData.targetUsers}
                        onChange={(e) => setFormData({...formData, targetUsers: Array.from(e.target.selectedOptions, option => option.value)})}
                      >
                        <optgroup label="Players">
                          {players.map(player => (
                            <option key={player.id} value={player.id}>
                              {player.firstName} {player.lastName}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Coaches">
                          {coaches.map(coach => (
                            <option key={coach.id} value={coach.id}>
                              {coach.firstName} {coach.lastName}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
                    </div>
                  )}

                  {/* Schedule and Expiry */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Schedule For (Optional)</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.scheduledFor}
                        onChange={(e) => setFormData({...formData, scheduledFor: e.target.value})}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expires At (Optional)</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Action Button Label (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.actionLabel}
                        onChange={(e) => setFormData({...formData, actionLabel: e.target.value})}
                        placeholder="e.g., View Details"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Action URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.actionUrl}
                        onChange={(e) => setFormData({...formData, actionUrl: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        {formData.scheduledFor ? 'Schedule Notification' : 'Send Notification Now'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-eye me-2"></i>
                  Preview
                </h6>
              </div>
              <div className="card-body">
                <div className={`alert alert-${getTypeColor(formData.type)} mb-0`}>
                  <div className="d-flex align-items-start">
                    <i className={`fas ${getTypeIcon(formData.type)} fa-2x me-3`}></i>
                    <div className="flex-grow-1">
                      <h6 className="alert-heading">{formData.title || 'Notification Title'}</h6>
                      <p className="mb-2">{formData.message || 'Your notification message will appear here...'}</p>
                      {formData.actionLabel && (
                        <button className="btn btn-sm btn-outline-dark">
                          {formData.actionLabel}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <h6>Details:</h6>
                  <ul className="list-unstyled small">
                    <li><strong>Type:</strong> {formData.type}</li>
                    <li><strong>Priority:</strong> {formData.priority}</li>
                    <li><strong>Audience:</strong> {formData.targetAudience}</li>
                    {formData.scheduledFor && (
                      <li><strong>Scheduled:</strong> {new Date(formData.scheduledFor).toLocaleString()}</li>
                    )}
                    {formData.expiresAt && (
                      <li><strong>Expires:</strong> {new Date(formData.expiresAt).toLocaleString()}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="card mt-3">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="fas fa-chart-bar me-2"></i>
                  Notification Stats
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <small className="text-muted">Active</small>
                  <h4>{activeNotifications.length}</h4>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Sent Today</small>
                  <h4>{notifications.filter(n => n.sentAt && new Date(n.sentAt).toDateString() === new Date().toDateString()).length}</h4>
                </div>
                <div>
                  <small className="text-muted">Total Sent</small>
                  <h4>{notifications.filter(n => n.status === 'sent').length}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Notifications Tab */}
      {activeTab === 'active' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-bell me-2"></i>
              Active Notifications
            </h5>
          </div>
          <div className="card-body">
            {activeNotifications.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                <p className="text-muted">No active notifications</p>
              </div>
            ) : (
              <div className="row">
                {activeNotifications.map(notification => (
                  <div key={notification.id} className="col-md-6 mb-3">
                    <div className={`card border-${getTypeColor(notification.type)}`}>
                      <div className={`card-header bg-${getTypeColor(notification.type)} text-white`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">
                            <i className={`fas ${getTypeIcon(notification.type)} me-2`}></i>
                            {notification.title}
                          </h6>
                          <span className="badge bg-light text-dark">{notification.priority}</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="card-text">{notification.message}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {notification.readCount || 0} / {notification.totalRecipients || 0} read
                          </small>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleArchive(notification.id)}
                          >
                            <i className="fas fa-archive me-1"></i>
                            Archive
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-archive me-2"></i>
              Notification History
            </h5>
          </div>
          <div className="card-body">
            {archivedNotifications.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-archive fa-3x text-muted mb-3"></i>
                <p className="text-muted">No archived notifications</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Audience</th>
                      <th>Sent</th>
                      <th>Read Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedNotifications.map(notification => (
                      <tr key={notification.id}>
                        <td>
                          <strong>{notification.title}</strong>
                          <br />
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: '300px' }}>
                            {notification.message}
                          </small>
                        </td>
                        <td>
                          <span className={`badge bg-${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                        </td>
                        <td>{notification.targetAudience}</td>
                        <td>{notification.sentAt ? new Date(notification.sentAt).toLocaleString() : 'Not sent'}</td>
                        <td>
                          {notification.totalRecipients ? 
                            `${Math.round((notification.readCount || 0) / notification.totalRecipients * 100)}%` : 
                            'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
