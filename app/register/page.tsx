'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModernNavbar from '@/components/ModernNavbar';

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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

  const totalSteps = 4;

  const stepTitles = [
    'Role Selection',
    'Personal Information', 
    'Sport Details',
    'Emergency Contact'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.role !== '';
      case 2:
        return formData.firstName !== '' && formData.lastName !== '' && 
               formData.phone !== '' && formData.email !== '' && formData.dateOfBirth !== '';
      case 3:
        if (formData.role === 'coach') {
          return formData.experience !== '';
        }
        return true; // Player sport details are optional
      case 4:
        return true; // Emergency contact is optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      nextStep();
      setMessage('');
    } else {
      setMessage('Please fill in all required fields before continuing.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Redirect to payment page with registration data
      const playerId = `temp_${Date.now()}`;
      const queryParams = new URLSearchParams({
        registration: encodeURIComponent(JSON.stringify(formData))
      });
      
      router.push(`/payment/${playerId}?${queryParams.toString()}`);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="text-center mb-4">
              <i className="fas fa-user-tag fa-3x text-primary mb-3"></i>
              <h4>Choose Your Role</h4>
              <p className="text-muted">Select how you'd like to participate in All Pro Sports</p>
            </div>
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="row">
                  <div className="col-6">
                    <div 
                      className={`card h-100 role-card ${formData.role === 'player' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'player' }))}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center">
                        <i className="fas fa-running fa-2x text-primary mb-3"></i>
                        <h5>Player</h5>
                        <p className="text-muted small">Join as a player and compete in games</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div 
                      className={`card h-100 role-card ${formData.role === 'coach' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'coach' }))}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center">
                        <i className="fas fa-whistle fa-2x text-primary mb-3"></i>
                        <h5>Coach</h5>
                        <p className="text-muted small">Lead and mentor a team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="text-center mb-4">
              <i className="fas fa-id-card fa-3x text-primary mb-3"></i>
              <h4>Personal Information</h4>
              <p className="text-muted">Tell us about yourself</p>
            </div>
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
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="text-center mb-4">
              <i className={`fas ${formData.role === 'player' ? 'fa-futbol' : 'fa-clipboard-list'} fa-3x text-primary mb-3`}></i>
              <h4>{formData.role === 'player' ? 'Player Details' : 'Coaching Experience'}</h4>
              <p className="text-muted">
                {formData.role === 'player' 
                  ? 'Share your playing preferences' 
                  : 'Tell us about your coaching background'
                }
              </p>
            </div>
            
            {formData.role === 'player' ? (
              <>
                <div className="mb-3">
                  <label className="form-label">Preferred Position</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="flex">Flex (Any Position)</option>
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
            ) : (
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
                    rows={3}
                    placeholder="List any coaching certifications or relevant qualifications"
                  />
                </div>
              </>
            )}
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="text-center mb-4">
              <i className="fas fa-phone fa-3x text-primary mb-3"></i>
              <h4>Emergency Contact</h4>
              <p className="text-muted">Optional but recommended for safety</p>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Full name"
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
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Review your information:</strong>
              <ul className="mb-0 mt-2">
                <li>Role: <strong>{formData.role === 'player' ? 'Player' : 'Coach'}</strong></li>
                <li>Name: <strong>{formData.firstName} {formData.lastName}</strong></li>
                <li>Email: <strong>{formData.email}</strong></li>
                <li>Phone: <strong>{formData.phone}</strong></li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
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
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">Register for All Pro Sports</h3>
                  <span className="badge bg-light text-primary">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="progress" style={{ height: '4px', borderRadius: 0 }}>
                <div 
                  className="progress-bar bg-primary" 
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>

              {/* Step Navigation */}
              <div className="card-body pb-2">
                <div className="row text-center mb-4">
                  {stepTitles.map((title, index) => (
                    <div key={index} className="col">
                      <div className={`step-indicator ${currentStep > index + 1 ? 'completed' : currentStep === index + 1 ? 'active' : ''}`}>
                        <div className="step-number">
                          {currentStep > index + 1 ? (
                            <i className="fas fa-check"></i>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="step-title">{title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-body pt-0">
                {message && (
                  <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                  </div>
                )}
                
                <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                  {/* Render current step content */}
                  {renderStepContent()}

                  {/* Navigation Buttons */}
                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className={`btn btn-outline-secondary ${currentStep === 1 ? 'invisible' : ''}`}
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Previous
                    </button>
                    
                    <button
                      type="submit"
                      className={`btn ${currentStep === totalSteps ? 'btn-success' : 'btn-primary'}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : currentStep === totalSteps ? (
                        <>
                          <i className="fas fa-credit-card me-2"></i>
                          Continue to Payment
                        </>
                      ) : (
                        <>
                          Next
                          <i className="fas fa-arrow-right ms-2"></i>
                        </>
                      )}
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
