'use client';

import { useState } from 'react';

interface AdminLoginProps {
  onLoginSuccess: (user: { username: string; role: string }) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-4 col-lg-5 col-md-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="feature-icon bg-primary text-white rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-shield-alt fa-2x"></i>
                  </div>
                  <h3 className="fw-bold text-primary">Admin Login</h3>
                  <p className="text-muted">All Pro Sports NC</p>
                </div>

                {/* Development credentials info */}
                <div className="alert alert-info alert-sm mb-3">
                  <small>
                    <strong>Demo Credentials:</strong><br/>
                    <code>admin@example.com</code> / <code>admin123</code><br/>
                    <code>admin</code> / <code>AllProSports2024!</code>
                  </small>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      <i className="fas fa-user me-2"></i>
                      Username / Email
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="username"
                      value={credentials.username}
                      onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                      required
                      disabled={loading}
                      placeholder="Enter username or email"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      <i className="fas fa-lock me-2"></i>
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={loading}
                      placeholder="Enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading || !credentials.username || !credentials.password}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Authorized personnel only
                  </small>
                </div>
              </div>
            </div>

            <div className="text-center mt-3">
              <small className="text-muted">
                © 2024 All Pro Sports NC. All rights reserved.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
