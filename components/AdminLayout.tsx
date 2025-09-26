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

  const isActive = (tab: string) => {
    if (tab === '/admin') {
      return pathname === '/admin' && !searchParams.get('tab');
    }
    return pathname === '/admin' && searchParams.get('tab') === tab;
  };

  const toggleSidebar = () => {
    setSidebarToggled(!sidebarToggled);
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

          {/* Nav Item - Players Collapse Menu */}
          <li className="nav-item">
            <a className={`nav-link collapsed ${isActive('players') ? 'active' : ''}`} href="#" data-toggle="collapse" data-target="#collapseUsers" aria-expanded="true" aria-controls="collapseUsers">
              <i className="fas fa-fw fa-users"></i>
              <span>User Management</span>
            </a>
            <div id="collapseUsers" className="collapse" aria-labelledby="headingUsers" data-parent="#accordionSidebar">
              <div className="bg-white py-2 collapse-inner rounded">
                <h6 className="collapse-header">User Profiles:</h6>
                <Link className="collapse-item" href="/admin?tab=user-profiles">All Users</Link>
                <Link className="collapse-item" href="/admin?tab=players">Players</Link>
                <Link className="collapse-item" href="/admin?tab=coaches">Coaches</Link>
              </div>
            </div>
          </li>

          {/* Nav Item - Teams & Games */}
          <li className="nav-item">
            <a className={`nav-link collapsed ${isActive('teams') || isActive('games') ? 'active' : ''}`} href="#" data-toggle="collapse" data-target="#collapseLeague" aria-expanded="true" aria-controls="collapseLeague">
              <i className="fas fa-fw fa-futbol"></i>
              <span>League Management</span>
            </a>
            <div id="collapseLeague" className="collapse" aria-labelledby="headingLeague" data-parent="#accordionSidebar">
              <div className="bg-white py-2 collapse-inner rounded">
                <h6 className="collapse-header">League Operations:</h6>
                <Link className="collapse-item" href="/admin?tab=teams">Teams</Link>
                <Link className="collapse-item" href="/admin?tab=games">Games & Schedule</Link>
                <Link className="collapse-item" href="/admin?tab=seasons">Seasons</Link>
              </div>
            </div>
          </li>

          {/* Divider */}
          <hr className="sidebar-divider" />

          {/* Direct Access Links */}
          <li className="nav-item">
            <Link href="/admin?tab=user-profiles" className={`nav-link ${isActive('user-profiles') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-users"></i>
              <span>User Profiles</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/admin?tab=payments" className={`nav-link ${isActive('payments') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-credit-card"></i>
              <span>Payments</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/admin?tab=coupons" className={`nav-link ${isActive('coupons') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-gift"></i>
              <span>Coupons / Gift Cards</span>
            </Link>
          </li>

          {/* Divider */}
          <hr className="sidebar-divider" />

          {/* Heading */}
          <div className="sidebar-heading">
            Business Operations
          </div>

          {/* Nav Item - Financial Management */}
          <li className="nav-item">
            <a className={`nav-link collapsed ${isActive('payments') || isActive('pricing') || isActive('coupons') ? 'active' : ''}`} href="#" data-toggle="collapse" data-target="#collapseFinance" aria-expanded="true" aria-controls="collapseFinance">
              <i className="fas fa-fw fa-dollar-sign"></i>
              <span>Financial Management</span>
            </a>
            <div id="collapseFinance" className="collapse" aria-labelledby="headingFinance" data-parent="#accordionSidebar">
              <div className="bg-white py-2 collapse-inner rounded">
                <h6 className="collapse-header">Revenue & Pricing:</h6>
                <Link className="collapse-item" href="/admin?tab=payments">
                  <i className="fas fa-credit-card fa-sm fa-fw mr-2 text-gray-400"></i>
                  Payments
                </Link>
                <Link className="collapse-item" href="/admin?tab=pricing">
                  <i className="fas fa-tags fa-sm fa-fw mr-2 text-gray-400"></i>
                  Pricing Plans
                </Link>
                <Link className="collapse-item" href="/admin?tab=coupons">
                  <i className="fas fa-percentage fa-sm fa-fw mr-2 text-gray-400"></i>
                  Coupons & Discounts
                </Link>
              </div>
            </div>
          </li>

          {/* Nav Item - Content Management */}
          <li className="nav-item">
            <a className={`nav-link collapsed ${isActive('meal-plans') || isActive('qr-codes') ? 'active' : ''}`} href="#" data-toggle="collapse" data-target="#collapseContent" aria-expanded="true" aria-controls="collapseContent">
              <i className="fas fa-fw fa-cogs"></i>
              <span>Content & Tools</span>
            </a>
            <div id="collapseContent" className="collapse" aria-labelledby="headingContent" data-parent="#accordionSidebar">
              <div className="bg-white py-2 collapse-inner rounded">
                <h6 className="collapse-header">Management Tools:</h6>
                <Link className="collapse-item" href="/admin?tab=meal-plans">
                  <i className="fas fa-utensils fa-sm fa-fw mr-2 text-gray-400"></i>
                  Meal Plans
                </Link>
                <Link className="collapse-item" href="/admin?tab=qr-codes">
                  <i className="fas fa-qrcode fa-sm fa-fw mr-2 text-gray-400"></i>
                  QR Codes
                </Link>
                <Link className="collapse-item" href="/admin?tab=analytics">
                  <i className="fas fa-chart-area fa-sm fa-fw mr-2 text-gray-400"></i>
                  Analytics
                </Link>
              </div>
            </div>
          </li>

          {/* Nav Item - Communication */}
          <li className="nav-item">
            <a className={`nav-link collapsed ${isActive('sms') ? 'active' : ''}`} href="#" data-toggle="collapse" data-target="#collapseComms" aria-expanded="true" aria-controls="collapseComms">
              <i className="fas fa-fw fa-comments"></i>
              <span>Communication</span>
            </a>
            <div id="collapseComms" className="collapse" aria-labelledby="headingComms" data-parent="#accordionSidebar">
              <div className="bg-white py-2 collapse-inner rounded">
                <h6 className="collapse-header">Messaging:</h6>
                <Link className="collapse-item" href="/admin?tab=sms">
                  <i className="fas fa-sms fa-sm fa-fw mr-2 text-gray-400"></i>
                  SMS Management
                </Link>
                <Link className="collapse-item" href="/admin?tab=notifications">
                  <i className="fas fa-bell fa-sm fa-fw mr-2 text-gray-400"></i>
                  Notifications
                </Link>
                <Link className="collapse-item" href="/admin?tab=emails">
                  <i className="fas fa-envelope fa-sm fa-fw mr-2 text-gray-400"></i>
                  Email Templates
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
