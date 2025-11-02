'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import AdminAuthWrapper, { useAdminAuth } from '@/components/AdminAuthWrapper';
import PlayerDashboard from '@/components/dashboards/PlayerDashboard';
import CoachDashboard from '@/components/dashboards/CoachDashboard';
import UserProfileSearch from '@/components/UserProfileSearch';
import AdminUserManagement from '@/components/AdminUserManagement';
import TeamManagement from '@/components/TeamManagement';
import LeagueManagement from '@/components/LeagueManagement';
import ScheduleManagement from '@/components/ScheduleManagement';
import PaymentManagement from '@/components/PaymentManagement';
import CouponManagement from '@/components/CouponManagement';
import PricingManagement from '@/components/PricingManagement';
import MealPlanManagement from '@/components/MealPlanManagement';
import ProfileManagement from '@/components/ProfileManagement';
import ProductManagement from '@/components/ProductManagement';
import GoHighLevelIntegration from '@/components/GoHighLevelIntegration';
import WorkflowBuilder from '@/components/WorkflowBuilder';
import FacebookLinksManagement from '@/components/FacebookLinksManagement';
import SeasonManagement from '@/components/SeasonManagement';
import SeasonConfigManagement from '@/components/SeasonConfigManagement';
import PlayerTransferManagement from '@/components/PlayerTransferManagement';
import PlayerSwapManagement from '@/components/PlayerSwapManagement';
import CommissionerManagement from '@/components/CommissionerManagement';
import SMSManagement from '@/components/SMSManagement';
import NotificationManagement from '@/components/NotificationManagement';
import TournamentManagement from '@/components/TournamentManagement';
import APIKeysManagement from '@/components/APIKeysManagement';
import DraftManagement from '@/components/draft/DraftManagement';
import dynamic from 'next/dynamic';

// Dynamically import the EmailRecipientsManager component
const EmailRecipientsManager = dynamic(() => import('@/components/EmailRecipientsManager'), {
  ssr: false,
  loading: () => <div className="text-center p-4">Loading email recipients manager...</div>
});

// Dashboard with live stats
function StatsOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePlayers: 0,
    totalTeams: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    activeLeagues: 0,
    totalCoaches: 0,
    upcomingGames: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
                <div className="h5 mb-0 font-weight-bold text-gray-800">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </div>
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
                <div className="h5 mb-0 font-weight-bold text-gray-800">
                  {loading ? '...' : stats.activePlayers.toLocaleString()}
                </div>
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
                <div className="h5 mb-0 font-weight-bold text-gray-800">
                  {loading ? '...' : stats.totalTeams.toLocaleString()}
                </div>
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
                  Total Revenue
                </div>
                <div className="h5 mb-0 font-weight-bold text-gray-800">
                  {loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}
                </div>
              </div>
              <div className="col-auto">
                <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Second Row */}
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card border-left-danger shadow h-100 py-2">
          <div className="card-body">
            <div className="row no-gutters align-items-center">
              <div className="col mr-2">
                <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                  Pending Payments
                </div>
                <div className="h5 mb-0 font-weight-bold text-gray-800">
                  {loading ? '...' : stats.pendingPayments.toLocaleString()}
                </div>
              </div>
              <div className="col-auto">
                <i className="fas fa-credit-card fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card border-left-secondary shadow h-100 py-2">
          <div className="card-body">
            <div className="row no-gutters align-items-center">
              <div className="col mr-2">
                <div className="text-xs font-weight-bold text-secondary text-uppercase mb-1">
                  Active Leagues
                </div>
                <div className="h5 mb-0 font-weight-bold text-gray-800">
                  {loading ? '...' : stats.activeLeagues.toLocaleString()}
                </div>
              </div>
              <div className="col-auto">
                <i className="fas fa-trophy fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card border-left-dark shadow h-100 py-2">
          <div className="card-body">
            <div className="row no-gutters align-items-center">
              <div className="col mr-2">
                <div className="text-xs font-weight-bold text-dark text-uppercase mb-1">
                  Total Coaches
                </div>
                <div className="h5 mb-0 font-weight-bold text-gray-800">
                  {loading ? '...' : stats.totalCoaches.toLocaleString()}
                </div>
              </div>
              <div className="col-auto">
                <i className="fas fa-chalkboard-teacher fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card border-left-primary shadow h-100 py-2">
          <div className="card-body">
            <div className="row no-gutters align-items-center">
              <div className="col mr-2">
                <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                  Upcoming Games
                </div>
                <div className="h5 mb-0 font-weight-bold text-gray-800">
                  {loading ? '...' : stats.upcomingGames.toLocaleString()}
                </div>
              </div>
              <div className="col-auto">
                <i className="fas fa-calendar-alt fa-2x text-gray-300"></i>
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

function CallToAction({ onTabChange }: { onTabChange: (tab: string) => void }) {
  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Quick Actions</h6>
      </div>
      <div className="card-body">
        <div className="d-grid gap-2">
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onTabChange('user-profiles')}
          >
            <i className="fas fa-user-plus mr-2"></i>
            Add New Player
          </button>
          <button 
            className="btn btn-success btn-sm"
            onClick={() => onTabChange('teams')}
          >
            <i className="fas fa-users mr-2"></i>
            Create Team
          </button>
          <button 
            className="btn btn-info btn-sm"
            onClick={() => onTabChange('games')}
          >
            <i className="fas fa-calendar mr-2"></i>
            Schedule Game
          </button>
          <button 
            className="btn btn-warning btn-sm"
            onClick={() => onTabChange('qr-codes')}
          >
            <i className="fas fa-qrcode mr-2"></i>
            Generate QR Code
          </button>
        </div>
      </div>
    </div>
  );
}


function AdminPageContent() {
  const { user } = useAdminAuth();
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
        if (user?.role === 'coach') {
          return <CoachDashboard />;
        }
        if (user?.role === 'player') {
          return <PlayerDashboard />;
        }
        // Default to admin dashboard
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Admin Dashboard</h1>
            </div>
            <StatsOverview />
            <div className="row mt-4">
              <div className="col-lg-8 mb-4">
                <RecentActivity />
              </div>
              <div className="col-lg-4 mb-4">
                <CallToAction onTabChange={setActiveTab} />
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
            <ScheduleManagement />
          </div>
        );

      case 'leagues':
        return (
          <div className="fade-in">
            <LeagueManagement />
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
              <h1 className="h3 mb-0 text-gray-800">Pricing Plans</h1>
            </div>
            <PricingManagement />
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
            <SeasonManagement />
          </div>
        );

      case 'sms':
        return (
          <div className="fade-in">
            <SMSManagement />
          </div>
        );

      case 'notifications':
        return (
          <div className="fade-in">
            <NotificationManagement />
          </div>
        );

      case 'emails':
        return (
          <div className="fade-in">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Email Management</h1>
              <button className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-plus fa-sm text-white-50"></i> Create Template
              </button>
            </div>
            
            {/* Email Templates */}
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Email Template Management</h6>
              </div>
              <div className="card-body">
                <div className="text-center py-4">
                  <i className="fas fa-envelope fa-3x text-muted mb-3"></i>
                  <h4 className="text-muted">Email Template System</h4>
                  <p className="text-muted">Create and manage email templates for automated communications.</p>
                  <button className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>
                    Create Email Template
                  </button>
                </div>
              </div>
            </div>
            
            {/* Email Recipients */}
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Registration Email Recipients</h6>
              </div>
              <div className="card-body">
                <p className="text-muted mb-4">
                  Configure who receives copies of registration confirmation emails. These recipients will be CC'd on all registration confirmation emails sent to registrants.
                </p>
                <EmailRecipientsManager />
              </div>
            </div>
          </div>
        );

      case 'gohighlevel':
        return (
          <div className="fade-in">
            <GoHighLevelIntegration />
          </div>
        );

      case 'practice-plans':
        return (
          <div className="fade-in">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Practice Plans</h6>
              </div>
              <div className="card-body">
                <p>Create and manage practice plans for coaches.</p>
                <p className="text-muted">Coming soon...</p>
              </div>
            </div>
          </div>
        );

      case 'playbooks':
        return (
          <div className="fade-in">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Playbooks</h6>
              </div>
              <div className="card-body">
                <p>Digital playbook management for coaches.</p>
                <p className="text-muted">Coming soon...</p>
              </div>
            </div>
          </div>
        );

      case 'drills':
        return (
          <div className="fade-in">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Drills Library</h6>
              </div>
              <div className="card-body">
                <p>Browse and manage coaching drills and exercises.</p>
                <p className="text-muted">Coming soon...</p>
              </div>
            </div>
          </div>
        );

      case 'coach-resources':
        return (
          <div className="fade-in">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Coach Resources</h6>
              </div>
              <div className="card-body">
                <p>Training materials, guides, and resources for coaches.</p>
                <p className="text-muted">Coming soon...</p>
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="fade-in">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Attendance Tracking</h6>
              </div>
              <div className="card-body">
                <p>Track player attendance for practices and games.</p>
                <p className="text-muted">Coming soon...</p>
              </div>
            </div>
          </div>
        );

      case 'player-evaluations':
        return (
          <div className="fade-in">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Player Evaluations</h6>
              </div>
              <div className="card-body">
                <p>Evaluate and rate player performance.</p>
                <p className="text-muted">Coming soon...</p>
              </div>
            </div>
          </div>
        );

      case 'workflows':
        return (
          <div className="fade-in">
            <WorkflowBuilder />
          </div>
        );

      case 'api-keys':
        return (
          <div className="fade-in">
            <APIKeysManagement />
          </div>
        );

      case 'facebook-links':
        return (
          <div className="fade-in">
            <FacebookLinksManagement />
          </div>
        );

      case 'season-config':
        return (
          <div className="fade-in">
            <SeasonConfigManagement />
          </div>
        );

      case 'player-transfers':
        return (
          <div className="fade-in">
            <PlayerTransferManagement />
          </div>
        );

      case 'player-swaps':
        return (
          <div className="fade-in">
            <PlayerSwapManagement />
          </div>
        );

      case 'draft-management':
        return (
          <div className="fade-in">
            <DraftManagement />
          </div>
        );

      case 'commissioners':
        return (
          <div className="fade-in">
            <CommissionerManagement />
          </div>
        );

      case 'tournaments':
        return (
          <div className="fade-in">
            <TournamentManagement />
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
                <CallToAction onTabChange={setActiveTab} />
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
