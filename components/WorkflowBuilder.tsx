'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SavedWorkflow {
  id: string;
  name: string;
  description: string;
  workflow: any;
  status: 'draft' | 'deployed' | 'archived';
  ghlWorkflowId?: string;
  createdAt: string;
  deployedAt?: string;
}

export default function WorkflowBuilder() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [workflowReady, setWorkflowReady] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [deploying, setDeploying] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/ghl/workflows');
      const data = await response.json();
      if (data.success) {
        setSavedWorkflows(data.workflows);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage: Message = { role: 'user', content: userMessage };
    setConversation(prev => [...prev, newMessage]);
    setUserMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/ghl/workflow-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversation
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: data.message 
        };
        setConversation(prev => [...prev, assistantMessage]);

        if (data.workflowReady && data.workflow) {
          setWorkflowReady(true);
          setGeneratedWorkflow(data.workflow);
          setWorkflowName(data.workflow.name || '');
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    if (!generatedWorkflow) {
      alert('No workflow to save');
      return;
    }

    try {
      const response = await fetch('/api/ghl/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflowName,
          description: generatedWorkflow.description,
          workflow: generatedWorkflow
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Workflow saved successfully!');
        await fetchWorkflows();
        resetConversation();
        setActiveTab('list');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save workflow');
    }
  };

  const deployWorkflow = async (workflowId: string, workflow: any) => {
    setDeploying(workflowId);
    try {
      const response = await fetch('/api/ghl/create-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: workflow.workflow })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Workflow deployed to GoHighLevel! ID: ${data.workflowId}`);
        await fetchWorkflows();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to deploy workflow');
    } finally {
      setDeploying(null);
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const response = await fetch(`/api/ghl/workflows?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Workflow deleted successfully');
        await fetchWorkflows();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete workflow');
    }
  };

  const resetConversation = () => {
    setConversation([]);
    setWorkflowReady(false);
    setGeneratedWorkflow(null);
    setWorkflowName('');
  };

  const quickStarters = [
    "I want to create a welcome email series for new sports league members",
    "Help me build an SMS reminder sequence for upcoming games",
    "I need a lead nurturing workflow for potential players",
    "Create an abandoned registration recovery sequence"
  ];

  return (
    <div className="workflow-builder">
      {/* Header */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <i className="fas fa-robot me-2"></i>
            AI Workflow Builder for GoHighLevel
          </h4>
        </div>
        <div className="card-body">
          <p className="mb-0">
            Use plain language to create professional email and SMS workflows. 
            The AI will ask questions to understand your needs and generate a complete workflow.
          </p>
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
            Create Workflow
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <i className="fas fa-list me-2"></i>
            My Workflows ({savedWorkflows.length})
          </button>
        </li>
      </ul>

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="row">
          <div className="col-lg-8">
            {/* Instructions */}
            {conversation.length === 0 && (
              <div className="card mb-4 border-info">
                <div className="card-header bg-info bg-opacity-10">
                  <h6 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    How to Create a Workflow
                  </h6>
                </div>
                <div className="card-body">
                  <ol className="mb-0">
                    <li className="mb-2">
                      <strong>Describe what you want:</strong> Tell the AI about your workflow in plain language
                    </li>
                    <li className="mb-2">
                      <strong>Answer questions:</strong> The AI will ask clarifying questions to understand your needs
                    </li>
                    <li className="mb-2">
                      <strong>Review the workflow:</strong> Once ready, you'll see a complete workflow with all steps
                    </li>
                    <li className="mb-2">
                      <strong>Name and save:</strong> Give your workflow a name and save it
                    </li>
                    <li className="mb-0">
                      <strong>Deploy to GoHighLevel:</strong> Click deploy to activate it in your GHL account
                    </li>
                  </ol>

                  <div className="mt-3">
                    <strong>Quick Starters:</strong>
                    <div className="d-grid gap-2 mt-2">
                      {quickStarters.map((starter, index) => (
                        <button
                          key={index}
                          className="btn btn-outline-primary btn-sm text-start"
                          onClick={() => setUserMessage(starter)}
                        >
                          <i className="fas fa-lightbulb me-2"></i>
                          {starter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Interface */}
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-comments me-2"></i>
                  Conversation with AI
                  {conversation.length > 0 && (
                    <button
                      className="btn btn-sm btn-outline-secondary float-end"
                      onClick={resetConversation}
                    >
                      <i className="fas fa-redo me-1"></i>
                      Start Over
                    </button>
                  )}
                </h6>
              </div>
              <div className="card-body" style={{ minHeight: '400px', maxHeight: '600px', overflowY: 'auto' }}>
                {conversation.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="fas fa-robot fa-3x mb-3"></i>
                    <p>Start a conversation by describing your workflow below</p>
                  </div>
                ) : (
                  <div>
                    {conversation.map((msg, index) => (
                      <div
                        key={index}
                        className={`mb-3 ${msg.role === 'user' ? 'text-end' : ''}`}
                      >
                        <div
                          className={`d-inline-block p-3 rounded ${
                            msg.role === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-light'
                          }`}
                          style={{ maxWidth: '80%' }}
                        >
                          <div className="small fw-bold mb-1">
                            {msg.role === 'user' ? (
                              <><i className="fas fa-user me-1"></i>You</>
                            ) : (
                              <><i className="fas fa-robot me-1"></i>AI Assistant</>
                            )}
                          </div>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>
              <div className="card-footer">
                <div className="input-group">
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Describe your workflow or answer the AI's questions..."
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={sendMessage}
                    disabled={loading || !userMessage.trim()}
                  >
                    <i className="fas fa-paper-plane me-2"></i>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Preview */}
          <div className="col-lg-4">
            {workflowReady && generatedWorkflow && (
              <div className="card border-success">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-check-circle me-2"></i>
                    Workflow Ready!
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Workflow Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="e.g., Welcome Series 2024"
                    />
                  </div>

                  <div className="mb-3">
                    <strong>Description:</strong>
                    <p className="text-muted small mb-0">{generatedWorkflow.description}</p>
                  </div>

                  <div className="mb-3">
                    <strong>Trigger:</strong>
                    <span className="badge bg-info ms-2">
                      {generatedWorkflow.trigger.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mb-3">
                    <strong>Steps:</strong> {generatedWorkflow.steps.length}
                    <div className="mt-2">
                      {generatedWorkflow.steps.map((step: any, index: number) => (
                        <div key={index} className="small mb-1">
                          <i className={`fas ${
                            step.type === 'email' ? 'fa-envelope' :
                            step.type === 'sms' ? 'fa-sms' :
                            step.type === 'wait' ? 'fa-clock' : 'fa-tag'
                          } me-2`}></i>
                          {step.type.toUpperCase()}
                          {step.delay > 0 && ` (${step.delay}h delay)`}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-success"
                      onClick={saveWorkflow}
                    >
                      <i className="fas fa-save me-2"></i>
                      Save Workflow
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={resetConversation}
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-list me-2"></i>
              Saved Workflows
            </h6>
          </div>
          <div className="card-body">
            {savedWorkflows.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="fas fa-inbox fa-3x mb-3"></i>
                <p>No workflows created yet</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('create')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Create Your First Workflow
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Steps</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedWorkflows.map(workflow => (
                      <tr key={workflow.id}>
                        <td className="fw-bold">{workflow.name}</td>
                        <td className="text-muted small">{workflow.description}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {workflow.workflow.steps?.length || 0} steps
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            workflow.status === 'deployed' ? 'bg-success' :
                            workflow.status === 'draft' ? 'bg-warning' : 'bg-secondary'
                          }`}>
                            {workflow.status}
                          </span>
                        </td>
                        <td className="small">
                          {new Date(workflow.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            {workflow.status === 'draft' && (
                              <button
                                className="btn btn-success"
                                onClick={() => deployWorkflow(workflow.id, workflow)}
                                disabled={deploying === workflow.id}
                                title="Deploy to GoHighLevel"
                              >
                                {deploying === workflow.id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <i className="fas fa-cloud-upload-alt"></i>
                                )}
                              </button>
                            )}
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => deleteWorkflow(workflow.id)}
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
      )}
    </div>
  );
}
