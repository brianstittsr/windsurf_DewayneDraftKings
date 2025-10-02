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
  webhookUrl: '',
  webhookSecret: ''
};

export default function GoHighLevelIntegration() {
  const [integrations, setIntegrations] = useState<GHLIntegrationType[]>([]);
  const [syncLogs, setSyncLogs] = useState<GoHighLevelSyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedIntegration, setSelectedIntegration] = useState<GHLIntegrationType | null>(null);
  const [formData, setFormData] = useState<IntegrationFormData>(initialFormData);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  useEffect(() => {
    fetchIntegrations();
    fetchSyncLogs();
  }, []);

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

  const fetchSyncLogs = async () => {
    try {
      const response = await fetch('/api/gohighlevel/sync-logs?limit=50');
      if (response.ok) {
        const data = await response.json();
        setSyncLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
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

  const testConnection = async (integration: GoHighLevelIntegration) => {
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

  const syncData = async (integration: GoHighLevelIntegration, syncType: string) => {
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

  const handleEdit = (integration: GoHighLevelIntegration) => {
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

  return (
    <div className="gohighlevel-integration">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">GoHighLevel Integration</h3>
          <p className="text-muted mb-0">Manage GoHighLevel API integrations and data synchronization</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <i className="fas fa-plus me-2"></i>
          Add Integration
        </button>
      </div>

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
                                  {new Date(integration.lastSyncAt).toLocaleString()}
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
                            {new Date(log.startedAt.toDate()).toLocaleString()}
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
    </div>
  );
}
