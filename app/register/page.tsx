'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ModernNavbar from '@/components/ModernNavbar';
import { 
  validateEmail, 
  validatePhone, 
  validateName, 
  validateDateOfBirth,
  validateEmergencyPhone
} from '@/lib/validation';

// Phone number formatting utility
const formatPhoneNumber = (digits: string): string => {
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
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
    jerseySize: 'M',
    coachingLevel: 'volunteer',
    certifications: '',
    specialties: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    maxTeams: 2,
    waiverAccepted: false,
    parentGuardianName: '',
    parentGuardianSignature: '',
    waiverSignatureDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const totalSteps = 5;

  // Load selected plan from URL parameters
  useEffect(() => {
    const planParam = searchParams.get('plan');
    const roleParam = searchParams.get('role');
    
    if (planParam) {
      try {
        const plan = JSON.parse(planParam);
        setSelectedPlan(plan);
        
        // Set role from pricing page selection
        if (roleParam) {
          setFormData(prev => ({ ...prev, role: roleParam }));
        }
      } catch (error) {
        console.error('Error parsing plan data:', error);
      }
    }
  }, [searchParams]);

  const stepTitles = [
    'Role Selection',
    'Personal Information', 
    'Sport Details',
    'Emergency Contact',
    'Waiver & Release'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Format phone numbers as user types
    let formattedValue = value;
    if (name === 'phone' || name === 'emergencyContactPhone') {
      // Allow only digits, spaces, parentheses, and hyphens
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 11) {
        formattedValue = formatPhoneNumber(digitsOnly);
      } else {
        return; // Don't update if too many digits
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
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
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.role) {
          errors.role = 'Please select a role';
        }
        break;
        
      case 2:
        // Validate first name
        const firstNameResult = validateName(formData.firstName, 'First name');
        if (!firstNameResult.isValid) {
          errors.firstName = firstNameResult.error!;
        }
        
        // Validate last name
        const lastNameResult = validateName(formData.lastName, 'Last name');
        if (!lastNameResult.isValid) {
          errors.lastName = lastNameResult.error!;
        }
        
        // Validate email
        const emailResult = validateEmail(formData.email);
        if (!emailResult.isValid) {
          errors.email = emailResult.error!;
        }
        
        // Validate phone
        const phoneResult = validatePhone(formData.phone);
        if (!phoneResult.isValid) {
          errors.phone = phoneResult.error!;
        }
        
        // Validate date of birth
        const dobResult = validateDateOfBirth(formData.dateOfBirth);
        if (!dobResult.isValid) {
          errors.dateOfBirth = dobResult.error!;
        }
        break;
        
      case 3:
        if (formData.role === 'coach' && !formData.experience.trim()) {
          errors.experience = 'Experience is required for coaches';
        }
        break;
        
      case 4:
        // Validate emergency contact if provided
        if (formData.emergencyContactPhone) {
          const emergencyPhoneResult = validateEmergencyPhone(formData.emergencyContactPhone);
          if (!emergencyPhoneResult.isValid) {
            errors.emergencyContactPhone = emergencyPhoneResult.error!;
          }
          
          if (!formData.emergencyContactName.trim()) {
            errors.emergencyContactName = 'Emergency contact name is required when phone is provided';
          }
        }
        break;
        
      case 5:
        if (!formData.waiverAccepted) {
          errors.waiverAccepted = 'You must accept the waiver to continue';
        }
        
        const parentNameResult = validateName(formData.parentGuardianName, 'Parent/Guardian name');
        if (!parentNameResult.isValid) {
          errors.parentGuardianName = parentNameResult.error!;
        }
        
        if (!formData.parentGuardianSignature.trim()) {
          errors.parentGuardianSignature = 'Digital signature is required';
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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
      // Redirect to checkout page with registration and plan data
      const registrationData = {
        ...formData,
        selectedPlan: selectedPlan
      };
      
      const queryParams = new URLSearchParams({
        registration: encodeURIComponent(JSON.stringify(registrationData))
      });
      
      router.push(`/checkout?${queryParams.toString()}`);
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
                  className={`form-control ${fieldErrors.firstName ? 'is-invalid' : ''}`}
                  required
                />
                {fieldErrors.firstName && (
                  <div className="invalid-feedback">{fieldErrors.firstName}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`form-control ${fieldErrors.lastName ? 'is-invalid' : ''}`}
                  required
                />
                {fieldErrors.lastName && (
                  <div className="invalid-feedback">{fieldErrors.lastName}</div>
                )}
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
                  className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`}
                  placeholder="(555) 123-4567"
                  required
                />
                {fieldErrors.phone && (
                  <div className="invalid-feedback">{fieldErrors.phone}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                  placeholder="your.email@example.com"
                  required
                />
                {fieldErrors.email && (
                  <div className="invalid-feedback">{fieldErrors.email}</div>
                )}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={`form-control ${fieldErrors.dateOfBirth ? 'is-invalid' : ''}`}
                required
              />
              {fieldErrors.dateOfBirth && (
                <div className="invalid-feedback">{fieldErrors.dateOfBirth}</div>
              )}
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
                  <label htmlFor="playerTag" className="form-label">Player Status</label>
                  <select 
                    id="playerTag"
                    name="playerTag" 
                    className="form-select" 
                    value={formData.playerTag}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="free-agent">Free Agent</option>
                    <option value="returning">Returning Player</option>
                    <option value="rookie">Rookie</option>
                    <option value="veteran">Veteran</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="jerseySize" className="form-label">Jersey Size</label>
                  <select 
                    id="jerseySize"
                    name="jerseySize" 
                    className="form-select" 
                    value={formData.jerseySize}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="XS">Extra Small (XS)</option>
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">2X Large (XXL)</option>
                    <option value="XXXL">3X Large (XXXL)</option>
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
                  className={`form-control ${fieldErrors.emergencyContactName ? 'is-invalid' : ''}`}
                  placeholder="Full name"
                />
                {fieldErrors.emergencyContactName && (
                  <div className="invalid-feedback">{fieldErrors.emergencyContactName}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  className={`form-control ${fieldErrors.emergencyContactPhone ? 'is-invalid' : ''}`}
                  placeholder="(555) 123-4567"
                />
                {fieldErrors.emergencyContactPhone && (
                  <div className="invalid-feedback">{fieldErrors.emergencyContactPhone}</div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <div className="text-center mb-4">
              <i className="fas fa-file-signature fa-3x text-primary mb-3"></i>
              <h4>Waiver & Release of Liability</h4>
              <p className="text-muted">Required for participation in All Pro Sports activities</p>
            </div>
            
            <div className="waiver-document bg-light p-4 mb-4" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px' }}>
              <h5 className="text-center mb-4"><strong>All Pro Sports Minor Participant Waiver & Release of Liability</strong></h5>
              
              <div className="mb-3">
                <strong>Participant Name (Minor):</strong> {formData.firstName} {formData.lastName}<br/>
                <strong>Date of Birth:</strong> {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </div>

              <div className="waiver-section mb-3">
                <h6><strong>1. Acknowledgement of Risks</strong></h6>
                <p className="small">I, the undersigned parent or legal guardian, acknowledge that participation in flag football and related activities (including practices, games, training, and events) organized by All Pro Sports involves inherent risks. These risks include, but are not limited to, physical injury, illness, collisions, falls, concussions, equipment malfunction, weather conditions, and in rare cases, permanent disability or death.</p>
              </div>

              <div className="waiver-section mb-3">
                <h6><strong>2. Assumption of Risk</strong></h6>
                <p className="small">I voluntarily allow my child to participate in All Pro Sports activities, fully accepting and assuming all risks, known and unknown, including those arising from the negligence of All Pro Sports, its owners, staff, volunteers, referees, or affiliates.</p>
              </div>

              <div className="waiver-section mb-3">
                <h6><strong>3. Release of Liability</strong></h6>
                <p className="small">In consideration for my child's participation, I hereby release, discharge, and hold harmless All Pro Sports, its directors, officers, employees, volunteers, coaches, referees, sponsors, partners, and affiliates from any and all liability, claims, demands, or causes of action, whether in law or equity, arising out of or related to any injury, illness, disability, or death sustained by my child while participating. This release includes any financial obligations, medical costs, damages, or losses incurred, even if caused by negligence.</p>
              </div>

              <div className="waiver-section mb-3">
                <h6><strong>4. Medical Treatment</strong></h6>
                <p className="small">I grant permission to All Pro Sports staff and medical personnel to administer emergency care and/or arrange for transport to a medical facility if necessary. I agree to be financially responsible for any medical treatment and related expenses.</p>
              </div>

              <div className="waiver-section mb-3">
                <h6><strong>5. Insurance</strong></h6>
                <p className="small">I understand that All Pro Sports does not provide medical or accident insurance for participants. I certify that my child has adequate health insurance coverage.</p>
              </div>

              <div className="waiver-section mb-3">
                <h6><strong>6. Photo/Media Release</strong></h6>
                <p className="small">I grant permission for my child's image, likeness, and voice to be recorded, photographed, or otherwise captured during All Pro Sports activities, and for such media to be used in promotional materials, websites, or social media without compensation.</p>
              </div>

              <div className="waiver-section mb-3">
                <h6><strong>7. Code of Conduct</strong></h6>
                <p className="small">I agree that my child will follow all league rules, show respect to referees, coaches, teammates, and opponents, and uphold the standards of good sportsmanship.</p>
              </div>

              <div className="waiver-section mb-3">
                <h6><strong>8. Acknowledgement of Understanding</strong></h6>
                <p className="small">I have read this waiver, fully understand its terms, and sign it freely and voluntarily. I acknowledge that I am giving up substantial rights, including the right to sue All Pro Sports for negligence.</p>
              </div>
            </div>

            <div className="signature-section">
              <div className="row mb-3">
                <div className="mb-3">
                  <label className="form-label">Parent/Guardian Name *</label>
                  <input
                    type="text"
                    name="parentGuardianName"
                    value={formData.parentGuardianName}
                    onChange={handleInputChange}
                    className={`form-control ${fieldErrors.parentGuardianName ? 'is-invalid' : ''}`}
                    placeholder="Full name of parent or legal guardian"
                    required
                  />
                  {fieldErrors.parentGuardianName && (
                    <div className="invalid-feedback">{fieldErrors.parentGuardianName}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Today's Date</label>
                  <input
                    type="date"
                    name="waiverSignatureDate"
                    value={formData.waiverSignatureDate || new Date().toISOString().split('T')[0]}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Digital Signature *</label>
                <input
                  type="text"
                  name="parentGuardianSignature"
                  value={formData.parentGuardianSignature}
                  onChange={handleInputChange}
                  className={`form-control signature-input ${fieldErrors.parentGuardianSignature ? 'is-invalid' : ''}`}
                  placeholder="Type your full name as your digital signature"
                  style={{ fontFamily: 'cursive', fontSize: '18px' }}
                  required
                />
                {fieldErrors.parentGuardianSignature && (
                  <div className="invalid-feedback">{fieldErrors.parentGuardianSignature}</div>
                )}
                <small className="form-text text-muted">By typing your name above, you are providing your legal digital signature.</small>
              </div>

              <div className="form-check mb-3">
                <input
                  className={`form-check-input ${fieldErrors.waiverAccepted ? 'is-invalid' : ''}`}
                  type="checkbox"
                  name="waiverAccepted"
                  checked={formData.waiverAccepted}
                  onChange={(e) => setFormData(prev => ({ ...prev, waiverAccepted: e.target.checked }))}
                  id="waiverAccepted"
                  required
                />
                <label className="form-check-label" htmlFor="waiverAccepted">
                  <strong>I have read, understood, and agree to the terms of this waiver and release of liability. I acknowledge that I am giving up substantial legal rights by signing this document.</strong>
                </label>
                {fieldErrors.waiverAccepted && (
                  <div className="invalid-feedback d-block">{fieldErrors.waiverAccepted}</div>
                )}
              </div>

              <div className="alert alert-warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Important:</strong> This waiver covers liability (including death), financial responsibility for medical expenses, waives the right to sue All Pro Sports and affiliates, grants photo/video release rights, and establishes code of conduct requirements.
              </div>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <>
        <ModernNavbar />
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
