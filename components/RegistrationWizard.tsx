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
  waiverAccepted: boolean;
  termsAccepted: boolean;
}

const STEPS = [
  { id: 1, title: 'Personal Info', icon: 'fas fa-user' },
  { id: 2, title: 'Role Details', icon: 'fas fa-football-ball' },
  { id: 3, title: 'Emergency Contact', icon: 'fas fa-phone' },
  { id: 4, title: 'Medical Info', icon: 'fas fa-heartbeat' },
  { id: 5, title: 'Preferences', icon: 'fas fa-check-circle' },
  { id: 6, title: 'Payment', icon: 'fas fa-credit-card' }
];

export default function RegistrationWizard({ selectedPlan }: RegistrationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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
    waiverAccepted: false,
    termsAccepted: false,
  });

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
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone);
      case 2:
        return !!(formData.jerseySize);
      case 3:
        return !!(formData.emergencyContactName && formData.emergencyContactPhone);
      case 4:
        return true; // Medical info is optional
      case 5:
        return !!(formData.waiverAccepted && formData.termsAccepted);
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
        // Redirect to checkout with player ID
        router.push(`/checkout?playerId=${result.playerId}&plan=${selectedPlan?.plan || 'basic'}`);
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
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
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
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
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
                  <option value="flex">Flexible</option>
                  <option value="offense">Offense</option>
                  <option value="defense">Defense</option>
                  <option value="quarterback">Quarterback</option>
                  <option value="receiver">Receiver</option>
                  <option value="rusher">Rusher</option>
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
                className="form-control"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                required
              />
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
                <option value="parent">Parent</option>
                <option value="guardian">Guardian</option>
                <option value="spouse">Spouse</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
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
                <option value="email">Email</option>
                <option value="sms">SMS/Text</option>
                <option value="phone">Phone Call</option>
                <option value="both">Email & SMS</option>
              </select>
            </div>
            
            <div className="col-12 mt-4">
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
