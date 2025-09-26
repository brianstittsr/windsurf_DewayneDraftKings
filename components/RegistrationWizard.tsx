'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RegistrationWizardProps {
  selectedPlan?: {
    plan: string;
    title: string;
    price: number;
    serviceFee: number;
    category: string;
    total: number;
  };
}

interface FormData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  
  // Step 2: Role-Specific Information
  jerseySize: string;
  position: string; // for players
  experience: string; // for coaches
  
  // Step 3: Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  
  // Step 4: Medical Information
  medicalConditions: string;
  medications: string;
  allergies: string;
  
  // Step 5: Preferences & Agreements
  preferredCommunication: string;
  marketingConsent: boolean;
  disclosureRead: boolean;
  waiverAccepted: boolean;
  termsAccepted: boolean;
}

interface ConfigOption {
  value: string;
  label: string;
}

interface RegistrationConfig {
  jerseySizes: ConfigOption[];
  playerPositions: ConfigOption[];
  emergencyRelations: ConfigOption[];
  communicationMethods: ConfigOption[];
}

const STEPS = [
  { id: 1, title: 'Personal Info', icon: 'fas fa-user' },
  { id: 2, title: 'Role Details', icon: 'fas fa-football-ball' },
  { id: 3, title: 'Emergency Contact', icon: 'fas fa-phone' },
  { id: 4, title: 'Medical Info', icon: 'fas fa-heartbeat' },
  { id: 5, title: 'Preferences', icon: 'fas fa-check-circle' },
  { id: 6, title: 'Payment', icon: 'fas fa-credit-card' }
];

// Validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  // Check if it's 10 digits (US format) or 11 digits (with country code)
  return cleanPhone.length === 10 || (cleanPhone.length === 11 && cleanPhone.startsWith('1'));
};

export default function RegistrationWizard({ selectedPlan }: RegistrationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [config, setConfig] = useState<RegistrationConfig>({
    jerseySizes: [],
    playerPositions: [],
    emergencyRelations: [],
    communicationMethods: []
  });
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    jerseySize: 'M',
    position: 'flex',
    experience: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    preferredCommunication: 'email',
    marketingConsent: false,
    disclosureRead: false,
    waiverAccepted: false,
    termsAccepted: false,
  });

  // Fetch configuration options from API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/registration/config');
        const data = await response.json();
        
        if (data.success) {
          setConfig(data.config);
          // Set default values based on fetched config
          setFormData(prev => ({
            ...prev,
            jerseySize: data.config.jerseySizes[0]?.value || 'M',
            position: data.config.playerPositions[0]?.value || 'flex',
            preferredCommunication: data.config.communicationMethods[0]?.value || 'email'
          }));
        } else {
          setConfigError('Failed to load form configuration');
        }
      } catch (error) {
        console.error('Error fetching registration config:', error);
        setConfigError('Unable to load form options');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.firstName && 
          formData.lastName && 
          formData.email && 
          isValidEmail(formData.email) &&
          formData.phone && 
          isValidPhone(formData.phone)
        );
      case 2:
        return !!(formData.jerseySize);
      case 3:
        return !!(
          formData.emergencyContactName && 
          formData.emergencyContactPhone && 
          isValidPhone(formData.emergencyContactPhone)
        );
      case 4:
        return true; // Medical info is optional
      case 5:
        return !!(formData.disclosureRead && formData.waiverAccepted && formData.termsAccepted);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      } else {
        // Proceed to payment
        handleSubmit();
      }
    } else {
      alert('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Create player profile
      const response = await fetch('/api/registration/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          selectedPlan,
          registrationSource: 'registration_wizard'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect to checkout with player ID and pricing details
        const params = new URLSearchParams({
          playerId: result.playerId,
          plan: selectedPlan?.plan || 'basic',
          title: selectedPlan?.title || 'Registration Plan',
          price: selectedPlan?.price?.toString() || '0',
          category: selectedPlan?.category || 'player'
        });
        router.push(`/checkout?${params.toString()}`);
      } else {
        throw new Error('Failed to create profile');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('There was an error processing your registration. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="row g-3">
            <div className="col-12">
              <h5 className="text-primary mb-3">
                <i className="fas fa-user me-2"></i>
                Personal Information
              </h5>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-control"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-control"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className={`form-control ${
                  formData.email && !isValidEmail(formData.email) ? 'is-invalid' : 
                  formData.email && isValidEmail(formData.email) ? 'is-valid' : ''
                }`}
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                placeholder="example@email.com"
                required
              />
              {formData.email && !isValidEmail(formData.email) && (
                <div className="invalid-feedback">
                  Please enter a valid email address.
                </div>
              )}
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className={`form-control ${
                  formData.phone && !isValidPhone(formData.phone) ? 'is-invalid' : 
                  formData.phone && isValidPhone(formData.phone) ? 'is-valid' : ''
                }`}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                pattern="[\+]?[1]?[\-\.\s]?[\(]?[0-9]{3}[\)]?[\-\.\s]?[0-9]{3}[\-\.\s]?[0-9]{4}"
                placeholder="(555) 123-4567"
                required
              />
              {formData.phone && !isValidPhone(formData.phone) && (
                <div className="invalid-feedback">
                  Please enter a valid phone number (e.g., (555) 123-4567).
                </div>
              )}
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="row g-3">
            <div className="col-12">
              <h5 className="text-primary mb-3">
                <i className="fas fa-football-ball me-2"></i>
                Role-Specific Information
              </h5>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Jersey Size *</label>
              <select
                className="form-select"
                name="jerseySize"
                value={formData.jerseySize}
                onChange={handleInputChange}
                required
              >
                {config.jerseySizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedPlan?.category === 'player' && (
              <div className="col-md-6">
                <label className="form-label">Preferred Position</label>
                <select
                  className="form-select"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                >
                  {config.playerPositions.map((position) => (
                    <option key={position.value} value={position.value}>
                      {position.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedPlan?.category === 'coach' && (
              <div className="col-12">
                <label className="form-label">Coaching Experience</label>
                <textarea
                  className="form-control"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Please describe your coaching experience, certifications, and background..."
                />
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="row g-3">
            <div className="col-12">
              <h5 className="text-primary mb-3">
                <i className="fas fa-phone me-2"></i>
                Emergency Contact Information
              </h5>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Emergency Contact Name *</label>
              <input
                type="text"
                className="form-control"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Emergency Contact Phone *</label>
              <input
                type="tel"
                className={`form-control ${
                  formData.emergencyContactPhone && !isValidPhone(formData.emergencyContactPhone) ? 'is-invalid' : 
                  formData.emergencyContactPhone && isValidPhone(formData.emergencyContactPhone) ? 'is-valid' : ''
                }`}
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                pattern="[\+]?[1]?[\-\.\s]?[\(]?[0-9]{3}[\)]?[\-\.\s]?[0-9]{3}[\-\.\s]?[0-9]{4}"
                placeholder="(555) 123-4567"
                required
              />
              {formData.emergencyContactPhone && !isValidPhone(formData.emergencyContactPhone) && (
                <div className="invalid-feedback">
                  Please enter a valid phone number (e.g., (555) 123-4567).
                </div>
              )}
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Relationship</label>
              <select
                className="form-select"
                name="emergencyContactRelation"
                value={formData.emergencyContactRelation}
                onChange={handleInputChange}
              >
                <option value="">Select relationship</option>
                {config.emergencyRelations.map((relation) => (
                  <option key={relation.value} value={relation.value}>
                    {relation.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="row g-3">
            <div className="col-12">
              <h5 className="text-primary mb-3">
                <i className="fas fa-heartbeat me-2"></i>
                Medical Information
              </h5>
              <p className="text-muted">Please provide any medical information that may be relevant for emergency situations.</p>
            </div>
            
            <div className="col-12">
              <label className="form-label">Medical Conditions</label>
              <textarea
                className="form-control"
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleInputChange}
                rows={3}
                placeholder="List any medical conditions we should be aware of..."
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Current Medications</label>
              <textarea
                className="form-control"
                name="medications"
                value={formData.medications}
                onChange={handleInputChange}
                rows={2}
                placeholder="List current medications..."
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Allergies</label>
              <textarea
                className="form-control"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                rows={2}
                placeholder="List any allergies..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="row g-3">
            <div className="col-12">
              <h5 className="text-primary mb-3">
                <i className="fas fa-check-circle me-2"></i>
                Preferences & Agreements
              </h5>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Preferred Communication Method</label>
              <select
                className="form-select"
                name="preferredCommunication"
                value={formData.preferredCommunication}
                onChange={handleInputChange}
              >
                {config.communicationMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Disclosure Document */}
            <div className="col-12 mt-4">
              <div className="card border-info">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    Important Disclosure & Information
                  </h6>
                </div>
                <div className="card-body" style={{maxHeight: '300px', overflowY: 'auto'}}>
                  <div className="small">
                    <h6 className="text-primary">Liability and Risk Acknowledgment</h6>
                    <p className="mb-3">
                      Participation in All Pro Sports activities involves inherent risks including but not limited to: 
                      physical injury, property damage, and other unforeseen circumstances. By registering, you acknowledge 
                      these risks and agree to participate at your own risk.
                    </p>

                    <h6 className="text-primary">Medical Information</h6>
                    <p className="mb-3">
                      Participants are required to disclose any medical conditions that may affect their ability to 
                      participate safely. All Pro Sports reserves the right to require medical clearance before participation.
                    </p>

                    <h6 className="text-primary">Code of Conduct</h6>
                    <p className="mb-3">
                      All participants must adhere to our code of conduct which includes: respectful behavior toward 
                      all participants, coaches, and staff; following all safety guidelines; and maintaining good 
                      sportsmanship at all times.
                    </p>

                    <h6 className="text-primary">Payment and Refund Policy</h6>
                    <p className="mb-3">
                      Registration fees are due at time of registration. Refunds are available up to 7 days before 
                      the season start date. After this period, partial refunds may be available at management discretion.
                    </p>

                    <h6 className="text-primary">Photography and Media</h6>
                    <p className="mb-3">
                      All Pro Sports may photograph or record activities for promotional purposes. By registering, 
                      you consent to the use of your likeness in promotional materials.
                    </p>

                    <h6 className="text-primary">Emergency Contact</h6>
                    <p className="mb-3">
                      Emergency contact information must be accurate and current. This person will be contacted 
                      in case of injury or emergency during activities.
                    </p>

                    <h6 className="text-primary">Equipment and Safety</h6>
                    <p className="mb-0">
                      Participants are responsible for wearing appropriate athletic attire and any required safety 
                      equipment. All Pro Sports provides jerseys but participants must provide their own cleats 
                      and protective gear as needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-12 mt-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="disclosureRead"
                  checked={formData.disclosureRead}
                  onChange={handleInputChange}
                  required
                />
                <label className="form-check-label">
                  <strong>I have read and understand the above disclosure information. *</strong>
                </label>
              </div>
            </div>
            
            <div className="col-12 mt-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="marketingConsent"
                  checked={formData.marketingConsent}
                  onChange={handleInputChange}
                />
                <label className="form-check-label">
                  I would like to receive promotional emails and updates about All Pro Sports events and programs.
                </label>
              </div>
            </div>
            
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="waiverAccepted"
                  checked={formData.waiverAccepted}
                  onChange={handleInputChange}
                  required
                />
                <label className="form-check-label">
                  <strong>I acknowledge and accept the liability waiver and release of claims. *</strong>
                </label>
              </div>
            </div>
            
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  required
                />
                <label className="form-check-label">
                  <strong>I agree to the Terms and Conditions and Privacy Policy. *</strong>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mt-5 pt-4">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div className="card">
              <div className="card-body py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Loading Registration Form...</h5>
                <p className="text-muted">Please wait while we prepare your registration options.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (configError) {
    return (
      <div className="container mt-5 pt-4">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card border-danger">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Configuration Error
                </h5>
              </div>
              <div className="card-body">
                <p className="mb-3">{configError}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-refresh me-2"></i>
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Plan Summary */}
          {selectedPlan && (
            <div className="card mb-4 border-primary">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-clipboard-list me-2"></i>
                  Selected Plan: {selectedPlan.title}
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Plan:</strong> {selectedPlan.title}</p>
                    <p className="mb-1"><strong>Category:</strong> {selectedPlan.category}</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <p className="mb-1">Plan Price: ${selectedPlan.price.toFixed(2)}</p>
                    <p className="mb-1">Service Fee: ${selectedPlan.serviceFee.toFixed(2)}</p>
                    <p className="mb-0 fw-bold">Total: ${selectedPlan.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="col-md-2 col-4 text-center mb-3">
                    <div className={`d-flex flex-column align-items-center ${
                      currentStep === step.id ? 'text-primary' : 
                      currentStep > step.id ? 'text-success' : 'text-muted'
                    }`}>
                      <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                        currentStep === step.id ? 'bg-primary text-white' :
                        currentStep > step.id ? 'bg-success text-white' : 'bg-light'
                      }`} style={{ width: '40px', height: '40px' }}>
                        {currentStep > step.id ? (
                          <i className="fas fa-check"></i>
                        ) : (
                          <i className={step.icon}></i>
                        )}
                      </div>
                      <small className="fw-bold">{step.title}</small>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className="d-none d-md-block position-absolute" 
                           style={{ 
                             top: '20px', 
                             left: '50%', 
                             width: '100%', 
                             height: '2px', 
                             backgroundColor: currentStep > step.id ? '#28a745' : '#dee2e6',
                             zIndex: -1 
                           }}>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}
              </h4>
            </div>
            <div className="card-body">
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Previous
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={nextStep}
                    >
                      {currentStep === 6 ? (
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
