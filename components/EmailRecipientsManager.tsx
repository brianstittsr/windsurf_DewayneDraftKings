'use client';

import { useState, useEffect } from 'react';
import { EmailRecipient } from '@/lib/email-config';

export default function EmailRecipientsManager() {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch recipients on component mount
  useEffect(() => {
    fetchRecipients();
  }, []);

  // Fetch all email recipients
  const fetchRecipients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email/recipients');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recipients: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setRecipients(data.recipients);
      } else {
        setError(data.error || 'Failed to fetch recipients');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error fetching recipients');
      console.error('Error fetching recipients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new email recipient
  const addRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail) {
      setError('Email is required');
      return;
    }
    
    setAddingEmail(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email/recipients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail,
          name: newName || undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add recipient: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage('Email recipient added successfully');
        setNewEmail('');
        setNewName('');
        fetchRecipients();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(data.error || 'Failed to add recipient');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error adding recipient');
      console.error('Error adding recipient:', err);
    } finally {
      setAddingEmail(false);
    }
  };

  // Remove an email recipient
  const removeRecipient = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the recipients list?`)) {
      return;
    }
    
    setError(null);
    
    try {
      const response = await fetch('/api/email/recipients', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to remove recipient: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage('Email recipient removed successfully');
        fetchRecipients();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(data.error || 'Failed to remove recipient');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error removing recipient');
      console.error('Error removing recipient:', err);
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-primary bg-gradient text-white">
        <h5 className="mb-0">
          <i className="fas fa-envelope me-2"></i>
          Registration Email Recipients
        </h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-4">
          These email addresses will receive a copy of all registration confirmation emails.
        </p>
        
        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {successMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccessMessage(null)}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        {/* Add New Recipient Form */}
        <form onSubmit={addRecipient} className="mb-4">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="form-floating">
                <input
                  type="email"
                  className="form-control"
                  id="newEmail"
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
                <label htmlFor="newEmail">Email Address</label>
              </div>
            </div>
            <div className="col-md-5">
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="newName"
                  placeholder="John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <label htmlFor="newName">Name (Optional)</label>
              </div>
            </div>
            <div className="col-md-2 d-flex align-items-center">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={addingEmail || !newEmail}
              >
                {addingEmail ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    Add
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        
        {/* Recipients List */}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Added</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : recipients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <div className="text-muted">
                      <i className="fas fa-inbox fa-2x mb-3"></i>
                      <p>No email recipients found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recipients.map((recipient, index) => (
                  <tr key={index}>
                    <td>{recipient.email}</td>
                    <td>{recipient.name || '-'}</td>
                    <td>
                      {recipient.addedAt instanceof Date
                        ? recipient.addedAt.toLocaleDateString()
                        : new Date(recipient.addedAt).toLocaleDateString()}
                    </td>
                    <td>
                      {recipient.active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeRecipient(recipient.email)}
                        title="Remove recipient"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
