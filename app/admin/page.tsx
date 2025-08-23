'use client';

import { useState, useEffect } from 'react';

interface DashboardData {
  delivery: {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    failureRate: number;
  };
  engagement: {
    totalReplies: number;
    totalOptOuts: number;
    replyRate: number;
    optOutRate: number;
    activeSubscribers: number;
  };
  conversion: {
    totalClicks: number;
    clickThroughRate: number;
  };
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sms/analytics?type=dashboard&days=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    try {
      const phone = prompt('Enter phone number for test message:');
      if (!phone) return;

      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          message: 'Test message from DraftKings League admin dashboard! 🏈'
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Test message sent successfully!');
      } else {
        alert('Failed to send test message: ' + result.error);
      }
    } catch (err) {
      alert('Error sending test message');
    }
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h2">📱 SMS Management Dashboard</h1>
            <div className="d-flex gap-2">
              <select 
                className="form-select dk-metric-input" 
                style={{ width: 'auto' }}
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <button 
                className="btn dk-btn-secondary"
                onClick={sendTestMessage}
              >
                Send Test SMS
              </button>
            </div>
          </div>
        </div>
      </div>

      {dashboardData && (
        <>
          {/* Delivery Metrics */}
          <div className="row mb-4">
            <div className="col-12">
              <h3 className="h4 mb-3">📊 Delivery Metrics</h3>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card dk-stats-card">
                <div className="card-body">
                  <h5 className="card-title text-primary">Messages Sent</h5>
                  <h2 className="mb-0">{dashboardData.delivery.totalSent.toLocaleString()}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card dk-stats-card">
                <div className="card-body">
                  <h5 className="card-title text-success">Delivered</h5>
                  <h2 className="mb-0">{dashboardData.delivery.totalDelivered.toLocaleString()}</h2>
                  <small className="text-muted">
                    {dashboardData.delivery.deliveryRate.toFixed(1)}% delivery rate
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card dk-stats-card">
                <div className="card-body">
                  <h5 className="card-title text-danger">Failed</h5>
                  <h2 className="mb-0">{dashboardData.delivery.totalFailed.toLocaleString()}</h2>
                  <small className="text-muted">
                    {dashboardData.delivery.failureRate.toFixed(1)}% failure rate
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card dk-stats-card">
                <div className="card-body">
                  <h5 className="card-title text-info">Active Subscribers</h5>
                  <h2 className="mb-0">{dashboardData.engagement.activeSubscribers.toLocaleString()}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="row mb-4">
            <div className="col-12">
              <h3 className="h4 mb-3">💬 Engagement Metrics</h3>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card dk-stats-card">
                <div className="card-body">
                  <h5 className="card-title text-primary">Total Replies</h5>
                  <h2 className="mb-0">{dashboardData.engagement.totalReplies.toLocaleString()}</h2>
                  <small className="text-muted">
                    {dashboardData.engagement.replyRate.toFixed(1)}% reply rate
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card dk-stats-card">
                <div className="card-body">
                  <h5 className="card-title text-warning">Opt-outs</h5>
                  <h2 className="mb-0">{dashboardData.engagement.totalOptOuts.toLocaleString()}</h2>
                  <small className="text-muted">
                    {dashboardData.engagement.optOutRate.toFixed(1)}% opt-out rate
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card dk-stats-card">
                <div className="card-body">
                  <h5 className="card-title text-success">Total Clicks</h5>
                  <h2 className="mb-0">{dashboardData.conversion.totalClicks.toLocaleString()}</h2>
                  <small className="text-muted">
                    {dashboardData.conversion.clickThroughRate.toFixed(1)}% CTR
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row mb-4">
            <div className="col-12">
              <h3 className="h4 mb-3">⚡ Quick Actions</h3>
            </div>
            <div className="col-md-6 mb-3">
              <div className="card dk-card">
                <div className="card-body">
                  <h5 className="card-title">📨 Send Broadcast Message</h5>
                  <p className="card-text">Send a message to all active subscribers</p>
                  <button className="btn dk-btn-primary" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="card dk-card">
                <div className="card-body">
                  <h5 className="card-title">🎯 Create SMS Journey</h5>
                  <p className="card-text">Set up automated message sequences</p>
                  <button className="btn dk-btn-primary" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="row">
            <div className="col-12">
              <div className="card dk-card">
                <div className="card-header">
                  <h5 className="card-title mb-0">📈 Performance Summary</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Delivery Performance</h6>
                      <div className="progress mb-3">
                        <div 
                          className="progress-bar bg-success" 
                          role="progressbar" 
                          style={{ width: `${dashboardData.delivery.deliveryRate}%` }}
                        >
                          {dashboardData.delivery.deliveryRate.toFixed(1)}%
                        </div>
                      </div>
                      
                      <h6>Engagement Rate</h6>
                      <div className="progress mb-3">
                        <div 
                          className="progress-bar bg-info" 
                          role="progressbar" 
                          style={{ width: `${dashboardData.engagement.replyRate}%` }}
                        >
                          {dashboardData.engagement.replyRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6>Click-Through Rate</h6>
                      <div className="progress mb-3">
                        <div 
                          className="progress-bar bg-primary" 
                          role="progressbar" 
                          style={{ width: `${Math.min(dashboardData.conversion.clickThroughRate, 100)}%` }}
                        >
                          {dashboardData.conversion.clickThroughRate.toFixed(1)}%
                        </div>
                      </div>
                      
                      <h6>Retention Rate</h6>
                      <div className="progress mb-3">
                        <div 
                          className="progress-bar bg-warning" 
                          role="progressbar" 
                          style={{ width: `${100 - dashboardData.engagement.optOutRate}%` }}
                        >
                          {(100 - dashboardData.engagement.optOutRate).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <small className="text-muted">
                      Last updated: {new Date().toLocaleString()} | 
                      Showing data for the last {timeRange} days
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
