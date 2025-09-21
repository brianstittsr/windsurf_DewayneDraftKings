'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { StatsOverview } from '../../components/StatsOverview';
import { RecentActivity } from '../../components/RecentActivity';
import { CallToAction } from '../../components/CallToAction';
import ProfileManagement from '../../components/ProfileManagement';
import TeamManagement from '../../components/TeamManagement';
import PaymentManagement from '../../components/PaymentManagement';
import CouponManagement from '../../components/CouponManagement';
import PricingManagement from '../../components/PricingManagement';
import MealPlanManagement from '../../components/MealPlanManagement';

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
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">User Profile Management</h1>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card shadow mb-4">
                  <div className="card-body">
                    {/* UserProfileSearch component would go here */}
                    <p className="text-muted">User profile search and management interface will be displayed here.</p>
                  </div>
                </div>
              </div>
            </div>
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
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card shadow mb-4">
                  <div className="card-body">
                    <p className="text-muted">QR code generation and management interface will be displayed here.</p>
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
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}
