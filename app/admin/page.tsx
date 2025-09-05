'use client';

import { useState, useEffect } from 'react';
import ModernNavbar from '@/components/ModernNavbar';
import ProfileManagement from '@/components/ProfileManagement';
import PaymentManagement from '@/components/PaymentManagement';
import TeamManagement from '@/components/TeamManagement';

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
    totalClicks: number;
    activeSubscribers: number;
    replyRate: number;
    clickRate: number;
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('sms');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    delivery: {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      deliveryRate: 0,
      failureRate: 0,
    },
    engagement: {
      totalReplies: 0,
      totalClicks: 0,
      activeSubscribers: 0,
      replyRate: 0,
      clickRate: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sms/analytics?days=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    try {
      const response = await fetch('/api/sms/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test message from All Pro Sports admin dashboard! 🏈'
        })
      });
      
      if (response.ok) {
        alert('Test SMS sent successfully!');
      }
    } catch (error) {
      console.error('Error sending test SMS:', error);
      alert('Failed to send test SMS');
    }
  };

  if (loading) {
    return (
      <>
        <ModernNavbar />
        <div className="container my-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'players':
        return (
          <div className="fade-in">
            <ProfileManagement type="player" />
          </div>
        );
      
      case 'coaches':
        return (
          <div className="fade-in">
            <ProfileManagement type="coach" />
          </div>
        );
      
      case 'teams':
        return (
          <div className="fade-in">
            <TeamManagement />
          </div>
        );
      
      case 'payments':
        return (
          <div className="fade-in">
            <PaymentManagement />
          </div>
        );
      
      case 'qr-codes':
        return (
          <div className="fade-in">
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3>📱 QR Code Management</h3>
                  <a href="/admin/qr-codes" className="btn btn-primary">
                    <i className="fas fa-qrcode me-2"></i>
                    Manage QR Codes
                  </a>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <div className="dk-card text-center">
                  <div className="card-body">
                    <h5 className="text-primary">Player QR Codes</h5>
                    <h2 className="mb-0">0</h2>
                    <small className="text-muted">Individual player codes</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="dk-card text-center">
                  <div className="card-body">
                    <h5 className="text-success">Team QR Codes</h5>
                    <h2 className="mb-0">0</h2>
                    <small className="text-muted">Team roster codes</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="dk-card text-center">
                  <div className="card-body">
                    <h5 className="text-info">League QR Code</h5>
                    <h2 className="mb-0">1</h2>
                    <small className="text-muted">Main league code</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="dk-card">
              <div className="card-header">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <button className="btn btn-outline-primary w-100">
                      <i className="fas fa-download me-2"></i>
                      Download All Player QR Codes
                    </button>
                  </div>
                  <div className="col-md-6 mb-3">
                    <button className="btn btn-outline-success w-100">
                      <i className="fas fa-qrcode me-2"></i>
                      Generate League QR Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'sms':
      default:
        return (
          <div className="fade-in">
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3>📱 SMS Management</h3>
                  <div className="d-flex gap-2">
                    <select 
                      className="form-select" 
                      style={{ width: 'auto' }}
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                    </select>
                    <button 
                      className="btn btn-primary"
                      onClick={sendTestMessage}
                    >
                      Send Test SMS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Metrics */}
            <div className="row mb-4">
              <div className="col-12">
                <h4 className="mb-3">📊 Delivery Metrics</h4>
              </div>
              <div className="col-md-3 mb-3">
                <div className="dk-card text-center">
                  <div className="card-body">
                    <h5 className="text-primary">Messages Sent</h5>
                    <h2 className="mb-0">{dashboardData?.delivery?.totalSent?.toLocaleString() || '0'}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="dk-card text-center">
                  <div className="card-body">
                    <h5 className="text-success">Delivered</h5>
                    <h2 className="mb-0">{dashboardData?.delivery?.totalDelivered?.toLocaleString() || '0'}</h2>
                    <small className="text-muted">
                      {dashboardData?.delivery?.deliveryRate?.toFixed(1) || '0.0'}% delivery rate
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="dk-card text-center">
                  <div className="card-body">
                    <h5 className="text-danger">Failed</h5>
                    <h2 className="mb-0">{dashboardData?.delivery?.totalFailed?.toLocaleString() || '0'}</h2>
                    <small className="text-muted">
                      {dashboardData?.delivery?.failureRate?.toFixed(1) || '0.0'}% failure rate
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="dk-card text-center">
                  <div className="card-body">
                    <h5 className="text-primary">Active Subscribers</h5>
                    <h2 className="mb-0">{dashboardData?.engagement?.activeSubscribers?.toLocaleString() || '0'}</h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="row mb-4">
              <div className="col-12">
                <h4 className="mb-3">💬 Engagement Metrics</h4>
              </div>
              <div className="col-md-4 mb-3">
                <div className="dk-card text-center">
                  <div className="card-body">
                    <h5 className="text-primary">Total Replies</h5>
                    <h2 className="mb-0">{dashboardData?.engagement?.totalReplies?.toLocaleString() || '0'}</h2>
                    <small className="text-muted">
                      {dashboardData?.engagement?.replyRate?.toFixed(1) || '0.0'}% reply rate
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="dk-card text-center">
                  <div className="card-body">
                    <h5 className="text-success">Total Clicks</h5>
                    <h2 className="mb-0">{dashboardData?.engagement?.totalClicks?.toLocaleString() || '0'}</h2>
                    <small className="text-muted">
                      {dashboardData?.engagement?.clickRate?.toFixed(1) || '0.0'}% click rate
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="dk-card text-center">
                  <div className="card-body">
                    <h5 className="text-info">Engagement Score</h5>
                    <h2 className="mb-0">
                      {(((dashboardData?.engagement?.replyRate || 0) + (dashboardData?.engagement?.clickRate || 0)) / 2).toFixed(1)}%
                    </h2>
                    <small className="text-muted">Combined engagement</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <ModernNavbar />
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 mb-0">Admin Dashboard</h1>
              <div className="text-muted">
                <i className="fas fa-shield-alt me-2"></i>
                Administrator Panel
              </div>
            </div>

            {/* Tab Navigation */}
            <ul className="nav nav-pills mb-4" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'sms' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sms')}
                  type="button"
                >
                  <i className="fas fa-sms me-2"></i>
                  SMS
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'players' ? 'active' : ''}`}
                  onClick={() => setActiveTab('players')}
                  type="button"
                >
                  <i className="fas fa-users me-2"></i>
                  Players
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'coaches' ? 'active' : ''}`}
                  onClick={() => setActiveTab('coaches')}
                  type="button"
                >
                  <i className="fas fa-chalkboard-teacher me-2"></i>
                  Coaches
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'teams' ? 'active' : ''}`}
                  onClick={() => setActiveTab('teams')}
                  type="button"
                >
                  <i className="fas fa-users-cog me-2"></i>
                  Teams
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('payments')}
                  type="button"
                >
                  <i className="fas fa-credit-card me-2"></i>
                  Payments
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'qr-codes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('qr-codes')}
                  type="button"
                >
                  <i className="fas fa-qrcode me-2"></i>
                  QR Codes
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
