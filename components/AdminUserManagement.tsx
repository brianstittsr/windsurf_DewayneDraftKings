'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'player' | 'coach';
  status: 'active' | 'inactive' | 'pending';
  dateOfBirth: string;
  jerseySize?: string;
  position?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  medicalConditions?: string;
  medications?: string;
  allergies?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  selectedPlan?: any;
  createdAt: string;
  updatedAt: string;
  registrationDate: string;
}

export default function AdminUserManagement() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create' | 'delete'>('view');
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/user-profiles?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      status: profile.status,
      dateOfBirth: profile.dateOfBirth,
      jerseySize: profile.jerseySize,
      position: profile.position,
      emergencyContactName: profile.emergencyContactName,
      emergencyContactPhone: profile.emergencyContactPhone,
      emergencyContactRelation: profile.emergencyContactRelation,
      medicalConditions: profile.medicalConditions,
      medications: profile.medications,
      allergies: profile.allergies,
      paymentStatus: profile.paymentStatus
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedProfile(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'player',
      status: 'active',
      dateOfBirth: '',
      jerseySize: 'M',
      position: 'flex',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      medicalConditions: '',
      medications: '',
      allergies: '',
      paymentStatus: 'pending'
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setModalMode('delete');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      let response;
      
      if (modalMode === 'create') {
        response = await fetch('/api/registration/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            waiverAccepted: true,
            termsAccepted: true,
            registrationSource: 'admin_created'
          })
        });
      } else if (modalMode === 'edit' && selectedProfile) {
        response = await fetch('/api/user-profiles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedProfile.id,
            role: selectedProfile.role,
            ...formData
          })
        });
      }

      if (response && response.ok) {
        await fetchProfiles();
        setShowModal(false);
        alert(`Profile ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
      } else {
        const data = await response?.json();
        alert(`Error: ${data?.error || 'Operation failed'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProfile) return;

    try {
      const response = await fetch(`/api/user-profiles?id=${selectedProfile.id}&role=${selectedProfile.role}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProfiles();
        setShowModal(false);
        alert('Profile deleted successfully!');
      } else {
        const data = await response.json();
        alert(`Error deleting profile: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting profile. Please try again.');
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm || 
      profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || profile.status === statusFilter;
    const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <div className="spinner-border text-primary me-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="text-muted">Loading user profiles...</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <i className="fas fa-users me-2 text-primary"></i>
            User Profile Management
          </h4>
          <p className="text-muted mb-0">Manage user registrations and profiles</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleCreate}
        >
          <i className="fas fa-plus me-2"></i>
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">
                <i className="fas fa-search me-2"></i>Search
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">
                <i className="fas fa-filter me-2"></i>Status
              </label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
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
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="player">Players</option>
                <option value="coach">Coaches</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={fetchProfiles}
              >
                <i className="fas fa-sync-alt me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>
            User Profiles ({filteredProfiles.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {filteredProfiles.length === 0 ? (
            <div className="text-center p-4">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h6 className="text-muted">No profiles found</h6>
              <p className="text-muted">Try adjusting your search criteria or add a new user.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center">
                            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-semibold">{profile.firstName} {profile.lastName}</div>
                            {profile.position && (
                              <small className="text-muted">{profile.position}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{profile.email}</td>
                      <td>{profile.phone}</td>
                      <td>
                        <span className={`badge ${profile.role === 'player' ? 'bg-primary' : 'bg-success'}`}>
                          {profile.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          profile.status === 'active' ? 'bg-success' :
                          profile.status === 'pending' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {profile.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          profile.paymentStatus === 'paid' ? 'bg-success' :
                          profile.paymentStatus === 'pending' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {profile.paymentStatus}
                        </span>
                      </td>
                      <td>
                        {new Date(profile.registrationDate).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleView(profile)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleEdit(profile)}
                            title="Edit Profile"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(profile)}
                            title="Delete Profile"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'view' && <><i className="fas fa-eye me-2"></i>View Profile</>}
                  {modalMode === 'edit' && <><i className="fas fa-edit me-2"></i>Edit Profile</>}
                  {modalMode === 'create' && <><i className="fas fa-plus me-2"></i>Create Profile</>}
                  {modalMode === 'delete' && <><i className="fas fa-trash me-2"></i>Delete Profile</>}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {modalMode === 'delete' ? (
                  <div className="text-center">
                    <i className="fas fa-exclamation-triangle text-warning fa-3x mb-3"></i>
                    <h5>Are you sure?</h5>
                    <p>This action cannot be undone. This will permanently delete the user profile.</p>
                    {selectedProfile && (
                      <p className="fw-semibold">{selectedProfile.firstName} {selectedProfile.lastName}</p>
                    )}
                  </div>
                ) : modalMode === 'view' && selectedProfile ? (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary mb-3">Personal Information</h6>
                      <p><strong>Name:</strong> {selectedProfile.firstName} {selectedProfile.lastName}</p>
                      <p><strong>Email:</strong> {selectedProfile.email}</p>
                      <p><strong>Phone:</strong> {selectedProfile.phone}</p>
                      <p><strong>Date of Birth:</strong> {selectedProfile.dateOfBirth}</p>
                      <p><strong>Role:</strong> <span className={`badge ${selectedProfile.role === 'player' ? 'bg-primary' : 'bg-success'}`}>{selectedProfile.role}</span></p>
                      <p><strong>Status:</strong> <span className={`badge ${selectedProfile.status === 'active' ? 'bg-success' : selectedProfile.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>{selectedProfile.status}</span></p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-success mb-3">Additional Details</h6>
                      {selectedProfile.position && <p><strong>Position:</strong> {selectedProfile.position}</p>}
                      {selectedProfile.jerseySize && <p><strong>Jersey Size:</strong> {selectedProfile.jerseySize}</p>}
                      {selectedProfile.emergencyContactName && (
                        <>
                          <p><strong>Emergency Contact:</strong> {selectedProfile.emergencyContactName}</p>
                          <p><strong>Emergency Phone:</strong> {selectedProfile.emergencyContactPhone}</p>
                        </>
                      )}
                      <p><strong>Payment Status:</strong> <span className={`badge ${selectedProfile.paymentStatus === 'paid' ? 'bg-success' : selectedProfile.paymentStatus === 'pending' ? 'bg-warning' : 'bg-danger'}`}>{selectedProfile.paymentStatus}</span></p>
                      <p><strong>Registered:</strong> {new Date(selectedProfile.registrationDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.firstName || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.lastName || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Phone *</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.dateOfBirth || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Role</label>
                        <select
                          className="form-select"
                          value={formData.role || 'player'}
                          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'player' | 'coach' }))}
                        >
                          <option value="player">Player</option>
                          <option value="coach">Coach</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={formData.status || 'active'}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'pending' }))}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                      {formData.role === 'player' && (
                        <>
                          <div className="mb-3">
                            <label className="form-label">Position</label>
                            <select
                              className="form-select"
                              value={formData.position || 'flex'}
                              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                            >
                              <option value="quarterback">Quarterback</option>
                              <option value="rusher">Rusher</option>
                              <option value="receiver">Receiver</option>
                              <option value="defender">Defender</option>
                              <option value="flex">Flex</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Jersey Size</label>
                            <select
                              className="form-select"
                              value={formData.jerseySize || 'M'}
                              onChange={(e) => setFormData(prev => ({ ...prev, jerseySize: e.target.value }))}
                            >
                              <option value="XS">XS</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                            </select>
                          </div>
                        </>
                      )}
                      <div className="mb-3">
                        <label className="form-label">Emergency Contact Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.emergencyContactName || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Emergency Contact Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.emergencyContactPhone || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  {modalMode === 'delete' ? 'Cancel' : 'Close'}
                </button>
                {modalMode === 'delete' && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteConfirm}
                  >
                    <i className="fas fa-trash me-2"></i>
                    Delete Profile
                  </button>
                )}
                {(modalMode === 'edit' || modalMode === 'create') && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                  >
                    <i className="fas fa-save me-2"></i>
                    {modalMode === 'create' ? 'Create Profile' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
