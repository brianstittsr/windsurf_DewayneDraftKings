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
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodes, setQRCodes] = useState<{ profile?: string; contact?: string }>({});

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
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading profiles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="player">Players</option>
              <option value="coach">Coaches</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchProfiles}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Showing {filteredProfiles.length} of {profiles.length} profiles
        </p>
      </div>

      {/* Profiles Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Jersey: {profile.jerseySize}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{profile.email}</div>
                    <div className="text-sm text-gray-500">{profile.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      profile.role === 'player' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {profile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={profile.status}
                      onChange={(e) => updateProfileStatus(profile.id!, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 ${
                        profile.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : profile.status === 'inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      profile.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {profile.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openProfileModal(profile)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onProfileSelect?.(profile)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Detail Modal */}
      {showQRModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedProfile.firstName} {selectedProfile.lastName}
                </h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Profile Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Email:</span> {selectedProfile.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedProfile.phone}</p>
                    <p><span className="font-medium">Role:</span> {selectedProfile.role}</p>
                    <p><span className="font-medium">Jersey Size:</span> {selectedProfile.jerseySize}</p>
                    <p><span className="font-medium">Status:</span> {selectedProfile.status}</p>
                    <p><span className="font-medium">Payment:</span> {selectedProfile.paymentStatus}</p>
                  </div>
                </div>

                {/* QR Codes */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">QR Codes</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Profile QR</span>
                        <button
                          onClick={() => generateQRCode(selectedProfile.id!, 'profile')}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          Generate
                        </button>
                      </div>
                      {qrCodes.profile && (
                        <img src={qrCodes.profile} alt="Profile QR" className="w-32 h-32 border" />
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Contact QR</span>
                        <button
                          onClick={() => generateQRCode(selectedProfile.id!, 'contact')}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                        >
                          Generate
                        </button>
                      </div>
                      {qrCodes.contact && (
                        <img src={qrCodes.contact} alt="Contact QR" className="w-32 h-32 border" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration PDF */}
              {selectedProfile.registrationPdfUrl && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Registration Document</h4>
                  <a
                    href={selectedProfile.registrationPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    📄 View PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
