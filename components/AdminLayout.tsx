'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (tab: string) => {
    if (tab === '/admin') {
      return pathname === '/admin' && !searchParams.get('tab');
    }
    return pathname === '/admin' && searchParams.get('tab') === tab;
  };

  useEffect(() => {
    // Initialize sidebar toggle functionality
    const sidebarToggle = document.querySelector('#sidebarToggle');
    const sidebarToggleTop = document.querySelector('#sidebarToggleTop');
    const sidebar = document.querySelector('.sidebar');

    const toggleSidebar = () => {
      if (sidebar) {
        sidebar.classList.toggle('toggled');
      }
    };

    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', toggleSidebar);
    }
    if (sidebarToggleTop) {
      sidebarToggleTop.addEventListener('click', toggleSidebar);
    }

    return () => {
      if (sidebarToggle) {
        sidebarToggle.removeEventListener('click', toggleSidebar);
      }
      if (sidebarToggleTop) {
        sidebarToggleTop.removeEventListener('click', toggleSidebar);
      }
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        body {
          overflow-x: hidden;
        }
        #wrapper {
          display: flex;
          width: 100%;
        }
        .sidebar {
          width: 14rem;
          min-height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          flex-shrink: 0;
        }
        #content-wrapper {
          margin-left: 14rem;
          width: calc(100% - 14rem);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        #content {
          flex: 1;
        }
        .container-fluid {
          padding: 1.5rem;
        }
        @media (max-width: 768px) {
          .sidebar {
            margin-left: -14rem;
            transition: margin-left 0.3s ease;
          }
          #content-wrapper {
            margin-left: 0;
            width: 100%;
          }
          .sidebar.toggled {
            margin-left: 0;
          }
        }
      `}</style>
      <div id="wrapper">
        {/* Sidebar */}
        <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
          {/* Sidebar Brand */}
          <Link href="/admin" className="sidebar-brand d-flex align-items-center justify-content-center">
            <div className="sidebar-brand-icon rotate-n-15">
              <i className="fas fa-football-ball"></i>
            </div>
            <div className="sidebar-brand-text mx-3">All Pro Sports</div>
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
            Management
          </div>

          {/* Nav Item - User Profiles */}
          <li className="nav-item">
            <Link href="/admin?tab=user-profiles" className={`nav-link ${isActive('user-profiles') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-user"></i>
              <span>User Profiles</span>
            </Link>
          </li>

          {/* Nav Item - Players */}
          <li className="nav-item">
            <Link href="/admin?tab=players" className={`nav-link ${isActive('players') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-users"></i>
              <span>Players</span>
            </Link>
          </li>

          {/* Nav Item - Coaches */}
          <li className="nav-item">
            <Link href="/admin?tab=coaches" className={`nav-link ${isActive('coaches') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-user-tie"></i>
              <span>Coaches</span>
            </Link>
          </li>

          {/* Nav Item - Teams */}
          <li className="nav-item">
            <Link href="/admin?tab=teams" className={`nav-link ${isActive('teams') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-users-cog"></i>
              <span>Teams</span>
            </Link>
          </li>

          {/* Nav Item - Games */}
          <li className="nav-item">
            <Link href="/admin?tab=games" className={`nav-link ${isActive('games') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-calendar-alt"></i>
              <span>Games</span>
            </Link>
          </li>

          {/* Divider */}
          <hr className="sidebar-divider" />

          {/* Heading */}
          <div className="sidebar-heading">
            Business
          </div>

          {/* Nav Item - Payments */}
          <li className="nav-item">
            <Link href="/admin?tab=payments" className={`nav-link ${isActive('payments') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-credit-card"></i>
              <span>Payments</span>
            </Link>
          </li>

          {/* Nav Item - Coupons */}
          <li className="nav-item">
            <Link href="/admin?tab=coupons" className={`nav-link ${isActive('coupons') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-tags"></i>
              <span>Coupons</span>
            </Link>
          </li>

          {/* Nav Item - Pricing */}
          <li className="nav-item">
            <Link href="/admin?tab=pricing" className={`nav-link ${isActive('pricing') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-dollar-sign"></i>
              <span>Pricing</span>
            </Link>
          </li>

          {/* Nav Item - Meal Plans */}
          <li className="nav-item">
            <Link href="/admin/meal-plans" className={`nav-link ${pathname === '/admin/meal-plans' ? 'active' : ''}`}>
              <i className="fas fa-fw fa-utensils"></i>
              <span>Meal Plans</span>
            </Link>
          </li>

          {/* Nav Item - QR Codes */}
          <li className="nav-item">
            <Link href="/admin?tab=qr-codes" className={`nav-link ${isActive('qr-codes') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-qrcode"></i>
              <span>QR Codes</span>
            </Link>
          </li>

          {/* Divider */}
          <hr className="sidebar-divider" />

          {/* Heading */}
          <div className="sidebar-heading">
            Communication
          </div>

          {/* Nav Item - SMS */}
          <li className="nav-item">
            <Link href="/admin?tab=sms" className={`nav-link ${isActive('/admin/sms') ? 'active' : ''}`}>
              <i className="fas fa-fw fa-sms"></i>
              <span>SMS Management</span>
            </Link>
          </li>

          {/* Divider */}
          <hr className="sidebar-divider d-none d-md-block" />

          {/* Sidebar Toggler (Sidebar) */}
          <div className="text-center d-none d-md-inline">
            <button className="rounded-circle border-0" id="sidebarToggle"></button>
          </div>
        </ul>

        {/* Content Wrapper */}
        <div id="content-wrapper" className="d-flex flex-column">
          {/* Main Content */}
          <div id="content">
            {/* Topbar */}
            <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
              {/* Sidebar Toggle (Topbar) */}
              <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
                <i className="fa fa-bars"></i>
              </button>

              {/* Topbar Search */}
              <form className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
                <div className="input-group">
                  <input type="text" className="form-control bg-light border-0 small" placeholder="Search for..." />
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
                  <a className="nav-link dropdown-toggle" href="#" id="searchDropdown" role="button" data-toggle="dropdown">
                    <i className="fas fa-search fa-fw"></i>
                  </a>
                </li>

                {/* Nav Item - User Information */}
                <li className="nav-item dropdown no-arrow">
                  <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown">
                    <span className="mr-2 d-none d-lg-inline text-gray-600 small">Admin User</span>
                    <i className="fas fa-user-circle fa-2x text-gray-600"></i>
                  </a>
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
