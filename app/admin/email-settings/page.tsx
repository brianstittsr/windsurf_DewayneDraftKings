'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/AdminLayout';

// Dynamically import the EmailRecipientsManager component
const EmailRecipientsManager = dynamic(() => import('@/components/EmailRecipientsManager'), {
  ssr: false,
  loading: () => <div className="text-center p-4">Loading email recipients manager...</div>
});

export default function EmailSettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/admin/verify');
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error('Error verifying authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You must be logged in as an administrator to access this page.</p>
          <hr />
          <a href="/admin/login" className="btn btn-primary">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid px-4">
        <h1 className="mt-4 mb-4">Email Settings</h1>
        
        <div className="row">
          <div className="col-xl-12">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <i className="fas fa-envelope me-1"></i>
                Registration Email Notifications
              </div>
              <div className="card-body">
                <p className="text-muted mb-4">
                  Configure who receives copies of registration confirmation emails. These recipients will be CC'd on all registration confirmation emails sent to registrants.
                </p>
                
                <EmailRecipientsManager />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
