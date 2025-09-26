'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';
import UserProfileSearch from '@/components/UserProfileSearch';
import AdminUserManagement from '@/components/AdminUserManagement';
import TeamManagement from '@/components/TeamManagement';
import PaymentManagement from '@/components/PaymentManagement';
import CouponManagement from '@/components/CouponManagement';
import PricingManagement from '@/components/PricingManagement';
import MealPlanManagement from '@/components/MealPlanManagement';
import ProfileManagement from '@/components/ProfileManagement';

// Simple dashboard components
function StatsOverview() {
  return (
    <div className="row">
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card border-left-primary shadow h-100 py-2">
          <div className="card-body">
            <div className="row no-gutters align-items-center">
              <div className="col mr-2">
                <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                  Total Users
                </div>
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
                <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                  Active Players
                </div>
                <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
              </div>
              <div className="col-auto">
                <i className="fas fa-user-friends fa-2x text-gray-300"></i>
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
                <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                  Total Teams
                </div>
                <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
              </div>
              <div className="col-auto">
                <i className="fas fa-futbol fa-2x text-gray-300"></i>
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
                <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                  Pending Payments
                </div>
                <div className="h5 mb-0 font-weight-bold text-gray-800">0</div>
              </div>
              <div className="col-auto">
                <i className="fas fa-credit-card fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Recent Activity</h6>
      </div>
      <div className="card-body">
        <div className="text-center">
          <p className="text-muted">No recent activity to display</p>
          <small className="text-muted">Activity will appear here as users interact with the system</small>
        </div>
      </div>
    </div>
  );
}

function CallToAction() {
  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Quick Actions</h6>
      </div>
      <div className="card-body">
        <div className="d-grid gap-2">
          <button className="btn btn-primary btn-sm">
            <i className="fas fa-user-plus mr-2"></i>
            Add New Player
          </button>
          <button className="btn btn-success btn-sm">
            <i className="fas fa-users mr-2"></i>
            Create Team
          </button>
          <button className="btn btn-info btn-sm">
            <i className="fas fa-calendar mr-2"></i>
            Schedule Game
          </button>
          <button className="btn btn-warning btn-sm">
            <i className="fas fa-qrcode mr-2"></i>
            Generate QR Code
          </button>
        </div>
      </div>
    </div>
  );
}


function AdminPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
            </div>

            {/* Stats Overview */}
            <StatsOverview />

            {/* Content Row */}
            <div className="row mt-4">
              {/* Recent Activity */}
              <div className="col-lg-8 mb-4">
                <RecentActivity />
              </div>

              {/* Call to Action */}
              <div className="col-lg-4 mb-4">
                <CallToAction />
              </div>
            </div>
          </div>
        );

      case 'user-profiles':
        return (
          <div className="fade-in">
            <AdminUserManagement />
          </div>
        );

      case 'players':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Player Management</h1>
            </div>
            <ProfileManagement type="player" />
          </div>
        );

      case 'coaches':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Coach Management</h1>
            </div>
            <ProfileManagement type="coach" />
          </div>
        );

      case 'teams':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Team Management</h1>
            </div>
            <TeamManagement />
          </div>
        );

      case 'games':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Game Management</h1>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card shadow mb-4">
                  <div className="card-body">
                    <p className="text-muted">Game scheduling and management interface will be displayed here.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Payment Management</h1>
            </div>
            <PaymentManagement />
          </div>
        );

      case 'coupons':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Coupon Management</h1>
            </div>
            <CouponManagement />
          </div>
        );

      case 'pricing':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Pricing Management</h1>
            </div>
            <PricingManagement />
          </div>
        );

      case 'meal-plans':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Meal Plan Management</h1>
            </div>
            <MealPlanManagement />
          </div>
        );

      case 'qr-codes':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">QR Code Management</h1>
              <button className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-plus fa-sm text-white-50"></i> Generate QR Code
              </button>
            </div>
            <div className="row">
              <div className="col-xl-8 col-lg-7">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">QR Code Library</h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered" width="100%" cellSpacing="0">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Created</th>
                            <th>Scans</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Player Profile</td>
                            <td>John Doe Profile</td>
                            <td>2024-01-15</td>
                            <td>23</td>
                            <td>
                              <button className="btn btn-sm btn-primary mr-2">View</button>
                              <button className="btn btn-sm btn-danger">Delete</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-lg-5">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Quick Actions</h6>
                  </div>
                  <div className="card-body">
                    <div className="d-grid gap-2">
                      <button className="btn btn-outline-primary">Generate Player QR</button>
                      <button className="btn btn-outline-success">Generate Team QR</button>
                      <button className="btn btn-outline-info">Generate Event QR</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Analytics Dashboard</h1>
              <button className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-download fa-sm text-white-50"></i> Generate Report
              </button>
            </div>
            <div className="row">
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                          Total Revenue (Monthly)
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">$40,000</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
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
                        <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                          Active Players
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">215</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-users fa-2x text-gray-300"></i>
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
                        <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                          Games Played
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">156</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-futbol fa-2x text-gray-300"></i>
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
                        <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                          Pending Payments
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">18</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-exclamation-triangle fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'seasons':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Season Management</h1>
              <button className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-plus fa-sm text-white-50"></i> Create Season
              </button>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Seasons</h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered" width="100%" cellSpacing="0">
                        <thead>
                          <tr>
                            <th>Season</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Teams</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Fall 2024</td>
                            <td>2024-09-01</td>
                            <td>2024-12-15</td>
                            <td>12</td>
                            <td><span className="badge badge-success">Active</span></td>
                            <td>
                              <button className="btn btn-sm btn-primary mr-2">Edit</button>
                              <button className="btn btn-sm btn-info mr-2">View</button>
                              <button className="btn btn-sm btn-danger">Archive</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
            </div>
            <StatsOverview />
            <div className="row mt-4">
              <div className="col-lg-8 mb-4">
                <RecentActivity />
              </div>
              <div className="col-lg-4 mb-4">
                <CallToAction />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      {renderTabContent()}
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <AdminAuthWrapper>
      <Suspense fallback={
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }>
        <AdminPageContent />
      </Suspense>
    </AdminAuthWrapper>
  );
}
