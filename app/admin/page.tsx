'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import UserProfileSearch from '@/components/UserProfileSearch';
import PaymentManagement from '@/components/PaymentManagement';
import CouponManagement from '@/components/CouponManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get tab from URL params using Next.js searchParams
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-profiles':
        return (
          <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">User Profile Management</h1>
            </div>
            <UserProfileSearch />
          </div>
        );
      
      case 'payments':
        return (
          <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Payment Management</h1>
            </div>
            <PaymentManagement />
          </div>
        );
      
      case 'coupons':
        return (
          <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Coupon Management</h1>
            </div>
            <CouponManagement />
          </div>
        );
      
      case 'players':
        return (
          <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Player Management</h1>
            </div>
            <div className="card shadow mb-4">
              <div className="card-body">
                <p>Player management functionality coming soon...</p>
              </div>
            </div>
          </div>
        );
      
      case 'coaches':
        return (
          <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Coach Management</h1>
            </div>
            <div className="card shadow mb-4">
              <div className="card-body">
                <p>Coach management functionality coming soon...</p>
              </div>
            </div>
          </div>
        );
      
      case 'teams':
        return (
          <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Team Management</h1>
            </div>
            <div className="card shadow mb-4">
              <div className="card-body">
                <p>Team management functionality coming soon...</p>
              </div>
            </div>
          </div>
        );
      
      case 'games':
        return (
          <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Game Management</h1>
            </div>
            <div className="card shadow mb-4">
              <div className="card-body">
                <p>Game management functionality coming soon...</p>
              </div>
            </div>
          </div>
        );
      
      case 'qr-codes':
        return (
          <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">QR Code Management</h1>
            </div>
            <div className="card shadow mb-4">
              <div className="card-body">
                <p>QR code management functionality coming soon...</p>
              </div>
            </div>
          </div>
        );
      
      case 'sms':
        return (
          <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">SMS Management</h1>
            </div>
            <div className="card shadow mb-4">
              <div className="card-body">
                <p>SMS management functionality coming soon...</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div>
            {/* Page Heading */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
            </div>

            {/* Content Row */}
            <div className="row">
              {/* User Profiles Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                          User Profiles
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">--</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-id-card fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payments Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-success shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                          Total Payments
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">--</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-credit-card fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Players Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-info shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                          Active Players
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">--</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-users fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coaches Card */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-warning shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                          Active Coaches
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">--</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-user-tie fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="row">
              <div className="col-lg-12 mb-4">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Quick Actions</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <button
                          onClick={() => setActiveTab('user-profiles')}
                          className="btn btn-primary btn-block"
                        >
                          <i className="fas fa-id-card mr-2"></i>
                          Manage Profiles
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button
                          onClick={() => setActiveTab('payments')}
                          className="btn btn-success btn-block"
                        >
                          <i className="fas fa-credit-card mr-2"></i>
                          View Payments
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button
                          onClick={() => setActiveTab('coupons')}
                          className="btn btn-info btn-block"
                        >
                          <i className="fas fa-tags mr-2"></i>
                          Manage Coupons
                        </button>
                      </div>
                      <div className="col-md-3 mb-3">
                        <button
                          onClick={() => setActiveTab('players')}
                          className="btn btn-warning btn-block"
                        >
                          <i className="fas fa-users mr-2"></i>
                          View Players
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="row">
              <div className="col-lg-12">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Recent Activity</h6>
                  </div>
                  <div className="card-body">
                    <p className="text-muted">Recent activity will be displayed here...</p>
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
      {renderTabContent()}
    </AdminLayout>
  );
}
