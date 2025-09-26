'use client';

import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import UserProfileSearch from '@/components/UserProfileSearch';

function UserProfilesPageContent() {
  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="page-header flex items-center justify-between mb-8">
          <h1 className="page-title">
            <i className="fas fa-users me-2"></i>
            User Profile Management
          </h1>
          <div className="d-flex gap-2">
            <button className="btn btn-primary">
              <i className="fas fa-plus mr-2"></i>
              Add User
            </button>
            <button className="btn btn-outline-secondary">
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
        <UserProfileSearch />
      </div>
    </AdminLayout>
  );
}

export default function UserProfilesPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <UserProfilesPageContent />
    </Suspense>
  );
}
