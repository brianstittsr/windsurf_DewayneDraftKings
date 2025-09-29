'use client';

import { useState, useEffect, ReactNode } from 'react';
import AdminLogin from './AdminLogin';
import { checkAdminAuth } from '../lib/admin-auth';

interface AdminUser {
  username: string;
  role: 'admin' | 'coach' | 'player';
}

interface AdminAuthWrapperProps {
  children: ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authResult = await checkAdminAuth();
      setIsAuthenticated(authResult.isAuthenticated);
      setUser(authResult.user || null);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData: AdminUser) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading Admin Panel...</h5>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AdminAuthProvider user={user} onLogout={handleLogout}>
      {children}
    </AdminAuthProvider>
  );
}

// Context provider for admin user data
interface AdminAuthProviderProps {
  user: AdminUser | null;
  onLogout: () => void;
  children: ReactNode;
}

function AdminAuthProvider({ user, onLogout, children }: AdminAuthProviderProps) {
  return (
    <div className="admin-authenticated">
      {/* Add logout button to admin header */}
      <style jsx global>{`
        .admin-layout .navbar-nav .nav-item.logout-item {
          margin-left: auto;
        }
        .admin-layout .navbar-nav .logout-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: all 0.15s ease-in-out;
        }
        .admin-layout .navbar-nav .logout-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          color: white;
        }
      `}</style>
      
      <div className="admin-auth-context" data-user={JSON.stringify(user)} data-logout="true">
        {children}
      </div>

      {/* Inject logout functionality into admin layout */}
      <script dangerouslySetInnerHTML={{
        __html: `
          function handleAdminLogout() {
            if (confirm('Are you sure you want to logout?')) {
              fetch('/api/auth/admin/logout', {
                method: 'POST',
                credentials: 'include'
              }).then(() => {
                window.location.reload();
              }).catch((error) => {
                console.error('Logout error:', error);
                window.location.reload();
              });
            }
          }
          
          document.addEventListener('DOMContentLoaded', function() {
            const topbar = document.querySelector('.navbar-nav.ml-auto');
            if (topbar && !document.querySelector('.logout-item')) {
              const logoutItem = document.createElement('li');
              logoutItem.className = 'nav-item logout-item';
              logoutItem.innerHTML = \`
                <button class="btn logout-btn" onclick="handleAdminLogout()">
                  <i class="fas fa-sign-out-alt me-1"></i>
                  Logout (${user?.username} - ${user?.role})
                </button>
              \`;
              topbar.appendChild(logoutItem);
            }
          });
        `
      }} />
    </div>
  );
}
