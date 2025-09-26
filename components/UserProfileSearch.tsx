'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/firestore-schema';

interface UserProfileSearchProps {
  onProfileSelect?: (profile: UserProfile) => void;
}

export default function UserProfileSearch({ onProfileSelect }: UserProfileSearchProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

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
      <div className="card">
        <div className="card-header">
          <h4 className="card-title mb-0">User Profile Management</h4>
          <p className="text-muted mb-0">Search and manage user profiles</p>
        </div>
        <div className="card-body">
          <p>User profiles will be displayed here.</p>
          <p>Found {profiles.length} profiles.</p>
        </div>
      </div>
    </div>
  );
}
