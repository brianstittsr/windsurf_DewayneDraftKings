'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import '../app/admin/admin.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarToggled, setSidebarToggled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const isActive = (tab: string) => {
    if (tab === '/admin') {
      return pathname === '/admin' && !searchParams.get('tab');
    }
    return pathname === '/admin' && searchParams.get('tab') === tab;
  };

  const toggleSidebar = () => {
    setSidebarToggled(!sidebarToggled);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isSectionExpanded = (sectionId: string) => {
    return expandedSections.includes(sectionId);
  };

  const isSectionActive = (tabs: string[]) => {
    return tabs.some(tab => isActive(tab));
  };

  useEffect(() => {
    // Add admin-layout class to body
    if (typeof document !== 'undefined') {
      document.body.classList.add('admin-layout');
    }

    return () => {
      // Remove admin-layout class when component unmounts
      if (typeof document !== 'undefined') {
        document.body.classList.remove('admin-layout');
      }
    };
  }, []);

  // Auto-expand sections based on current active tab
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab) {
      // Auto-expand relevant sections
      if (['user-profiles', 'players', 'coaches'].includes(currentTab)) {
        setExpandedSections(prev => prev.includes('users') ? prev : [...prev, 'users']);
      }
      if (['payments', 'pricing', 'coupons', 'analytics'].includes(currentTab)) {
        setExpandedSections(prev => prev.includes('finance') ? prev : [...prev, 'finance']);
      }
      if (['teams', 'leagues', 'seasons', 'games'].includes(currentTab)) {
        setExpandedSections(prev => prev.includes('league') ? prev : [...prev, 'league']);
      }
      if (['meal-plans', 'qr-codes'].includes(currentTab)) {
        setExpandedSections(prev => prev.includes('content') ? prev : [...prev, 'content']);
      }
      if (['sms', 'notifications', 'emails', 'gohighlevel'].includes(currentTab)) {
        setExpandedSections(prev => prev.includes('comms') ? prev : [...prev, 'comms']);
      }
    }
  }, [searchParams]);

  return (
    <>
      <div id="wrapper">
        {/* Sidebar */}
        <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${sidebarToggled ? 'toggled' : ''}`} id="accordionSidebar">
          {/* Sidebar Brand */}
          <Link href="/admin" className="sidebar-brand d-flex align-items-center justify-content-center">
            <div className="sidebar-brand-icon rotate-n-15">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="sidebar-brand-text mx-3">All Pro <sup>Sports</sup></div>
          </Link>

          {/* Divider */}
          <hr className="sidebar-divider my-0" />

          {/* Nav Item - Dashboard */}
          <li className="nav-item">
            <Link href="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>

          {/* Divider */}
          <hr className="sidebar-divider" />

          {/* Heading */}
          <div className="sidebar-heading">
            User Management
          </div>

          {/* Nav Item - User Management */}
          <li className="nav-item">
            <button 
              className={`nav-link w-100 text-left border-0 bg-transparent ${isSectionActive(['user-profiles', 'players', 'coaches']) ? 'active' : ''}`}
              onClick={() => toggleSection('users')}
              aria-expanded={isSectionExpanded('users')}
            >
              <i className="fas fa-fw fa-users"></i>
              <span>User Management</span>
              <i className={`fas fa-chevron-${isSectionExpanded('users') ? 'up' : 'down'} float-right mt-1`}></i>
            </button>
            <div className={`collapse ${isSectionExpanded('users') ? 'show' : ''}`}>
              <div className="py-2 collapse-inner rounded">
                <h6 className="collapse-header">User Profiles:</h6>
                <Link className={`collapse-item ${isActive('user-profiles') ? 'active' : ''}`} href="/admin?tab=user-profiles">
                  <i className="fas fa-users fa-sm fa-fw mr-2 text-gray-400"></i>
                  All Users
                </Link>
                <Link className={`collapse-item ${isActive('players') ? 'active' : ''}`} href="/admin?tab=players">
                  <i className="fas fa-running fa-sm fa-fw mr-2 text-gray-400"></i>
                  Players
                </Link>
                <Link className={`collapse-item ${isActive('coaches') ? 'active' : ''}`} href="/admin?tab=coaches">
                  <i className="fas fa-whistle fa-sm fa-fw mr-2 text-gray-400"></i>
                  Coaches
                </Link>
              </div>
            </div>
          </li>
          {/* Divider */}
          <hr className="sidebar-divider" />

          {/* Heading */}
          <div className="sidebar-heading">
            Business Operations
          </div>

          {/* Nav Item - Financial Management */}
          <li className="nav-item">
            <button 
              className={`nav-link w-100 text-left border-0 bg-transparent ${isSectionActive(['payments', 'pricing', 'coupons', 'analytics']) ? 'active' : ''}`}
              onClick={() => toggleSection('finance')}
              aria-expanded={isSectionExpanded('finance')}
            >
              <i className="fas fa-fw fa-dollar-sign"></i>
              <span>Financial Management</span>
              <i className={`fas fa-chevron-${isSectionExpanded('finance') ? 'up' : 'down'} float-right mt-1`}></i>
            </button>
            <div className={`collapse ${isSectionExpanded('finance') ? 'show' : ''}`}>
              <div className="py-2 collapse-inner rounded">
                <h6 className="collapse-header">Revenue & Pricing:</h6>
                <Link className={`collapse-item ${isActive('payments') ? 'active' : ''}`} href="/admin?tab=payments">
                  <i className="fas fa-credit-card fa-sm fa-fw mr-2 text-gray-400"></i>
                  Payments
                </Link>
                <Link className={`collapse-item ${isActive('pricing') ? 'active' : ''}`} href="/admin?tab=pricing">
                  <i className="fas fa-tags fa-sm fa-fw mr-2 text-gray-400"></i>
                  Pricing Plans
                </Link>
                <Link className={`collapse-item ${isActive('coupons') ? 'active' : ''}`} href="/admin?tab=coupons">
                  <i className="fas fa-percentage fa-sm fa-fw mr-2 text-gray-400"></i>
                  Coupons & Discounts
                </Link>
                <div className="dropdown-divider"></div>
                <h6 className="collapse-header">Analytics:</h6>
                <Link className={`collapse-item ${isActive('analytics') ? 'active' : ''}`} href="/admin?tab=analytics">
                  <i className="fas fa-chart-area fa-sm fa-fw mr-2 text-gray-400"></i>
                  Analytics & Reports
                </Link>
              </div>
            </div>
          </li>

          {/* Divider */}
          <hr className="sidebar-divider" />

          {/* Heading */}
          <div className="sidebar-heading">
            League Operations
          </div>

          {/* Nav Item - League Management */}
          <li className="nav-item">
            <button 
              className={`nav-link w-100 text-left border-0 bg-transparent ${isSectionActive(['teams', 'leagues', 'seasons', 'games']) ? 'active' : ''}`}
              onClick={() => toggleSection('league')}
              aria-expanded={isSectionExpanded('league')}
            >
              <i className="fas fa-fw fa-futbol"></i>
              <span>League Management</span>
              <i className={`fas fa-chevron-${isSectionExpanded('league') ? 'up' : 'down'} float-right mt-1`}></i>
            </button>
            <div className={`collapse ${isSectionExpanded('league') ? 'show' : ''}`}>
              <div className="py-2 collapse-inner rounded">
                <h6 className="collapse-header">Organization:</h6>
                <Link className={`collapse-item ${isActive('leagues') ? 'active' : ''}`} href="/admin?tab=leagues">
                  <i className="fas fa-trophy fa-sm fa-fw mr-2 text-gray-400"></i>
                  Leagues
                </Link>
                <Link className={`collapse-item ${isActive('seasons') ? 'active' : ''}`} href="/admin?tab=seasons">
                  <i className="fas fa-calendar-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                  Seasons
                </Link>
                <Link className={`collapse-item ${isActive('season-config') ? 'active' : ''}`} href="/admin?tab=season-config">
                  <i className="fas fa-cog fa-sm fa-fw mr-2 text-gray-400"></i>
                  Season Configuration
                </Link>
                <Link className={`collapse-item ${isActive('teams') ? 'active' : ''}`} href="/admin?tab=teams">
                  <i className="fas fa-users fa-sm fa-fw mr-2 text-gray-400"></i>
                  Teams
                </Link>
                <div className="dropdown-divider"></div>
                <h6 className="collapse-header">Scheduling:</h6>
                <Link className={`collapse-item ${isActive('games') ? 'active' : ''}`} href="/admin?tab=games">
                  <i className="fas fa-calendar fa-sm fa-fw mr-2 text-gray-400"></i>
                  Games & Schedules
                </Link>
              </div>
            </div>
          </li>

          {/* Nav Item - Content Management */}
          <li className="nav-item">
            <button 
              className={`nav-link w-100 text-left border-0 bg-transparent ${isSectionActive(['meal-plans', 'qr-codes']) ? 'active' : ''}`}
              onClick={() => toggleSection('content')}
              aria-expanded={isSectionExpanded('content')}
            >
              <i className="fas fa-fw fa-cogs"></i>
              <span>Content & Tools</span>
              <i className={`fas fa-chevron-${isSectionExpanded('content') ? 'up' : 'down'} float-right mt-1`}></i>
            </button>
            <div className={`collapse ${isSectionExpanded('content') ? 'show' : ''}`}>
              <div className="py-2 collapse-inner rounded">
                <h6 className="collapse-header">Management Tools:</h6>
                <Link className={`collapse-item ${isActive('meal-plans') ? 'active' : ''}`} href="/admin?tab=meal-plans">
                  <i className="fas fa-utensils fa-sm fa-fw mr-2 text-gray-400"></i>
                  Meal Plans
                </Link>
                <Link className={`collapse-item ${isActive('qr-codes') ? 'active' : ''}`} href="/admin?tab=qr-codes">
                  <i className="fas fa-qrcode fa-sm fa-fw mr-2 text-gray-400"></i>
                  QR Codes
                </Link>
              </div>
            </div>
          </li>

          {/* Nav Item - Communication */}
          <li className="nav-item">
            <button 
              className={`nav-link w-100 text-left border-0 bg-transparent ${isSectionActive(['sms', 'notifications', 'emails', 'gohighlevel']) ? 'active' : ''}`}
              onClick={() => toggleSection('comms')}
              aria-expanded={isSectionExpanded('comms')}
            >
              <i className="fas fa-fw fa-comments"></i>
              <span>Communication</span>
              <i className={`fas fa-chevron-${isSectionExpanded('comms') ? 'up' : 'down'} float-right mt-1`}></i>
            </button>
            <div className={`collapse ${isSectionExpanded('comms') ? 'show' : ''}`}>
              <div className="py-2 collapse-inner rounded">
                <h6 className="collapse-header">Messaging:</h6>
                <Link className={`collapse-item ${isActive('sms') ? 'active' : ''}`} href="/admin?tab=sms">
                  <i className="fas fa-sms fa-sm fa-fw mr-2 text-gray-400"></i>
                  SMS Management
                </Link>
                <Link className={`collapse-item ${isActive('notifications') ? 'active' : ''}`} href="/admin?tab=notifications">
                  <i className="fas fa-bell fa-sm fa-fw mr-2 text-gray-400"></i>
                  Notifications
                </Link>
                <Link className={`collapse-item ${isActive('emails') ? 'active' : ''}`} href="/admin?tab=emails">
                  <i className="fas fa-envelope fa-sm fa-fw mr-2 text-gray-400"></i>
                  Email Templates
                </Link>
                <div className="dropdown-divider"></div>
                <h6 className="collapse-header">Integrations:</h6>
                <Link className={`collapse-item ${isActive('gohighlevel') ? 'active' : ''}`} href="/admin?tab=gohighlevel">
                  <i className="fas fa-plug fa-sm fa-fw mr-2 text-gray-400"></i>
                  GoHighLevel
                </Link>
                <Link className={`collapse-item ${isActive('facebook-links') ? 'active' : ''}`} href="/admin?tab=facebook-links">
                  <i className="fab fa-facebook fa-sm fa-fw mr-2 text-primary"></i>
                  Facebook Links
                </Link>
              </div>
            </div>
          </li>

          {/* Divider */}
          <hr className="sidebar-divider d-none d-md-block" />

          {/* Sidebar Toggler (Sidebar) */}
          <div className="text-center d-none d-md-inline">
            <button className="rounded-circle border-0" id="sidebarToggle" onClick={toggleSidebar}></button>
          </div>
        </ul>

        {/* Content Wrapper */}
        <div id="content-wrapper" className="d-flex flex-column">
          {/* Main Content */}
          <div id="content">
            {/* Topbar */}
            <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
              {/* Sidebar Toggle (Topbar) */}
              <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3" onClick={toggleSidebar}>
                <i className="fa fa-bars"></i>
              </button>

              {/* Topbar Search */}
              <form className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
                <div className="input-group">
                  <input type="text" className="form-control bg-light border-0 small" placeholder="Search players, teams, games..." aria-label="Search" />
                  <div className="input-group-append">
                    <button className="btn btn-primary" type="button">
                      <i className="fas fa-search fa-sm"></i>
                    </button>
                  </div>
                </div>
              </form>

              {/* Topbar Navbar */}
              <ul className="navbar-nav ml-auto">
                {/* Nav Item - Search Dropdown (Visible Only XS) */}
                <li className="nav-item dropdown no-arrow d-sm-none">
                  <a className="nav-link dropdown-toggle" href="#" id="searchDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i className="fas fa-search fa-fw"></i>
                  </a>
                  <div className="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in" aria-labelledby="searchDropdown">
                    <form className="form-inline mr-auto w-100 navbar-search">
                      <div className="input-group">
                        <input type="text" className="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" />
                        <div className="input-group-append">
                          <button className="btn btn-primary" type="button">
                            <i className="fas fa-search fa-sm"></i>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </li>

                {/* Nav Item - Alerts */}
                <li className="nav-item dropdown no-arrow mx-1">
                  <a className="nav-link dropdown-toggle" href="#" id="alertsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i className="fas fa-bell fa-fw"></i>
                    <span className="badge badge-danger badge-counter">3+</span>
                  </a>
                  <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="alertsDropdown">
                    <h6 className="dropdown-header">
                      Alerts Center
                    </h6>
                    <a className="dropdown-item d-flex align-items-center" href="#">
                      <div className="mr-3">
                        <div className="icon-circle bg-primary">
                          <i className="fas fa-file-alt text-white"></i>
                        </div>
                      </div>
                      <div>
                        <div className="small text-gray-500">December 12, 2019</div>
                        <span className="font-weight-bold">A new monthly report is ready to download!</span>
                      </div>
                    </a>
                    <a className="dropdown-item text-center small text-gray-500" href="#">Show All Alerts</a>
                  </div>
                </li>

                {/* Nav Item - Messages */}
                <li className="nav-item dropdown no-arrow mx-1">
                  <a className="nav-link dropdown-toggle" href="#" id="messagesDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i className="fas fa-envelope fa-fw"></i>
                    <span className="badge badge-danger badge-counter">7</span>
                  </a>
                  <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="messagesDropdown">
                    <h6 className="dropdown-header">
                      Message Center
                    </h6>
                    <a className="dropdown-item d-flex align-items-center" href="#">
                      <div className="dropdown-list-image mr-3">
                        <img className="rounded-circle" src="https://source.unsplash.com/60x60/?portrait" alt="..." />
                        <div className="status-indicator bg-success"></div>
                      </div>
                      <div className="font-weight-bold">
                        <div className="text-truncate">Hi there! I am wondering if you can help me with a problem I've been having.</div>
                        <div className="small text-gray-500">Emily Fowler · 58m</div>
                      </div>
                    </a>
                    <a className="dropdown-item text-center small text-gray-500" href="#">Read More Messages</a>
                  </div>
                </li>

                <div className="topbar-divider d-none d-sm-block"></div>

                {/* Nav Item - User Information */}
                <li className="nav-item dropdown no-arrow">
                  <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span className="mr-2 d-none d-lg-inline text-gray-600 small">Admin User</span>
                    <img className="img-profile rounded-circle" src="https://source.unsplash.com/60x60/?business" alt="Admin Profile" />
                  </a>
                  <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                    <a className="dropdown-item" href="#">
                      <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                      Profile
                    </a>
                    <a className="dropdown-item" href="#">
                      <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                      Settings
                    </a>
                    <a className="dropdown-item" href="#">
                      <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                      Activity Log
                    </a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="#" data-toggle="modal" data-target="#logoutModal">
                      <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                      Logout
                    </a>
                  </div>
                </li>
              </ul>
            </nav>

            {/* Page Content */}
            <div className="container-fluid">
              {children}
            </div>
          </div>

          {/* Footer */}
          <footer className="sticky-footer bg-white">
            <div className="container my-auto">
              <div className="copyright text-center my-auto">
                <span>Copyright &copy; All Pro Sports {new Date().getFullYear()}</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
