'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/firestore-schema';

interface UserProfileSearchProps {
  onProfileSelect?: (profile: UserProfile) => void;
}

export default function UserProfileSearch({ onProfileSelect }: UserProfileSearchProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodes, setQRCodes] = useState<{ profile?: string; contact?: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, statusFilter, roleFilter]);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/user-profiles');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(profile =>
        profile.firstName.toLowerCase().includes(term) ||
        profile.lastName.toLowerCase().includes(term) ||
        profile.email.toLowerCase().includes(term) ||
        profile.phone.includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(profile => profile.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(profile => profile.role === roleFilter);
    }

    setFilteredProfiles(filtered);
  };

  const generateQRCode = async (profileId: string, qrType: 'profile' | 'contact') => {
    try {
      const response = await fetch(`/api/user-profiles/${profileId}/qr-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrType })
      });

      if (response.ok) {
        const data = await response.json();
        setQRCodes(prev => ({ ...prev, [qrType]: data.qrCodeDataUrl }));
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const openProfileModal = async (profile: UserProfile) => {
    setSelectedProfile(profile);
    
    // Fetch existing QR codes
    try {
      const response = await fetch(`/api/user-profiles/${profile.id}/qr-code`);
      if (response.ok) {
        const data = await response.json();
        setQRCodes(data.qrCodes || {});
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    }
    
    setShowQRModal(true);
  };

  const updateProfileStatus = async (profileId: string, status: string) => {
    try {
      const response = await fetch(`/api/user-profiles/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchProfiles(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating profile status:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <div className="spinner-border text-primary me-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="text-muted">Loading profiles...</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Modern Header */}
      <div className="dk-card mb-4">
        <div className="card-header">
          <div className="d-flex align-items-center">
            <div className="feature-icon me-3">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <h4 className="card-title mb-0">User Profile Management</h4>
              <p className="text-muted mb-0">Search and manage user profiles</p>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">
                <i className="fas fa-search me-2"></i>Search
              </label>
              <input
                type="text"
                placeholder="Name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dk-metric-input form-control"
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label">
                <i className="fas fa-filter me-2"></i>Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="dk-metric-input form-select"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">
                <i className="fas fa-user-tag me-2"></i>Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="dk-metric-input form-select"
              >
                <option value="all">All Roles</option>
                <option value="player">Players</option>
                <option value="coach">Coaches</option>
              </select>
            </div>
            
            <div className="col-md-3 d-flex align-items-end">
              <button
                onClick={fetchProfiles}
                className="dk-btn-primary w-100"
              >
                <i className="fas fa-sync-alt me-2"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="stats-card mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="mb-1">
              <i className="fas fa-chart-bar me-2 text-primary"></i>
              Profile Results
            </h6>
            <p className="text-muted mb-0">
              Showing <strong>{filteredProfiles.length}</strong> of <strong>{profiles.length}</strong> profiles
            </p>
          </div>
          <div className="modern-badge">
            {filteredProfiles.length} Found
          </div>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="dk-card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="border-0">
                  <i className="fas fa-user me-2"></i>Name
                </th>
                <th className="border-0">
                  <i className="fas fa-address-book me-2"></i>Contact
                </th>
                <th className="border-0">
                  <i className="fas fa-user-tag me-2"></i>Role
                </th>
                <th className="border-0">
                  <i className="fas fa-toggle-on me-2"></i>Status
                </th>
                <th className="border-0">
                  <i className="fas fa-credit-card me-2"></i>Payment
                </th>
                <th className="border-0">
                  <i className="fas fa-cogs me-2"></i>Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover-lift">
                  <td className="py-3">
                    <div className="d-flex align-items-center">
                      <div className="feature-icon me-3" style={{width: '32px', height: '32px', fontSize: '14px'}}>
                        <i className={`fas ${profile.role === 'player' ? 'fa-running' : 'fa-whistle'}`}></i>
                      </div>
                      <div>
                        <div className="fw-semibold text-dark">
                          {profile.firstName} {profile.lastName}
                        </div>
                        <div className="text-muted small">
                          <i className="fas fa-tshirt me-1"></i>Jersey: {profile.jerseySize}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="text-dark">
                      <i className="fas fa-envelope me-2 text-primary"></i>{profile.email}
                    </div>
                    <div className="text-muted small">
                      <i className="fas fa-phone me-2 text-success"></i>{profile.phone}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`badge rounded-pill ${
                      profile.role === 'player' 
                        ? 'bg-primary' 
                        : 'bg-success'
                    }`}>
                      <i className={`fas ${profile.role === 'player' ? 'fa-running' : 'fa-whistle'} me-1`}></i>
                      {profile.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <select
                      value={profile.status}
                      onChange={(e) => updateProfileStatus(profile.id!, e.target.value)}
                      className={`form-select form-select-sm border-0 ${
                        profile.status === 'active' 
                          ? 'bg-success bg-opacity-10 text-success' 
                          : profile.status === 'inactive'
                          ? 'bg-danger bg-opacity-10 text-danger'
                          : 'bg-warning bg-opacity-10 text-warning'
                      }`}
                      style={{width: 'auto', minWidth: '100px'}}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                  <td className="py-3">
                    <span className={`badge rounded-pill ${
                      profile.paymentStatus === 'paid' 
                        ? 'bg-success' 
                        : 'bg-warning'
                    }`}>
                      <i className={`fas ${profile.paymentStatus === 'paid' ? 'fa-check-circle' : 'fa-clock'} me-1`}></i>
                      {profile.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="btn-group" role="group">
                      <button
                        onClick={() => openProfileModal(profile)}
                        className="btn btn-sm btn-outline-primary"
                        title="View Profile"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {onProfileSelect && (
                        <button
                          onClick={() => onProfileSelect(profile)}
                          className="btn btn-sm btn-outline-success"
                          title="Select Profile"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Detail Modal */}
      {showQRModal && selectedProfile && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <div className="d-flex align-items-center">
                  <div className="feature-icon me-3 bg-white text-primary">
                    <i className="fas fa-user"></i>
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">
                      {selectedProfile.firstName} {selectedProfile.lastName}
                    </h5>
                    <small className="opacity-75">Profile Details & QR Codes</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowQRModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Profile Info */}
                  <div className="col-md-6">
                    <div className="stats-card h-100">
                      <h6 className="card-title">
                        <i className="fas fa-info-circle me-2 text-primary"></i>
                        Profile Information
                      </h6>
                      <div className="row g-3">
                        <div className="col-12">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-envelope text-primary me-3"></i>
                            <div>
                              <small className="text-muted d-block">Email</small>
                              <span className="fw-medium">{selectedProfile.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-phone text-success me-3"></i>
                            <div>
                              <small className="text-muted d-block">Phone</small>
                              <span className="fw-medium">{selectedProfile.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-user-tag text-info me-3"></i>
                            <div>
                              <small className="text-muted d-block">Role</small>
                              <span className={`badge ${selectedProfile.role === 'player' ? 'bg-primary' : 'bg-success'}`}>
                                {selectedProfile.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-tshirt text-warning me-3"></i>
                            <div>
                              <small className="text-muted d-block">Jersey</small>
                              <span className="fw-medium">{selectedProfile.jerseySize}</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-toggle-on text-secondary me-3"></i>
                            <div>
                              <small className="text-muted d-block">Status</small>
                              <span className={`badge ${
                                selectedProfile.status === 'active' ? 'bg-success' :
                                selectedProfile.status === 'inactive' ? 'bg-danger' : 'bg-warning'
                              }`}>
                                {selectedProfile.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-credit-card text-success me-3"></i>
                            <div>
                              <small className="text-muted d-block">Payment</small>
                              <span className={`badge ${selectedProfile.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                                {selectedProfile.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Codes */}
                  <div className="col-md-6">
                    <div className="stats-card h-100">
                      <h6 className="card-title">
                        <i className="fas fa-qrcode me-2 text-primary"></i>
                        QR Codes
                      </h6>
                      
                      <div className="row g-3">
                        <div className="col-12">
                          <div className="border rounded p-3 text-center">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="fw-medium">
                                <i className="fas fa-user me-2 text-primary"></i>
                                Profile QR
                              </span>
                              <button
                                onClick={() => generateQRCode(selectedProfile.id!, 'profile')}
                                className="btn btn-sm btn-primary"
                              >
                                <i className="fas fa-sync me-1"></i>
                                Generate
                              </button>
                            </div>
                            {qrCodes.profile && (
                              <div className="dk-qr-container d-inline-block">
                                <img src={qrCodes.profile} alt="Profile QR" className="img-fluid" style={{maxWidth: '120px'}} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="border rounded p-3 text-center">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="fw-medium">
                                <i className="fas fa-address-card me-2 text-success"></i>
                                Contact QR
                              </span>
                              <button
                                onClick={() => generateQRCode(selectedProfile.id!, 'contact')}
                                className="btn btn-sm btn-success"
                              >
                                <i className="fas fa-sync me-1"></i>
                                Generate
                              </button>
                            </div>
                            {qrCodes.contact && (
                              <div className="dk-qr-container d-inline-block">
                                <img src={qrCodes.contact} alt="Contact QR" className="img-fluid" style={{maxWidth: '120px'}} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration PDF */}
                {selectedProfile.registrationPdfUrl && (
                  <div className="mt-4 pt-3 border-top">
                    <h6 className="card-title mb-3">
                      <i className="fas fa-file-pdf me-2 text-danger"></i>
                      Registration Document
                    </h6>
                    <a
                      href={selectedProfile.registrationPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-danger"
                    >
                      <i className="fas fa-file-pdf me-2"></i>
                      View PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
