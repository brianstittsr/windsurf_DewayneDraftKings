'use client';

import { useState, useEffect } from 'react';
import type { GoHighLevelIntegration as GHLIntegrationType, GoHighLevelSyncLog } from '../lib/firestore-schema';

interface IntegrationFormData {
  name: string;
  description: string;
  apiToken: string;
  locationId: string;
  agencyId: string;
  isActive: boolean;
  syncContacts: boolean;
  syncOpportunities: boolean;
  syncCalendars: boolean;
  syncPipelines: boolean;
  syncCampaigns: boolean;
  defaultPipelineId: string;
  defaultStageId: string;
  enableWebhooks: boolean;
  webhookUrl: string;
  webhookSecret: string;
}

const initialFormData: IntegrationFormData = {
  name: '',
  description: '',
  apiToken: '',
  locationId: '',
  agencyId: '',
  isActive: true,
  syncContacts: true,
  syncOpportunities: true,
  syncCalendars: false,
  syncPipelines: false,
  syncCampaigns: false,
  defaultPipelineId: '',
  defaultStageId: '',
  enableWebhooks: false,
  webhookUrl: '',
  webhookSecret: ''
};

export default function GoHighLevelIntegration() {
  const [activeTab, setActiveTab] = useState<'integrations' | 'import' | 'conversations'>('integrations');
  const [integrations, setIntegrations] = useState<GHLIntegrationType[]>([]);
  const [syncLogs, setSyncLogs] = useState<GoHighLevelSyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedIntegration, setSelectedIntegration] = useState<GHLIntegrationType | null>(null);
  const [formData, setFormData] = useState<IntegrationFormData>(initialFormData);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  
  // Import workflows state
  const [importedWorkflows, setImportedWorkflows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, status: '' });
  const [converting, setConverting] = useState<string | null>(null);
  const [convertProgress, setConvertProgress] = useState({ current: 0, total: 0, status: '' });
  const [convertedWorkflows, setConvertedWorkflows] = useState<Map<string, string>>(new Map());
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const fetchSyncLogs = async () => {
    try {
      const response = await fetch('/api/gohighlevel/sync-logs');
      if (response.ok) {
        const data = await response.json();
        setSyncLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
  };

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gohighlevel/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    if (!integrations.length) return;
    
    try {
      setLoadingConversations(true);
      const response = await fetch('/api/gohighlevel/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/gohighlevel/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const response = await fetch(`/api/gohighlevel/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          type: 'text'
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Refresh messages
        await fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleConversationSelect = async (conversation: any) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = modalMode === 'create' ? '/api/gohighlevel/integrations' : `/api/gohighlevel/integrations/${selectedIntegration?.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchIntegrations();
        setShowModal(false);
        setFormData(initialFormData);
        alert(`Integration ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving integration:', error);
      alert('Error saving integration');
    }
  };
  
  const testConnection = async (integration: GHLIntegrationType) => {
    setTestingConnection(true);
    try {
      const response = await fetch(`/api/gohighlevel/test-connection/${integration.id}`, {
        method: 'POST'
      });
      
      const result = await response.json();
      if (response.ok) {
        alert(`Connection successful! Location: ${result.locationName}`);
      } else {
        alert(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      alert('Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const syncData = async (integration: GHLIntegrationType, syncType: string) => {
    setSyncing(integration.id);
    try {
      const response = await fetch(`/api/gohighlevel/sync/${integration.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType })
      });

      if (response.ok) {
        alert(`${syncType} sync started successfully!`);
        await fetchSyncLogs();
      } else {
        const error = await response.json();
        alert(`Sync failed: ${error.error}`);
      }
    } catch (error) {
      alert('Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const handleCreate = () => {
    setSelectedIntegration(null);
    setFormData(initialFormData);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (integration: GHLIntegrationType) => {
    setSelectedIntegration(integration);
    setFormData({
      name: integration.name,
      description: integration.description || '',
      apiToken: integration.apiToken,
      locationId: integration.locationId,
      agencyId: integration.agencyId || '',
      isActive: integration.isActive,
      syncContacts: integration.syncContacts,
      syncOpportunities: integration.syncOpportunities,
      syncCalendars: integration.syncCalendars,
      syncPipelines: integration.syncPipelines,
      syncCampaigns: integration.syncCampaigns,
      defaultPipelineId: integration.defaultPipelineId || '',
      defaultStageId: integration.defaultStageId || '',
      enableWebhooks: integration.enableWebhooks,
      webhookUrl: integration.webhookUrl || '',
      webhookSecret: integration.webhookSecret || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleImportWorkflows = async () => {
    setImporting(true);
    setImportProgress({ current: 0, total: 3, status: 'Connecting to GoHighLevel...' });
    
    try {
      // Step 1: Fetch workflows from GHL
      setImportProgress({ current: 1, total: 3, status: 'Fetching workflows from GoHighLevel...' });
      const response = await fetch('/api/ghl/import-workflows');
      const data = await response.json();

      if (data.success) {
        // Check if we actually got workflows or just an empty response
        if (data.count === 0) {
          setImportProgress({ current: 0, total: 0, status: '' });
          alert(`⚠️ No workflows imported\n\n${data.message || 'No workflows found in your GoHighLevel account.'}\n\nPlease check:\n1. GoHighLevel API credentials are configured\n2. You have workflows in your GHL account\n3. API key has proper permissions`);
        } else {
          // Step 2: Storing workflows
          setImportProgress({ current: 2, total: 3, status: `Storing ${data.count} workflows in database...` });
          await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UI feedback
          
          // Step 3: Complete
          setImportProgress({ current: 3, total: 3, status: 'Import complete!' });
          setImportedWorkflows(data.workflows);
          
          setTimeout(() => {
            alert(`✅ Successfully imported ${data.count} workflows from GoHighLevel!`);
            setImportProgress({ current: 0, total: 0, status: '' });
          }, 500);
        }
      } else {
        setImportProgress({ current: 0, total: 0, status: '' });
        alert(`❌ Error: ${data.error || 'Failed to import workflows'}`);
      }
    } catch (error) {
      console.error('Error importing workflows:', error);
      setImportProgress({ current: 0, total: 0, status: '' });
      alert('Failed to import workflows');
    } finally {
      setTimeout(() => setImporting(false), 1000);
    }
  };

  const handleConvertWorkflow = async (workflow: any) => {
    setConverting(workflow.id);
    setConvertProgress({ current: 0, total: 3, status: 'Preparing workflow data...' });
    
    try {
      // Step 1: Analyzing workflow
      setConvertProgress({ current: 1, total: 3, status: 'Analyzing workflow structure...' });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 2: Converting with AI
      setConvertProgress({ current: 2, total: 3, status: 'Converting to plain language with AI...' });
      const response = await fetch('/api/ghl/convert-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow })
      });

      const data = await response.json();

      if (data.success) {
        // Step 3: Saving prompt
        setConvertProgress({ current: 3, total: 3, status: 'Saving plain language prompt...' });
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setConvertedWorkflows(new Map(convertedWorkflows.set(workflow.id, data.plainLanguagePrompt)));
        setConvertProgress({ current: 0, total: 0, status: '' });
        alert('Workflow converted to plain language successfully!');
      } else {
        setConvertProgress({ current: 0, total: 0, status: '' });
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error converting workflow:', error);
      setConvertProgress({ current: 0, total: 0, status: '' });
      alert('Failed to convert workflow');
    } finally {
      setConverting(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="gohighlevel-integration">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">GoHighLevel Integration</h3>
          <p className="text-muted mb-0">Manage GoHighLevel API integrations and data synchronization</p>
        </div>
        {activeTab === 'integrations' && (
          <button className="btn btn-primary" onClick={handleCreate}>
            <i className="fas fa-plus me-2"></i>
            Add Integration
          </button>
        )}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            <i className="fas fa-plug me-2"></i>
            Integrations
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'conversations' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('conversations');
              fetchConversations();
            }}
          >
            <i className="fas fa-comments me-2"></i>
            Conversations
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <i className="fas fa-download me-2"></i>
            Import Workflows
          </button>
        </li>
      </ul>

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <>
      {/* Integrations List */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Active Integrations</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : integrations.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-plug fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No integrations configured</h5>
                  <p className="text-muted">Add your first GoHighLevel integration to get started.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Location ID</th>
                        <th>Status</th>
                        <th>Last Sync</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {integrations.map((integration) => (
                        <tr key={integration.id}>
                          <td>
                            <div>
                              <div className="fw-bold">{integration.name}</div>
                              {integration.description && (
                                <small className="text-muted">{integration.description}</small>
                              )}
                            </div>
                          </td>
                          <td>
                            <code className="small">{integration.locationId}</code>
                          </td>
                          <td>
                            <span className={`badge ${integration.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {integration.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            {integration.lastSyncAt ? (
                              <div>
                                <div className="small">
                                  {(() => {
                                    const timestamp = integration.lastSyncAt;
                                    if (timestamp?.toDate) {
                                      return timestamp.toDate().toLocaleString();
                                    }
                                    return new Date(timestamp as any).toLocaleString();
                                  })()}
                                </div>
                                <span className={`badge badge-sm ${
                                  integration.lastSyncStatus === 'success' ? 'bg-success' :
                                  integration.lastSyncStatus === 'error' ? 'bg-danger' : 'bg-warning'
                                }`}>
                                  {integration.lastSyncStatus}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted">Never</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => testConnection(integration)}
                                disabled={testingConnection}
                                title="Test Connection"
                              >
                                <i className="fas fa-plug"></i>
                              </button>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-success dropdown-toggle"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  disabled={syncing === integration.id}
                                  title="Sync Data"
                                >
                                  <i className="fas fa-sync"></i>
                                </button>
                                <ul className="dropdown-menu">
                                  <li><button className="dropdown-item" onClick={() => syncData(integration, 'contacts')}>Sync Contacts</button></li>
                                  <li><button className="dropdown-item" onClick={() => syncData(integration, 'opportunities')}>Sync Opportunities</button></li>
                                  <li><button className="dropdown-item" onClick={() => syncData(integration, 'full')}>Full Sync</button></li>
                                </ul>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleEdit(integration)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
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
        </div>

        {/* Sync Logs */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Sync Activity</h5>
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {syncLogs.length === 0 ? (
                <p className="text-muted text-center">No sync activity yet</p>
              ) : (
                <div className="timeline">
                  {syncLogs.map((log) => (
                    <div key={log.id} className="timeline-item mb-3">
                      <div className="d-flex align-items-start">
                        <div className={`badge me-2 ${
                          log.status === 'completed' ? 'bg-success' :
                          log.status === 'failed' ? 'bg-danger' : 'bg-warning'
                        }`}>
                          <i className={`fas ${
                            log.status === 'completed' ? 'fa-check' :
                            log.status === 'failed' ? 'fa-times' : 'fa-clock'
                          }`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold small">{log.syncType} sync</div>
                          <div className="text-muted small">
                            {(() => {
                              const timestamp = log.startedAt;
                              if (timestamp?.toDate) {
                                return timestamp.toDate().toLocaleString();
                              }
                              return new Date(timestamp as any).toLocaleString();
                            })()}
                          </div>
                          {log.status === 'completed' && log.summary && (
                            <div className="small text-success">
                              {log.summary.contactsCreated || 0} created, {log.summary.contactsUpdated || 0} updated
                            </div>
                          )}
                          {log.status === 'failed' && log.errors.length > 0 && (
                            <div className="small text-danger">
                              {log.errors[0].error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'create' ? 'Add GoHighLevel Integration' : 'Edit Integration'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Integration Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">API Token *</label>
                        <input
                          type="password"
                          className="form-control"
                          value={formData.apiToken}
                          onChange={(e) => setFormData(prev => ({ ...prev, apiToken: e.target.value }))}
                          required
                        />
                        <div className="form-text">Your GoHighLevel API token</div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Location ID *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.locationId}
                          onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Agency ID</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.agencyId}
                          onChange={(e) => setFormData(prev => ({ ...prev, agencyId: e.target.value }))}
                        />
                      </div>
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          />
                          <label className="form-check-label">Active Integration</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h6 className="mt-4 mb-3">Sync Settings</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.syncContacts}
                          onChange={(e) => setFormData(prev => ({ ...prev, syncContacts: e.target.checked }))}
                        />
                        <label className="form-check-label">Sync Contacts</label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.syncOpportunities}
                          onChange={(e) => setFormData(prev => ({ ...prev, syncOpportunities: e.target.checked }))}
                        />
                        <label className="form-check-label">Sync Opportunities</label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.syncCalendars}
                          onChange={(e) => setFormData(prev => ({ ...prev, syncCalendars: e.target.checked }))}
                        />
                        <label className="form-check-label">Sync Calendars</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.syncPipelines}
                          onChange={(e) => setFormData(prev => ({ ...prev, syncPipelines: e.target.checked }))}
                        />
                        <label className="form-check-label">Sync Pipelines</label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.syncCampaigns}
                          onChange={(e) => setFormData(prev => ({ ...prev, syncCampaigns: e.target.checked }))}
                        />
                        <label className="form-check-label">Sync Campaigns</label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.enableWebhooks}
                          onChange={(e) => setFormData(prev => ({ ...prev, enableWebhooks: e.target.checked }))}
                        />
                        <label className="form-check-label">Enable Webhooks</label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                  {modalMode === 'create' ? 'Create Integration' : 'Update Integration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="row">
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-comments me-2"></i>
                  Conversations
                </h5>
              </div>
              <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {loadingConversations ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading conversations...</span>
                    </div>
                    <p className="mt-2">Loading conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No conversations found</p>
                    <p className="text-muted small">Conversations will appear here once available</p>
                  </div>
                ) : (
                  <div className="conversation-list">
                    {conversations.map((conversation: any) => (
                      <div
                        key={conversation.id}
                        className={`conversation-item p-3 border-bottom cursor-pointer ${
                          selectedConversation?.id === conversation.id ? 'bg-light' : ''
                        }`}
                        onClick={() => handleConversationSelect(conversation)}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="fw-bold text-truncate">
                              {conversation.contactName || conversation.contact?.name || 'Unknown Contact'}
                            </div>
                            <div className="text-muted small text-truncate">
                              {conversation.lastMessage || 'No messages yet'}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="text-muted small">
                              {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleDateString() : ''}
                            </div>
                            {conversation.unreadCount > 0 && (
                              <span className="badge bg-danger rounded-pill mt-1">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            {selectedConversation ? (
              <div className="card">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-comment me-2"></i>
                    {selectedConversation.contactName || selectedConversation.contact?.name || 'Chat'}
                  </h5>
                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={() => fetchMessages(selectedConversation.id)}
                  >
                    <i className="fas fa-sync me-1"></i>
                    Refresh
                  </button>
                </div>
                <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {messages.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-comments fa-2x text-muted mb-3"></i>
                      <p className="text-muted">No messages in this conversation</p>
                    </div>
                  ) : (
                    <div className="message-list">
                      {messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`message-item d-flex mb-3 ${
                            message.direction === 'outbound' ? 'justify-content-end' : 'justify-content-start'
                          }`}
                        >
                          <div
                            className={`message-bubble p-3 rounded ${
                              message.direction === 'outbound'
                                ? 'bg-primary text-white'
                                : 'bg-light border'
                            }`}
                            style={{ maxWidth: '70%' }}
                          >
                            <div className="message-content">
                              {message.body || message.content}
                            </div>
                            <div className={`small mt-1 ${
                              message.direction === 'outbound' ? 'text-white-50' : 'text-muted'
                            }`}>
                              {message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <div className="input-group">
                    <textarea
                      className="form-control"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      rows={2}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      {sendingMessage ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <i className="fas fa-paper-plane"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="fas fa-comments fa-4x text-muted mb-3"></i>
                  <h4>Select a Conversation</h4>
                  <p className="text-muted">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Workflows Tab */}
      {activeTab === 'import' && (
        <div className="card">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">
              <i className="fas fa-download me-2"></i>
              Import Existing Workflows from GoHighLevel
            </h5>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              <h6 className="alert-heading">
                <i className="fas fa-info-circle me-2"></i>
                How This Works
              </h6>
              <ol className="mb-0">
                <li>Click "Import Workflows" to fetch all workflows from your GoHighLevel account</li>
                <li>Review the list of imported workflows</li>
                <li>Click "Convert to Plain Language" on any workflow</li>
                <li>AI will generate a plain language prompt describing the workflow</li>
                <li>Copy the prompt and use it in the AI Workflow Builder to recreate or modify the workflow</li>
              </ol>
            </div>

            <div className="mb-4">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleImportWorkflows}
                disabled={importing}
              >
                {importing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Importing Workflows...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download me-2"></i>
                    Import Workflows from GoHighLevel
                  </>
                )}
              </button>
              
              {/* Import Progress Bar */}
              {importing && importProgress.total > 0 && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <small className="text-muted">{importProgress.status}</small>
                    <small className="text-muted">{importProgress.current} / {importProgress.total}</small>
                  </div>
                  <div className="progress" style={{ height: '25px' }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                      role="progressbar"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                      aria-valuenow={importProgress.current}
                      aria-valuemin={0}
                      aria-valuemax={importProgress.total}
                    >
                      {Math.round((importProgress.current / importProgress.total) * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            {importedWorkflows.length > 0 && (
              <div>
                <h6 className="fw-bold mb-3">
                  Imported Workflows ({importedWorkflows.length})
                </h6>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Workflow Name</th>
                        <th>ID</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importedWorkflows.map((workflow) => (
                        <tr key={workflow.id}>
                          <td className="fw-bold">{workflow.name}</td>
                          <td>
                            <code className="small">{workflow.id}</code>
                          </td>
                          <td>
                            <span className={`badge ${
                              workflow.status === 'active' ? 'bg-success' : 'bg-secondary'
                            }`}>
                              {workflow.status || 'unknown'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleConvertWorkflow(workflow)}
                              disabled={converting === workflow.id}
                            >
                              {converting === workflow.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                  Converting...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-magic me-1"></i>
                                  Convert to Plain Language
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Convert Progress Bar */}
                {converting && convertProgress.total > 0 && (
                  <div className="alert alert-info mt-3">
                    <div className="d-flex justify-content-between mb-2">
                      <small className="fw-bold">{convertProgress.status}</small>
                      <small>{convertProgress.current} / {convertProgress.total}</small>
                    </div>
                    <div className="progress" style={{ height: '20px' }}>
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                        role="progressbar"
                        style={{ width: `${(convertProgress.current / convertProgress.total) * 100}%` }}
                        aria-valuenow={convertProgress.current}
                        aria-valuemin={0}
                        aria-valuemax={convertProgress.total}
                      >
                        {Math.round((convertProgress.current / convertProgress.total) * 100)}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Converted Workflows */}
                {Array.from(convertedWorkflows.entries()).map(([workflowId, prompt]) => {
                  const workflow = importedWorkflows.find(w => w.id === workflowId);
                  return (
                    <div key={workflowId} className="card mt-3 border-success">
                      <div className="card-header bg-success text-white">
                        <h6 className="mb-0">
                          <i className="fas fa-check-circle me-2"></i>
                          Plain Language Prompt: {workflow?.name}
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Generated Prompt:</label>
                          <textarea
                            className="form-control"
                            rows={8}
                            value={prompt}
                            readOnly
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary"
                            onClick={() => copyToClipboard(prompt)}
                          >
                            <i className="fas fa-copy me-2"></i>
                            Copy to Clipboard
                          </button>
                          <a
                            href="/admin?tab=workflows"
                            className="btn btn-success"
                          >
                            <i className="fas fa-robot me-2"></i>
                            Use in AI Workflow Builder
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {importedWorkflows.length === 0 && !importing && (
              <div className="text-center text-muted py-5">
                <i className="fas fa-inbox fa-3x mb-3"></i>
                <p>No workflows imported yet. Click the button above to import workflows from GoHighLevel.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
