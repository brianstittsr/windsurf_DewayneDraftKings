'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ModernNavbar from '../../components/ModernNavbar';

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    jerseySize: 'M',
    position: 'flex', // for players
    experience: '', // for coaches
  });

  useEffect(() => {
    // Get plan data from URL parameters
    const plan = searchParams.get('plan');
    const title = searchParams.get('title');
    const price = searchParams.get('price');
    const serviceFee = searchParams.get('serviceFee');
    const category = searchParams.get('category');

    if (plan && title && price && serviceFee && category) {
      setSelectedPlan({
        plan,
        title,
        price: parseFloat(price),
        serviceFee: parseFloat(serviceFee),
        category,
        total: parseFloat(price) + parseFloat(serviceFee)
      });
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // Here you would typically send the data to your API
    console.log('Registration data:', { ...formData, selectedPlan });
    
    // For now, just show a success message
    alert('Registration submitted successfully! You will receive a confirmation email shortly.');
  };

  return (
    <>
      <ModernNavbar />
      
      <div className="container mt-5 pt-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
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

            {/* Registration Form */}
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">
                  <i className="fas fa-user-plus me-2"></i>
                  Registration Form
                </h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Personal Information */}
                    <div className="col-12">
                      <h6 className="text-primary mb-3">Personal Information</h6>
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
                      <label className="form-label">Email *</label>
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
                      <label className="form-label">Phone *</label>
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
                    
                    <div className="col-md-6">
                      <label className="form-label">Jersey Size</label>
                      <select
                        className="form-select"
                        name="jerseySize"
                        value={formData.jerseySize}
                        onChange={handleInputChange}
                      >
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>

                    {/* Player/Coach Specific Fields */}
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
                      <div className="col-md-6">
                        <label className="form-label">Coaching Experience</label>
                        <input
                          type="text"
                          className="form-control"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          placeholder="Years of experience, certifications, etc."
                        />
                      </div>
                    )}

                    {/* Emergency Contact */}
                    <div className="col-12 mt-4">
                      <h6 className="text-primary mb-3">Emergency Contact</h6>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Emergency Contact Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Medical Information */}
                    <div className="col-12 mt-4">
                      <h6 className="text-primary mb-3">Medical Information</h6>
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Medical Conditions or Allergies</label>
                      <textarea
                        className="form-control"
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Please list any medical conditions, allergies, or medications we should be aware of..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 mt-4">
                      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button type="button" className="btn btn-outline-secondary me-md-2">
                          <i className="fas fa-arrow-left me-2"></i>
                          Back to Pricing
                        </button>
                        <button type="submit" className="btn btn-primary">
                          <i className="fas fa-credit-card me-2"></i>
                          Continue to Payment
                        </button>
                      </div>
                    </div>
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
