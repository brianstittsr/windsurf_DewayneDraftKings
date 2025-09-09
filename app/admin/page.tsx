'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import CouponManagement from '../../components/CouponManagement';
import TeamManagement from '../../components/TeamManagement';
import PaymentManagement from '../../components/PaymentManagement';

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
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'sms');

  // Update activeTab when URL parameters change
  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'sms';
    console.log('URL changed, tab parameter:', currentTab);
    setActiveTab(currentTab);
  }, [searchParams]);
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
      <AdminLayout>
        <div className="container my-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const renderTabContent = () => {
    console.log('Rendering tab content for activeTab:', activeTab);
    
    if (activeTab === 'players') {
      return (
        <div>
          <h1 className="h3 mb-4 text-gray-800">Player Management</h1>
          
          <div className="row">
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-primary shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Total Players</div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-users fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-success shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Active Players</div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-user-check fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-warning shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Pending</div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-user-clock fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-info shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Revenue</div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">$0</div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Player Directory</h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered" width="100%" cellSpacing="0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Team</th>
                      <th>Status</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No players registered yet. <a href="/pricing">Start registration process</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    switch (activeTab) {
      
      case 'coaches':
        return (
          <div className="fade-in">
            {/* Page Heading */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Coach Management</h1>
              <button className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-user-plus fa-sm text-white-50"></i> Add New Coach
              </button>
            </div>

            {/* Content Row */}
            <div className="row">
              {/* Total Coaches Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-success shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Total Coaches</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-chalkboard-teacher fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Coaches Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Active Coaches</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-user-check fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Head Coaches Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-warning shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Head Coaches</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-crown fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assistant Coaches Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-info shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Assistant Coaches</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-hands-helping fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coach Directory */}
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Coach Directory</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered" width="100%" cellSpacing="0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Team</th>
                        <th>Experience</th>
                        <th>Contact</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">
                          No coaches registered yet. <a href="/register">Start coach registration</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
      
      case 'coupons':
        return (
          <div className="fade-in">
            <CouponManagement />
          </div>
        );
      
      case 'qr-codes':
        return (
          <div className="fade-in">
            {/* Page Heading */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">QR Code Management</h1>
              <button className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-qrcode fa-sm text-white-50"></i> Generate QR Code
              </button>
            </div>

            {/* Content Row */}
            <div className="row">
              {/* Total QR Codes Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-info shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Total QR Codes</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-qrcode fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Player QR Codes Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Player QR Codes</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-user fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team QR Codes Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-success shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Team QR Codes</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-users fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* League QR Codes Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-warning shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">League QR Codes</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-trophy fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Actions */}
            <div className="row">
              <div className="col-lg-6">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Quick Actions</h6>
                  </div>
                  <div className="card-body">
                    <div className="d-grid gap-2">
                      <button className="btn btn-primary">
                        <i className="fas fa-user-plus me-2"></i>Generate Player QR Code
                      </button>
                      <button className="btn btn-success">
                        <i className="fas fa-users me-2"></i>Generate Team QR Code
                      </button>
                      <button className="btn btn-warning">
                        <i className="fas fa-trophy me-2"></i>Generate League QR Code
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-6">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Recent QR Codes</h6>
                  </div>
                  <div className="card-body">
                    <div className="text-center text-muted py-4">
                      No QR codes generated yet. Use the quick actions to create your first QR code.
                    </div>
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
    <AdminLayout>
      <div className="container-fluid">
        {renderTabContent()}
      </div>
    </AdminLayout>
  );
}
