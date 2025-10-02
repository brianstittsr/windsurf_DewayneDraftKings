'use client';

import React, { useState } from 'react';

export default function AIWorkflowBuilder() {
  const [description, setDescription] = useState('');
  const [workflowType, setWorkflowType] = useState('mixed');
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const templates = [
    { value: 'welcome', label: 'Welcome Series', description: '3-email welcome sequence for new contacts' },
    { value: 'abandoned_cart', label: 'Abandoned Cart', description: 'Recovery sequence with 3 reminders' },
    { value: 'event_reminder', label: 'Event Reminder', description: 'Confirmations and follow-ups' },
    { value: 'lead_nurture', label: 'Lead Nurture', description: '7-day educational sequence' },
    { value: 'onboarding', label: 'Customer Onboarding', description: 'Setup instructions for new customers' },
    { value: 're_engagement', label: 'Re-engagement', description: 'Win back inactive contacts' }
  ];

  const examples = [
    "Create a 5-email welcome series for new sports league registrations. Start with a thank you, then send training tips, team information, schedule details, and a final check-in.",
    "Build an SMS reminder sequence for upcoming games. Send reminders 24 hours before, 2 hours before, and a post-game follow-up.",
    "Create a lead nurturing workflow for potential players. Send information about our programs, success stories, and special offers over 10 days.",
    "Generate an abandoned registration recovery sequence with 3 emails over 3 days encouraging completion."
  ];

  const handleGenerate = async () => {
    if (!description && !template) {
      alert('Please enter a description or select a template');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ghl/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: template ? '' : description,
          type: workflowType,
          template: template || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedWorkflow(data.workflow);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInGHL = async () => {
    if (!generatedWorkflow) return;

    setCreating(true);
    try {
      const response = await fetch('/api/ghl/create-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: generatedWorkflow })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Workflow created successfully! ID: ${data.workflowId}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create workflow in GoHighLevel');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="ai-workflow-builder">
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="fas fa-robot me-2"></i>
            AI Workflow Builder
          </h5>
        </div>
        <div className="card-body">
          <p className="text-muted">
            Describe your workflow in plain language, and AI will generate a complete email/SMS sequence for GoHighLevel.
          </p>

          {/* Template Selection */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Quick Start Templates</label>
            <div className="row g-2">
              {templates.map(t => (
                <div key={t.value} className="col-md-4">
                  <div
                    className={`card h-100 ${template === t.value ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setTemplate(template === t.value ? '' : t.value);
                      setDescription('');
                    }}
                  >
                    <div className="card-body p-3">
                      <h6 className="card-title mb-1">{t.label}</h6>
                      <small className="text-muted">{t.description}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Description */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Or Describe Your Workflow</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Example: Create a 3-email welcome series for new sports league members. Include a welcome message, training tips, and schedule information with 2 days between each email."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setTemplate('');
              }}
              disabled={!!template}
            />
          </div>

          {/* Workflow Type */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Workflow Type</label>
            <select
              className="form-select"
              value={workflowType}
              onChange={(e) => setWorkflowType(e.target.value)}
            >
              <option value="mixed">Mixed (Email & SMS)</option>
              <option value="email">Email Only</option>
              <option value="sms">SMS Only</option>
              <option value="nurture">Lead Nurture</option>
            </select>
          </div>

          {/* Examples */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Examples:</label>
            <div className="list-group">
              {examples.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  className="list-group-item list-group-item-action text-start"
                  onClick={() => {
                    setDescription(example);
                    setTemplate('');
                  }}
                >
                  <small>{example}</small>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            className="btn btn-primary btn-lg w-100"
            onClick={handleGenerate}
            disabled={loading || (!description && !template)}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Generating Workflow...
              </>
            ) : (
              <>
                <i className="fas fa-magic me-2"></i>
                Generate Workflow with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Workflow Preview */}
      {generatedWorkflow && (
        <div className="card">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              <i className="fas fa-check-circle me-2"></i>
              Generated Workflow
            </h5>
          </div>
          <div className="card-body">
            <h6 className="fw-bold">{generatedWorkflow.name}</h6>
            <p className="text-muted">{generatedWorkflow.description}</p>

            <div className="alert alert-info">
              <strong>Trigger:</strong> {generatedWorkflow.trigger.type.replace('_', ' ')}
            </div>

            <h6 className="fw-semibold mt-4 mb-3">Workflow Steps:</h6>
            {generatedWorkflow.steps.map((step: any, index: number) => (
              <div key={index} className="card mb-3">
                <div className="card-header">
                  <strong>Step {index + 1}:</strong> {step.type.toUpperCase()}
                  {step.delay > 0 && (
                    <span className="badge bg-warning ms-2">
                      Wait {step.delay} hours
                    </span>
                  )}
                </div>
                <div className="card-body">
                  {step.subject && (
                    <p><strong>Subject:</strong> {step.subject}</p>
                  )}
                  <p><strong>Content:</strong></p>
                  <pre className="bg-light p-3 rounded">{step.content}</pre>
                  {step.tags && step.tags.length > 0 && (
                    <p>
                      <strong>Tags:</strong>{' '}
                      {step.tags.map((tag: string) => (
                        <span key={tag} className="badge bg-secondary me-1">{tag}</span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="d-grid gap-2">
              <button
                className="btn btn-success btn-lg"
                onClick={handleCreateInGHL}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating in GoHighLevel...
                  </>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt me-2"></i>
                    Create in GoHighLevel
                  </>
                )}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setGeneratedWorkflow(null)}
              >
                Generate New Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
