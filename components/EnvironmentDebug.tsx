'use client';

import { useEffect, useState } from 'react';

interface EnvStatus {
  environment: string;
  isVercel: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  firebaseProjectId: string;
  firebaseApiKey: string;
  timestamp: string;
}

export default function EnvironmentDebug() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/debug/env')
      .then(res => res.json())
      .then(data => {
        setEnvStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch env status:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="alert alert-info">
        <i className="fas fa-spinner fa-spin me-2"></i>
        Checking environment variables...
      </div>
    );
  }

  if (!envStatus) {
    return (
      <div className="alert alert-danger">
        Failed to check environment variables
      </div>
    );
  }

  return (
    <div className="alert alert-info">
      <h6 className="alert-heading">
        <i className="fas fa-cog me-2"></i>
        Environment Debug Info
      </h6>
      <div className="row">
        <div className="col-md-6">
          <strong>Environment:</strong> {envStatus.environment}<br/>
          <strong>Vercel:</strong> {envStatus.isVercel ? 'Yes' : 'No'}<br/>
          <strong>Firebase Project:</strong> {envStatus.firebaseProjectId}<br/>
        </div>
        <div className="col-md-6">
          <strong>Stripe Publishable:</strong> {envStatus.stripePublishableKey}<br/>
          <strong>Stripe Secret:</strong> {envStatus.stripeSecretKey}<br/>
          <strong>Firebase API:</strong> {envStatus.firebaseApiKey}<br/>
        </div>
      </div>
      <small className="text-muted">Checked at: {envStatus.timestamp}</small>
    </div>
  );
}
