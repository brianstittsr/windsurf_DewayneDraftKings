'use client';

import React, { useState, useEffect } from 'react';

interface SMSMessage {
  id: string;
  recipient: string;
  recipientName?: string;
  recipientType: 'player' | 'coach' | 'team' | 'all';
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
  provider?: string;
  cost?: number;
  errorMessage?: string;
}

interface SMSTemplate {
  id: string;
  name: string;
  message: string;
  category: string;
  variables: string[];
}

export default function SMSManagement() {
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'templates'>('send');
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Send SMS form
  const [recipientType, setRecipientType] = useState<'individual' | 'group' | 'all'>('individual');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  
  // Available recipients
  const [players, setPlayers] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchMessages();
    fetchTemplates();
    fetchRecipients();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/sms/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/sms/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchRecipients = async () => {
    try {
      const [playersRes, coachesRes, teamsRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/coaches'),
        fetch('/api/teams')
      ]);

      if (playersRes.ok) {
        const data = await playersRes.json();
        setPlayers(data.players || []);
      }
      if (coachesRes.ok) {
        const data = await coachesRes.json();
        setCoaches(data.coaches || []);
      }
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        recipientType,
        recipients: selectedRecipients,
        message: messageText,
        scheduled: isScheduled,
        scheduledFor: isScheduled ? `${scheduleDate}T${scheduleTime}` : null
      };

      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ SMS ${isScheduled ? 'scheduled' : 'sent'} successfully!`);
        setMessageText('');
        setSelectedRecipients([]);
        setScheduleDate('');
        setScheduleTime('');
        fetchMessages();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: SMSTemplate) => {
    setMessageText(template.message);
  };

  const optOutText = "\n\nReply STOP to opt-out of future messages.";
  const characterCount = messageText.length;
  const totalCharacterCount = characterCount + optOutText.length;
  const smsCount = Math.ceil(totalCharacterCount / 160);

  return (
    <div className="sms-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="fas fa-sms me-2"></i>
            SMS Management
          </h2>
          <p className="text-muted mb-0">Send and manage SMS messages to players and coaches</p>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            <i className="fas fa-paper-plane me-2"></i>
            Send SMS
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fas fa-history me-2"></i>
            Message History
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <i className="fas fa-file-alt me-2"></i>
            Templates
          </button>
        </li>
      </ul>

      {/* Send SMS Tab */}
      {activeTab === 'send' && (
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-paper-plane me-2"></i>
                  Compose SMS
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSendSMS}>
                  {/* Recipient Type */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Send To</label>
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="recipientType"
                        id="individual"
                        checked={recipientType === 'individual'}
                        onChange={() => setRecipientType('individual')}
                      />
                      <label className="btn btn-outline-primary" htmlFor="individual">
                        <i className="fas fa-user me-1"></i>
                        Individual
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="recipientType"
                        id="group"
                        checked={recipientType === 'group'}
                        onChange={() => setRecipientType('group')}
                      />
                      <label className="btn btn-outline-primary" htmlFor="group">
                        <i className="fas fa-users me-1"></i>
                        Group
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="recipientType"
                        id="all"
                        checked={recipientType === 'all'}
                        onChange={() => setRecipientType('all')}
                      />
                      <label className="btn btn-outline-primary" htmlFor="all">
                        <i className="fas fa-globe me-1"></i>
                        All
                      </label>
                    </div>
                  </div>

                  {/* Recipients Selection */}
                  {recipientType !== 'all' && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Select Recipients</label>
                      <select
                        className="form-select"
                        multiple
                        size={5}
                        value={selectedRecipients}
                        onChange={(e) => setSelectedRecipients(Array.from(e.target.selectedOptions, option => option.value))}
                        required
                      >
                        <optgroup label="Players">
                          {players.map(player => (
                            <option key={player.id} value={player.id}>
                              {player.firstName} {player.lastName} - {player.phone}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Coaches">
                          {coaches.map(coach => (
                            <option key={coach.id} value={coach.id}>
                              {coach.firstName} {coach.lastName} - {coach.phone}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
                    </div>
                  )}

                  {/* Message */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Message</label>
                    <textarea
                      className="form-control"
                      rows={5}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message here..."
                      required
                      maxLength={1600}
                    />
                    <div className="d-flex justify-content-between mt-1">
                      <small className="text-muted">
                        {totalCharacterCount} characters (includes opt-out) | {smsCount} SMS {smsCount > 1 ? 'messages' : 'message'}
                      </small>
                      <small className={totalCharacterCount > 160 ? 'text-warning' : 'text-muted'}>
                        {1600 - totalCharacterCount} remaining
                      </small>
                    </div>
                    <small className="text-info">
                      <i className="fas fa-info-circle me-1"></i>
                      "Reply STOP to opt-out" will be automatically added to all messages
                    </small>
                  </div>

                  {/* Schedule */}
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="scheduleCheckbox"
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="scheduleCheckbox">
                        Schedule for later
                      </label>
                    </div>
                  </div>

                  {isScheduled && (
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required={isScheduled}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          required={isScheduled}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {isScheduled ? 'Scheduling...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${isScheduled ? 'fa-clock' : 'fa-paper-plane'} me-2`}></i>
                        {isScheduled ? 'Schedule SMS' : 'Send SMS Now'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Templates Sidebar */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-file-alt me-2"></i>
                  Quick Templates
                </h6>
              </div>
              <div className="card-body">
                {templates.length === 0 ? (
                  <p className="text-muted text-center">No templates available</p>
                ) : (
                  <div className="list-group">
                    {templates.slice(0, 5).map(template => (
                      <button
                        key={template.id}
                        className="list-group-item list-group-item-action"
                        onClick={() => useTemplate(template)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{template.name}</strong>
                            <p className="mb-0 small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                              {template.message}
                            </p>
                          </div>
                          <i className="fas fa-chevron-right"></i>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="card mt-3">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="fas fa-chart-bar me-2"></i>
                  SMS Stats
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <small className="text-muted">Sent Today</small>
                  <h4>{messages.filter(m => m.status === 'sent' && new Date(m.sentAt || '').toDateString() === new Date().toDateString()).length}</h4>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Scheduled</small>
                  <h4>{messages.filter(m => m.status === 'scheduled').length}</h4>
                </div>
                <div>
                  <small className="text-muted">Total Sent</small>
                  <h4>{messages.filter(m => m.status === 'sent').length}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message History Tab */}
      {activeTab === 'history' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-history me-2"></i>
              Message History
            </h5>
          </div>
          <div className="card-body">
            {messages.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p className="text-muted">No messages sent yet</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(message => (
                      <tr key={message.id}>
                        <td>
                          <strong>{message.recipientName || message.recipient}</strong>
                          <br />
                          <small className="text-muted">{message.recipient}</small>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '300px' }}>
                            {message.message}
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${
                            message.status === 'sent' ? 'success' :
                            message.status === 'failed' ? 'danger' :
                            message.status === 'scheduled' ? 'info' : 'warning'
                          }`}>
                            {message.status}
                          </span>
                        </td>
                        <td>
                          {message.sentAt ? new Date(message.sentAt).toLocaleString() : 
                           message.scheduledFor ? `Scheduled: ${new Date(message.scheduledFor).toLocaleString()}` :
                           new Date(message.createdAt).toLocaleString()}
                        </td>
                        <td>${(message.cost || 0).toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-file-alt me-2"></i>
                SMS Templates
              </h5>
              <button className="btn btn-primary btn-sm">
                <i className="fas fa-plus me-2"></i>
                New Template
              </button>
            </div>
          </div>
          <div className="card-body">
            {templates.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                <p className="text-muted">No templates created yet</p>
              </div>
            ) : (
              <div className="row">
                {templates.map(template => (
                  <div key={template.id} className="col-md-6 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">{template.name}</h6>
                        <p className="card-text text-muted small">{template.message}</p>
                        <div className="d-flex justify-content-between">
                          <span className="badge bg-secondary">{template.category}</span>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => useTemplate(template)}
                          >
                            Use Template
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
    </div>
  );
}
