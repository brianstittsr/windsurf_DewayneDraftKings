'use client';

import { useState, useEffect } from 'react';
import { Player, Coach } from '@/lib/firestore-schema';

interface ProfileManagementProps {
  type: 'player' | 'coach';
}

interface PlayerWithId extends Player {
  id: string;
}

interface CoachWithId extends Coach {
  id: string;
}

export default function ProfileManagement({ type }: ProfileManagementProps) {
  const [profiles, setProfiles] = useState<(PlayerWithId | CoachWithId)[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<PlayerWithId | CoachWithId | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [editData, setEditData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Create form state
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    // Player specific
    position: 'flex',
    playerTag: 'free-agent',
    // Coach specific
    experience: '',
    coachingLevel: 'assistant',
    certifications: '',
    specialties: '',
    maxTeams: 2,
    // Common
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: ''
  });

  useEffect(() => {
    fetchProfiles();
  }, [type, statusFilter]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const endpoint = type === 'player' ? '/api/players' : '/api/coaches';
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`${endpoint}?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProfiles(data[type === 'player' ? 'players' : 'coaches'] || []);
      }
    } catch (error) {
      console.error(`Error fetching ${type}s:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (profile: PlayerWithId | CoachWithId) => {
    setSelectedProfile(profile);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (profile: PlayerWithId | CoachWithId) => {
    setSelectedProfile(profile);
    setEditData({ ...profile });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = (profile: PlayerWithId | CoachWithId) => {
    setSelectedProfile(profile);
    setModalMode('delete');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedProfile) return;

    try {
      const endpoint = type === 'player' ? '/api/players' : '/api/coaches';
      const idField = type === 'player' ? 'playerId' : 'coachId';
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [idField]: selectedProfile.id,
          ...editData
        })
      });

      if (response.ok) {
        await fetchProfiles();
        setShowModal(false);
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProfile) return;

    try {
      const endpoint = type === 'player' ? '/api/players' : '/api/coaches';
      const response = await fetch(`${endpoint}?id=${selectedProfile.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProfiles();
        setShowModal(false);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.phone || !createForm.dateOfBirth) {
      alert('Please fill in all required fields (First Name, Last Name, Email, Phone, Date of Birth)');
      return;
    }

    // Validate coach-specific required fields
    if (type === 'coach' && !createForm.experience) {
      alert('Experience is required for coaches');
      return;
    }
    
    try {
      const endpoint = type === 'player' ? '/api/players' : '/api/coaches';
      
      // Prepare form data based on type
      const formData = {
        ...createForm,
        certifications: createForm.certifications ? createForm.certifications.split(',').map(c => c.trim()) : [],
        specialties: createForm.specialties ? createForm.specialties.split(',').map(s => s.trim()) : []
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const responseData = await response.json();
        await fetchProfiles();
        setShowCreateModal(false);
        
        // Reset form
        setCreateForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          position: 'flex',
          playerTag: 'free-agent',
          experience: '',
          coachingLevel: 'assistant',
          certifications: '',
          specialties: '',
          maxTeams: 2,
          emergencyContactName: '',
          emergencyContactPhone: '',
          medicalConditions: ''
        });
        
        alert(`${type === 'player' ? 'Player' : 'Coach'} created successfully!`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      alert(`Error creating ${type}: ${error.message}`);
    }
  };

  const toggleStatus = async (profile: PlayerWithId | CoachWithId) => {
    try {
      const endpoint = type === 'player' ? '/api/players' : '/api/coaches';
      const idField = type === 'player' ? 'playerId' : 'coachId';
      
      const newStatus = type === 'player' 
        ? (profile as PlayerWithId).registrationStatus === 'confirmed' ? 'cancelled' : 'confirmed'
        : !(profile as CoachWithId).isActive;

      const updateData = type === 'player' 
        ? { registrationStatus: newStatus }
        : { isActive: newStatus };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [idField]: profile.id,
          ...updateData
        })
      });

      if (response.ok) {
        await fetchProfiles();
      }
    } catch (error) {
      console.error(`Error toggling ${type} status:`, error);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
    const email = profile.email?.toLowerCase() || '';
    const phone = profile.phone?.toLowerCase() || '';
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           phone.includes(searchLower);
  });

  const getStatusBadge = (profile: PlayerWithId | CoachWithId) => {
    if (type === 'player') {
      const player = profile as PlayerWithId;
      const status = player.registrationStatus;
      const badgeClass = status === 'confirmed' ? 'success' : status === 'pending' ? 'warning' : 'danger';
      return <span className={`badge bg-${badgeClass}`}>{status}</span>;
    } else {
      const coach = profile as CoachWithId;
      const isActive = coach.isActive;
      return <span className={`badge bg-${isActive ? 'success' : 'danger'}`}>{isActive ? 'Active' : 'Inactive'}</span>;
    }
  };

  return (
    <div className="profile-management">
      {/* Header with Create Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className={`fas ${type === 'player' ? 'fa-users' : 'fa-chalkboard-teacher'} me-2`}></i>
          {type === 'player' ? 'Player' : 'Coach'} Management
        </h4>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Add {type === 'player' ? 'Player' : 'Coach'}
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={`Search ${type}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {type === 'player' ? (
              <>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </>
            ) : (
              <>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </>
            )}
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary w-100" onClick={fetchProfiles}>
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="dk-card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className={`fas fa-${type === 'player' ? 'users' : 'chalkboard-teacher'} me-2`}></i>
            {type === 'player' ? 'Players' : 'Coaches'} ({filteredProfiles.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <i className={`fas fa-${type === 'player' ? 'user-slash' : 'chalkboard'} fa-3x mb-3`}></i>
              <p>No {type}s found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
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
                            {type === 'player' && (
                              <small className="text-muted">{(profile as PlayerWithId).position}</small>
                            )}
                            {type === 'coach' && (
                              <small className="text-muted">{(profile as CoachWithId).coachingLevel}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{profile.email}</td>
                      <td>{profile.phone}</td>
                      <td>{getStatusBadge(profile)}</td>
                      <td>
                        {profile.registrationDate?.toDate?.()?.toLocaleDateString() || 'N/A'}
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
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => toggleStatus(profile)}
                            title={type === 'player' ? 'Toggle Status' : 'Toggle Active'}
                          >
                            <i className="fas fa-toggle-on"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(profile)}
                            title="Delete"
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

      {/* Modal for View/Edit/Delete */}
      {showModal && selectedProfile && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'view' && <><i className="fas fa-eye me-2"></i>View {type}</>}
                  {modalMode === 'edit' && <><i className="fas fa-edit me-2"></i>Edit {type}</>}
                  {modalMode === 'delete' && <><i className="fas fa-trash me-2"></i>Delete {type}</>}
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
                    <p>This action cannot be undone. This will permanently delete the {type} profile.</p>
                    <p className="fw-semibold">{selectedProfile.firstName} {selectedProfile.lastName}</p>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">First Name</label>
                        {modalMode === 'view' ? (
                          <p className="form-control-plaintext">{selectedProfile.firstName}</p>
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            value={editData.firstName || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Last Name</label>
                        {modalMode === 'view' ? (
                          <p className="form-control-plaintext">{selectedProfile.lastName}</p>
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            value={editData.lastName || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        {modalMode === 'view' ? (
                          <p className="form-control-plaintext">{selectedProfile.email}</p>
                        ) : (
                          <input
                            type="email"
                            className="form-control"
                            value={editData.email || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Phone</label>
                        {modalMode === 'view' ? (
                          <p className="form-control-plaintext">{selectedProfile.phone}</p>
                        ) : (
                          <input
                            type="tel"
                            className="form-control"
                            value={editData.phone || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Role-specific fields */}
                    {type === 'player' && (
                      <>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Position</label>
                            {modalMode === 'view' ? (
                              <p className="form-control-plaintext">{(selectedProfile as PlayerWithId).position}</p>
                            ) : (
                              <select
                                className="form-select"
                                value={editData.position || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, position: e.target.value }))}
                              >
                                <option value="quarterback">Quarterback</option>
                                <option value="rusher">Rusher</option>
                                <option value="receiver">Receiver</option>
                                <option value="defender">Defender</option>
                                <option value="flex">Flex</option>
                              </select>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Player Tag</label>
                            {modalMode === 'view' ? (
                              <p className="form-control-plaintext">{(selectedProfile as PlayerWithId).playerTag}</p>
                            ) : (
                              <select
                                className="form-select"
                                value={editData.playerTag || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, playerTag: e.target.value }))}
                              >
                                <option value="free-agent">Free Agent</option>
                                <option value="draft-pick">Draft Pick</option>
                                <option value="prospect">Prospect</option>
                                <option value="meet-greet">Meet & Greet</option>
                                <option value="client">Client</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {type === 'coach' && (
                      <>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Experience</label>
                            {modalMode === 'view' ? (
                              <p className="form-control-plaintext">{(selectedProfile as CoachWithId).experience}</p>
                            ) : (
                              <input
                                type="text"
                                className="form-control"
                                value={editData.experience || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, experience: e.target.value }))}
                              />
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Coaching Level</label>
                            {modalMode === 'view' ? (
                              <p className="form-control-plaintext">{(selectedProfile as CoachWithId).coachingLevel}</p>
                            ) : (
                              <select
                                className="form-select"
                                value={editData.coachingLevel || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, coachingLevel: e.target.value }))}
                              >
                                <option value="volunteer">Volunteer</option>
                                <option value="assistant">Assistant</option>
                                <option value="head">Head Coach</option>
                                <option value="coordinator">Coordinator</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </>
                    )}
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
                {modalMode === 'edit' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                  >
                    <i className="fas fa-save me-2"></i>
                    Save Changes
                  </button>
                )}
                {modalMode === 'delete' && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteConfirm}
                  >
                    <i className="fas fa-trash me-2"></i>
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`fas ${type === 'player' ? 'fa-user-plus' : 'fa-chalkboard-teacher'} me-2`}></i>
                  Add New {type === 'player' ? 'Player' : 'Coach'}
                </h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="row">
                    {/* Basic Information */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name *</label>
                      <input 
                        type="text"
                        className="form-control"
                        value={createForm.firstName}
                        onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name *</label>
                      <input 
                        type="text"
                        className="form-control"
                        value={createForm.lastName}
                        onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input 
                        type="email"
                        className="form-control"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone *</label>
                      <input 
                        type="tel"
                        className="form-control"
                        value={createForm.phone}
                        onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date of Birth *</label>
                      <input 
                        type="date"
                        className="form-control"
                        value={createForm.dateOfBirth}
                        onChange={(e) => setCreateForm({...createForm, dateOfBirth: e.target.value})}
                        required
                      />
                    </div>

                    {/* Player Specific Fields */}
                    {type === 'player' && (
                      <>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Position</label>
                          <select 
                            className="form-select"
                            value={createForm.position}
                            onChange={(e) => setCreateForm({...createForm, position: e.target.value})}
                          >
                            <option value="quarterback">Quarterback</option>
                            <option value="rusher">Rusher</option>
                            <option value="receiver">Receiver</option>
                            <option value="defender">Defender</option>
                            <option value="flex">Flex</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Player Tag</label>
                          <select 
                            className="form-select"
                            value={createForm.playerTag}
                            onChange={(e) => setCreateForm({...createForm, playerTag: e.target.value})}
                          >
                            <option value="free-agent">Free Agent</option>
                            <option value="draft-pick">Draft Pick</option>
                            <option value="prospect">Prospect</option>
                            <option value="meet-greet">Meet & Greet</option>
                            <option value="client">Client</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* Coach Specific Fields */}
                    {type === 'coach' && (
                      <>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Experience *</label>
                          <input 
                            type="text"
                            className="form-control"
                            placeholder="e.g., 5 years coaching high school"
                            value={createForm.experience}
                            onChange={(e) => setCreateForm({...createForm, experience: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Coaching Level</label>
                          <select 
                            className="form-select"
                            value={createForm.coachingLevel}
                            onChange={(e) => setCreateForm({...createForm, coachingLevel: e.target.value})}
                          >
                            <option value="volunteer">Volunteer</option>
                            <option value="assistant">Assistant</option>
                            <option value="head">Head Coach</option>
                            <option value="coordinator">Coordinator</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Certifications</label>
                          <input 
                            type="text"
                            className="form-control"
                            placeholder="Comma separated (e.g., CPR, First Aid)"
                            value={createForm.certifications}
                            onChange={(e) => setCreateForm({...createForm, certifications: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Specialties</label>
                          <input 
                            type="text"
                            className="form-control"
                            placeholder="Comma separated (e.g., Offense, Defense)"
                            value={createForm.specialties}
                            onChange={(e) => setCreateForm({...createForm, specialties: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Max Teams</label>
                          <input 
                            type="number"
                            className="form-control"
                            min="1"
                            max="5"
                            value={createForm.maxTeams}
                            onChange={(e) => setCreateForm({...createForm, maxTeams: parseInt(e.target.value)})}
                          />
                        </div>
                      </>
                    )}

                    {/* Emergency Contact */}
                    <div className="col-12">
                      <h6 className="border-bottom pb-2 mb-3">Emergency Contact</h6>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Emergency Contact Name</label>
                      <input 
                        type="text"
                        className="form-control"
                        value={createForm.emergencyContactName}
                        onChange={(e) => setCreateForm({...createForm, emergencyContactName: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Emergency Contact Phone</label>
                      <input 
                        type="tel"
                        className="form-control"
                        value={createForm.emergencyContactPhone}
                        onChange={(e) => setCreateForm({...createForm, emergencyContactPhone: e.target.value})}
                      />
                    </div>

                    {/* Medical Information */}
                    {type === 'player' && (
                      <>
                        <div className="col-12">
                          <h6 className="border-bottom pb-2 mb-3">Medical Information</h6>
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label">Medical Conditions</label>
                          <textarea 
                            className="form-control"
                            rows={3}
                            placeholder="Any medical conditions, allergies, or medications..."
                            value={createForm.medicalConditions}
                            onChange={(e) => setCreateForm({...createForm, medicalConditions: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.phone || !createForm.dateOfBirth}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Create {type === 'player' ? 'Player' : 'Coach'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
