'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModernNavbar from '@/components/ModernNavbar';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: 'player',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    position: 'flex',
    playerTag: 'free-agent',
    experience: '',
    coachingLevel: 'volunteer',
    certifications: '',
    specialties: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    maxTeams: 2
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // For now, just redirect to payment page
      // Firebase integration will be added later with dynamic imports
      const playerId = `temp_${Date.now()}`;
      router.push(`/payment/${playerId}?amount=50&type=${formData.role}`);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ModernNavbar />
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">Register for All Pro Sports</h3>
              </div>
              <div className="card-body">
                {message && (
                  <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Role Selection */}
                  <div className="mb-3">
                    <label className="form-label">I want to register as a:</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="player">Player</option>
                      <option value="coach">Coach</option>
                    </select>
                  </div>

                  {/* Basic Information */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Player-specific fields */}
                  {formData.role === 'player' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Position</label>
                        <select
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="flex">Flex</option>
                          <option value="forward">Forward</option>
                          <option value="midfielder">Midfielder</option>
                          <option value="defender">Defender</option>
                          <option value="goalkeeper">Goalkeeper</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Player Status</label>
                        <select
                          name="playerTag"
                          value={formData.playerTag}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="free-agent">Free Agent</option>
                          <option value="returning">Returning Player</option>
                          <option value="rookie">Rookie</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Coach-specific fields */}
                  {formData.role === 'coach' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Coaching Experience *</label>
                        <input
                          type="text"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="e.g., 5 years youth soccer"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Coaching Level</label>
                        <select
                          name="coachingLevel"
                          value={formData.coachingLevel}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="volunteer">Volunteer</option>
                          <option value="assistant">Assistant Coach</option>
                          <option value="head">Head Coach</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Certifications</label>
                        <textarea
                          name="certifications"
                          value={formData.certifications}
                          onChange={handleInputChange}
                          className="form-control"
                          rows={2}
                          placeholder="List any coaching certifications"
                        />
                      </div>
                    </>
                  )}

                  {/* Emergency Contact */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Emergency Contact Name</label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
