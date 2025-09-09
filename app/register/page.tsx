'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { SMS_COLLECTIONS } from '@/lib/sms-schema';
import { COLLECTIONS } from '@/lib/firestore-schema';
import TwilioSMSService, { twilioService } from '@/lib/twilio-service';
import QRCode from 'qrcode';
import ModernNavbar from '@/components/ModernNavbar';
import PaymentCheckout from '@/components/PaymentCheckout';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    role: 'player', // New field for role selection
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    // Player-specific fields
    position: 'flex',
    playerTag: 'free-agent',
    // Coach-specific fields
    experience: '',
    coachingLevel: 'volunteer',
    certifications: '',
    specialties: '',
    // Common fields
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    referredBy: '',
    source: 'website'
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const searchParams = useSearchParams();
  const totalSteps = 6;

  const stepTitles = [
    'Registration Type',
    'Personal Information', 
    'Role-Specific Details',
    'Emergency & Medical',
    'Review & Submit',
    'Payment'
  ];

  useEffect(() => {
    const planParam = searchParams?.get('plan');
    const roleParam = searchParams?.get('role');
    
    if (planParam) {
      try {
        const planData = JSON.parse(planParam);
        setSelectedPlan(planData);
        
        if (roleParam) {
          setFormData(prev => ({
            ...prev,
            role: roleParam as 'player' | 'coach'
          }));
        }
      } catch (error) {
        console.error('Error parsing plan data:', error);
      }
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.role;
      case 2:
        return !!(formData.firstName && formData.lastName && formData.phone && formData.dateOfBirth);
      case 3:
        if (formData.role === 'coach') {
          return !!formData.experience;
        }
        return true;
      case 4:
        return !!(formData.emergencyContactName && formData.emergencyContactPhone);
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else {
      setError('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const proceedToPayment = () => {
    if (currentStep === 5) {
      setCurrentStep(6);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < totalSteps) {
      proceedToPayment();
      return;
    }
    
    setLoading(true);
    setError('');

    let entityId = '';
    
    try {
      // Validate required fields
      if (!TwilioSMSService.validatePhoneNumber(formData.phone)) {
        throw new Error('Please enter a valid phone number');
      }
      if (!formData.dateOfBirth) {
        throw new Error('Date of birth is required');
      }
      if (formData.role === 'coach' && !formData.experience) {
        throw new Error('Coaching experience is required for coaches');
      }
      if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
        throw new Error('Emergency contact information is required');
      }

      const formattedPhone = TwilioSMSService.formatPhoneNumber(formData.phone);
      const formattedEmergencyPhone = TwilioSMSService.formatPhoneNumber(formData.emergencyContactPhone);

      if (formData.role === 'player') {
        // Create player profile
        const playerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: Timestamp.fromDate(new Date(formData.dateOfBirth)),
          registrationDate: Timestamp.now(),
          registrationStatus: 'pending' as const,
          paymentStatus: 'pending' as const,
          playerTag: formData.playerTag as any,
          position: formData.position as any,
          teamId: null,
          isDrafted: false,
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
          },
          medicalInfo: formData.medicalConditions ? {
            conditions: formData.medicalConditions,
            lastUpdated: Timestamp.now(),
          } : undefined,
          stats: {
            gamesPlayed: 0,
            touchdowns: 0,
            yards: 0,
            tackles: 0,
            interceptions: 0,
            attendance: 0,
          },
          metrics: {
            currentWeight: 0,
            weighIns: [],
            workouts: [],
            totalWeightLoss: 0,
          },
          referredBy: formData.referredBy || null,
          referrals: [],
          referralRewards: 0,
          referralLevel: 0,
          qrCode: '',
          qrCodeUrl: '',
          funnelStatus: {
            currentStep: 0,
            lastInteraction: Timestamp.now(),
            isOptedOut: false,
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        // Save player to Firestore
        const playerRef = await addDoc(collection(db, COLLECTIONS.PLAYERS), playerData);
        
        // Generate QR code for player
        const qrCodeData = await QRCode.toDataURL(`${window.location.origin}/player/${playerRef.id}`);
        
        // Update player with QR code
        await fetch('/api/players/update-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: playerRef.id,
            qrCode: qrCodeData,
            qrCodeUrl: `${window.location.origin}/player/${playerRef.id}`
          })
        });
        
        entityId = playerRef.id;
      } else {
        // Create coach profile
        const coachData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: Timestamp.fromDate(new Date(formData.dateOfBirth)),
          registrationDate: Timestamp.now(),
          registrationStatus: 'pending' as const,
          isActive: true,
          experience: formData.experience,
          certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : [],
          specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
          coachingLevel: formData.coachingLevel as any,
          assignedTeams: [],
          maxTeams: 2,
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
          },
          stats: {
            seasonsCoached: 0,
            teamsCoached: 0,
            totalWins: 0,
            totalLosses: 0,
            championshipsWon: 0,
          },
          qrCode: '',
          qrCodeUrl: '',
          funnelStatus: {
            currentStep: 0,
            lastInteraction: Timestamp.now(),
            isOptedOut: false,
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        // Save coach to Firestore
        const coachRef = await addDoc(collection(db, COLLECTIONS.COACHES), coachData);
        
        // Generate QR code for coach
        const qrCodeData = await QRCode.toDataURL(`${window.location.origin}/coach/${coachRef.id}`);
        
        // Update coach with QR code (we'll need to create this endpoint)
        await fetch('/api/coaches/update-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coachId: coachRef.id,
            qrCode: qrCodeData,
            qrCodeUrl: `${window.location.origin}/coach/${coachRef.id}`
          })
        });
        
        entityId = coachRef.id;
      }
      
      // Create SMS subscriber
      const subscriberData = {
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        entityId: entityId,
        entityType: formData.role,
        isOptedIn: true,
        optInDate: Timestamp.now(),
        currentStep: 0,
        source: 'website' as const,
        totalMessagesSent: 0,
        totalMessagesDelivered: 0,
        totalReplies: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS), subscriberData);

      // Send welcome SMS
      const roleText = formData.role === 'player' ? 'player' : 'coach';
      await twilioService.sendSMS(
        formData.phone,
        `Welcome to All Pro Sports, ${formData.firstName}! 🏈 Your ${roleText} registration is complete. You'll receive updates about games, team news, and league announcements. Reply STOP to opt out.`
      );

      // Registration completed - payment will be handled in step 6
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <ModernNavbar />
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card dk-card">
                <div className="card-body p-4">
                  <div className="text-center py-5">
                    <div className="feature-icon mx-auto mb-4" style={{ background: 'var(--gradient-success)' }}>
                      <i className="fas fa-check"></i>
                    </div>
                    <h4 className="mb-3">Registration Successful!</h4>
                    <p className="text-muted mb-4">Welcome to All Pro Sports! You'll receive SMS updates and your player profile is now active.</p>
                    <button className="btn dk-btn-primary" onClick={() => window.location.href = '/'}>
                      <i className="fas fa-home me-2"></i>
                      Return Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <ModernNavbar />
      <div className="bg-gradient-primary py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle mb-4" style={{width: '80px', height: '80px'}}>
                <i className="fas fa-user-plus fa-2x text-primary"></i>
              </div>
              <h1 className="display-4 fw-bold text-primary mb-3">Join All Pro Sports</h1>
              <p className="lead text-primary mb-0">Register for our elite athletic league and get instant SMS updates</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-header bg-white border-0 p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                      <i className="fas fa-clipboard-list text-primary"></i>
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">Registration Wizard</h3>
                      <p className="text-muted mb-0">Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">{Math.round((currentStep / totalSteps) * 100)}% Complete</small>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="progress" style={{height: '4px'}}>
                    <div 
                      className="progress-bar bg-primary" 
                      role="progressbar" 
                      style={{width: `${(currentStep / totalSteps) * 100}%`}}
                      aria-valuenow={currentStep} 
                      aria-valuemin={1} 
                      aria-valuemax={totalSteps}
                    ></div>
                  </div>
                </div>
                
                {/* Step Indicators */}
                <div className="d-flex justify-content-between mt-3">
                  {stepTitles.map((title, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum === currentStep;
                    const isCompleted = stepNum < currentStep;
                    return (
                      <div key={stepNum} className="d-flex flex-column align-items-center" style={{flex: 1}}>
                        <div 
                          className={`rounded-circle d-flex align-items-center justify-content-center mb-1 ${
                            isCompleted ? 'bg-success text-white' : 
                            isActive ? 'bg-primary text-white' : 
                            'bg-light text-muted border'
                          }`}
                          style={{width: '30px', height: '30px', fontSize: '12px'}}
                        >
                          {isCompleted ? <i className="fas fa-check"></i> : stepNum}
                        </div>
                        <small className={`text-center ${isActive ? 'text-primary fw-semibold' : 'text-muted'}`} style={{fontSize: '10px'}}>
                          {title}
                        </small>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                  {/* Step 1: Registration Type */}
                  {currentStep === 1 && (
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-primary bg-opacity-10 rounded-2 p-1 me-2">
                        <i className="fas fa-users text-primary"></i>
                      </div>
                      <h5 className="mb-0 fw-semibold">Registration Type</h5>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className={`card h-100 border-2 position-relative ${formData.role === 'player' ? 'border-primary bg-primary bg-opacity-5' : 'border-light'}`} 
                             style={{ 
                               cursor: 'pointer', 
                               transition: 'all 0.2s ease',
                               opacity: formData.role === 'player' ? '0.15' : '1'
                             }}
                             onClick={() => setFormData(prev => ({ ...prev, role: 'player' }))}>
                          {formData.role === 'player' && (
                            <div className="position-absolute top-0 end-0 m-2">
                              <i className="fas fa-check-circle text-primary"></i>
                            </div>
                          )}
                          <div className="card-body text-center p-4">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                              <i className="fas fa-running fa-lg text-primary"></i>
                            </div>
                            <h6 className="fw-bold mb-2">Player Registration</h6>
                            <p className="text-muted small mb-0">Join as a player to compete in games and tournaments</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className={`card h-100 border-2 position-relative ${formData.role === 'coach' ? 'border-success bg-success bg-opacity-5' : 'border-light'}`}
                             style={{ 
                               cursor: 'pointer', 
                               transition: 'all 0.2s ease',
                               opacity: formData.role === 'coach' ? '0.15' : '1'
                             }}
                             onClick={() => setFormData(prev => ({ ...prev, role: 'coach' }))}>
                          {formData.role === 'coach' && (
                            <div className="position-absolute top-0 end-0 m-2">
                              <i className="fas fa-check-circle text-success"></i>
                            </div>
                          )}
                          <div className="card-body text-center p-4">
                            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                              <i className="fas fa-chalkboard-teacher fa-lg text-success"></i>
                            </div>
                            <h6 className="fw-bold mb-2">Coach Registration</h6>
                            <p className="text-muted small mb-0">Register as a coach to lead and mentor teams</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Step 2: Personal Information */}
                  {currentStep === 2 && (
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-info bg-opacity-10 rounded-2 p-1 me-2">
                        <i className="fas fa-user text-info"></i>
                      </div>
                      <h5 className="mb-0 fw-semibold">Personal Information</h5>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="First Name"
                            required
                          />
                          <label htmlFor="firstName">
                            <i className="fas fa-user me-2 text-muted"></i>First Name *
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Last Name"
                            required
                          />
                          <label htmlFor="lastName">
                            <i className="fas fa-user me-2 text-muted"></i>Last Name *
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="tel"
                            className="form-control form-control-lg"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(555) 123-4567"
                            required
                          />
                          <label htmlFor="phone">
                            <i className="fas fa-phone me-2 text-muted"></i>Phone Number *
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="email"
                            className="form-control form-control-lg"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                          />
                          <label htmlFor="email">
                            <i className="fas fa-envelope me-2 text-muted"></i>Email Address
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <input
                          type="date"
                          className="form-control form-control-lg"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          required
                        />
                        <label htmlFor="dateOfBirth">
                          <i className="fas fa-calendar me-2 text-muted"></i>Date of Birth *
                        </label>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Step 3: Role-Specific Information */}
                  {currentStep === 3 && (
                  <div>
                  {formData.role === 'player' ? (
                    <div className="mb-5">
                      <div className="d-flex align-items-center mb-4">
                        <div className="bg-warning bg-opacity-10 rounded-2 p-1 me-2">
                          <i className="fas fa-football-ball text-warning"></i>
                        </div>
                        <h5 className="mb-0 fw-semibold">Player Information</h5>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <select
                              className="form-select form-control-lg"
                              id="position"
                              name="position"
                              value={formData.position}
                              onChange={handleInputChange}
                            >
                              <option value="quarterback">Quarterback</option>
                              <option value="rusher">Rusher</option>
                              <option value="receiver">Receiver</option>
                              <option value="defender">Defender</option>
                              <option value="flex">Flex (Any Position)</option>
                            </select>
                            <label htmlFor="position">
                              <i className="fas fa-running me-2 text-muted"></i>Preferred Position
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <select
                              className="form-select form-control-lg"
                              id="playerTag"
                              name="playerTag"
                              value={formData.playerTag}
                              onChange={handleInputChange}
                            >
                              <option value="free-agent">Free Agent</option>
                              <option value="draft-pick">Draft Pick</option>
                              <option value="prospect">Prospect</option>
                              <option value="meet-greet">Meet & Greet</option>
                              <option value="client">Existing Client</option>
                            </select>
                            <label htmlFor="playerTag">
                              <i className="fas fa-tag me-2 text-muted"></i>Player Type
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5">
                      <div className="d-flex align-items-center mb-4">
                        <div className="bg-success bg-opacity-10 rounded-2 p-1 me-2">
                          <i className="fas fa-chalkboard-teacher text-success"></i>
                        </div>
                        <h5 className="mb-0 fw-semibold">Coaching Information</h5>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              id="experience"
                              name="experience"
                              value={formData.experience}
                              onChange={handleInputChange}
                              placeholder="e.g., 5 years, High School, College"
                              required={formData.role === 'coach'}
                            />
                            <label htmlFor="experience">
                              <i className="fas fa-medal me-2 text-muted"></i>Coaching Experience *
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <select
                              className="form-select form-control-lg"
                              id="coachingLevel"
                              name="coachingLevel"
                              value={formData.coachingLevel}
                              onChange={handleInputChange}
                            >
                              <option value="volunteer">Volunteer</option>
                              <option value="assistant">Assistant Coach</option>
                              <option value="head">Head Coach</option>
                              <option value="coordinator">Coordinator</option>
                            </select>
                            <label htmlFor="coachingLevel">
                              <i className="fas fa-layer-group me-2 text-muted"></i>Coaching Level
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              id="certifications"
                              name="certifications"
                              value={formData.certifications}
                              onChange={handleInputChange}
                              placeholder="e.g., CPR, First Aid, USA Football"
                            />
                            <label htmlFor="certifications">
                              <i className="fas fa-certificate me-2 text-muted"></i>Certifications
                            </label>
                            <div className="form-text mt-1">Separate multiple certifications with commas</div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              id="specialties"
                              name="specialties"
                              value={formData.specialties}
                              onChange={handleInputChange}
                              placeholder="e.g., Offense, Defense, Special Teams"
                            />
                            <label htmlFor="specialties">
                              <i className="fas fa-star me-2 text-muted"></i>Specialties
                            </label>
                            <div className="form-text mt-1">Separate multiple specialties with commas</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                  )}

                  {/* Step 4: Emergency Contact & Medical */}
                  {currentStep === 4 && (
                  <div>
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-danger bg-opacity-10 rounded-2 p-1 me-2">
                        <i className="fas fa-phone-alt text-danger"></i>
                      </div>
                      <h5 className="mb-0 fw-semibold">Emergency Contact</h5>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="emergencyContactName"
                            name="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={handleInputChange}
                            placeholder="Full name of emergency contact"
                            required
                          />
                          <label htmlFor="emergencyContactName">
                            <i className="fas fa-user-shield me-2 text-muted"></i>Emergency Contact Name *
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="tel"
                            className="form-control form-control-lg"
                            id="emergencyContactPhone"
                            name="emergencyContactPhone"
                            value={formData.emergencyContactPhone}
                            onChange={handleInputChange}
                            placeholder="(555) 123-4567"
                            required
                          />
                          <label htmlFor="emergencyContactPhone">
                            <i className="fas fa-phone me-2 text-muted"></i>Emergency Contact Phone *
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-info bg-opacity-10 rounded-2 p-1 me-2">
                        <i className="fas fa-heartbeat text-info"></i>
                      </div>
                      <h5 className="mb-0 fw-semibold">Medical Information</h5>
                    </div>
                    <div className="form-floating mb-3">
                      <textarea
                        className="form-control"
                        id="medicalConditions"
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleInputChange}
                        rows={4}
                        style={{minHeight: '120px'}}
                        placeholder="List any medical conditions, allergies, or medications (optional)"
                      ></textarea>
                      <label htmlFor="medicalConditions">
                        <i className="fas fa-notes-medical me-2 text-muted"></i>Medical Conditions or Allergies
                      </label>
                      <div className="form-text mt-2">
                        <i className="fas fa-lock me-1 text-muted"></i>
                        This information is kept confidential and used only for safety purposes.
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-secondary bg-opacity-10 rounded-2 p-1 me-2">
                        <i className="fas fa-users text-secondary"></i>
                      </div>
                      <h5 className="mb-0 fw-semibold">Referral & Source</h5>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="referredBy"
                            name="referredBy"
                            value={formData.referredBy}
                            onChange={handleInputChange}
                            placeholder="Name of player who referred you"
                          />
                          <label htmlFor="referredBy">
                            <i className="fas fa-user-friends me-2 text-muted"></i>Referred By (Player Name)
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <select
                            className="form-select form-control-lg"
                            id="source"
                            name="source"
                            value={formData.source}
                            onChange={handleInputChange}
                          >
                            <option value="website">Website</option>
                            <option value="referral">Friend/Referral</option>
                            <option value="social">Social Media</option>
                            <option value="flyer">Flyer/Advertisement</option>
                            <option value="gym">At the Gym</option>
                            <option value="other">Other</option>
                          </select>
                          <label htmlFor="source">
                            <i className="fas fa-bullhorn me-2 text-muted"></i>How did you hear about us?
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                  )}

                  {/* Step 5: Review & Submit */}
                  {currentStep === 5 && (
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-success bg-opacity-10 rounded-2 p-1 me-2">
                        <i className="fas fa-check-circle text-success"></i>
                      </div>
                      <h5 className="mb-0 fw-semibold">Review Your Information</h5>
                    </div>
                    
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="card border-0 bg-light">
                          <div className="card-body p-3">
                            <h6 className="fw-semibold mb-2">Registration Type</h6>
                            <p className="mb-1"><strong>Role:</strong> {formData.role === 'player' ? 'Player' : 'Coach'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="card border-0 bg-light">
                          <div className="card-body p-3">
                            <h6 className="fw-semibold mb-2">Personal Information</h6>
                            <p className="mb-1"><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                            <p className="mb-1"><strong>Phone:</strong> {formData.phone}</p>
                            <p className="mb-1"><strong>Email:</strong> {formData.email || 'Not provided'}</p>
                            <p className="mb-1"><strong>Date of Birth:</strong> {formData.dateOfBirth}</p>
                          </div>
                        </div>
                      </div>
                      
                      {formData.role === 'player' && (
                        <div className="col-md-6">
                          <div className="card border-0 bg-light">
                            <div className="card-body p-3">
                              <h6 className="fw-semibold mb-2">Player Details</h6>
                              <p className="mb-1"><strong>Position:</strong> {formData.position}</p>
                              <p className="mb-1"><strong>Player Type:</strong> {formData.playerTag}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {formData.role === 'coach' && (
                        <div className="col-md-6">
                          <div className="card border-0 bg-light">
                            <div className="card-body p-3">
                              <h6 className="fw-semibold mb-2">Coaching Details</h6>
                              <p className="mb-1"><strong>Experience:</strong> {formData.experience}</p>
                              <p className="mb-1"><strong>Level:</strong> {formData.coachingLevel}</p>
                              {formData.certifications && <p className="mb-1"><strong>Certifications:</strong> {formData.certifications}</p>}
                              {formData.specialties && <p className="mb-1"><strong>Specialties:</strong> {formData.specialties}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="col-md-6">
                        <div className="card border-0 bg-light">
                          <div className="card-body p-3">
                            <h6 className="fw-semibold mb-2">Emergency Contact</h6>
                            <p className="mb-1"><strong>Name:</strong> {formData.emergencyContactName}</p>
                            <p className="mb-1"><strong>Phone:</strong> {formData.emergencyContactPhone}</p>
                          </div>
                        </div>
                      </div>
                      
                      {(formData.medicalConditions || formData.referredBy) && (
                        <div className="col-12">
                          <div className="card border-0 bg-light">
                            <div className="card-body p-3">
                              <h6 className="fw-semibold mb-2">Additional Information</h6>
                              {formData.medicalConditions && <p className="mb-1"><strong>Medical Conditions:</strong> {formData.medicalConditions}</p>}
                              {formData.referredBy && <p className="mb-1"><strong>Referred By:</strong> {formData.referredBy}</p>}
                              <p className="mb-1"><strong>Source:</strong> {formData.source}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {selectedPlan && (
                      <div className="col-12 mt-4">
                        <div className="card border-primary">
                          <div className="card-header bg-primary text-white">
                            <h6 className="mb-0 fw-semibold">
                              <i className="fas fa-credit-card me-2"></i>
                              Selected Plan
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="fw-bold mb-1">{selectedPlan.title}</h6>
                                <p className="text-muted mb-0">{selectedPlan.subtitle}</p>
                              </div>
                              <div className="text-end">
                                <div className="h5 mb-0 text-success">
                                  ${selectedPlan.pricing?.total?.toFixed(2) || selectedPlan.price.toFixed(2)}
                                </div>
                                {selectedPlan.appliedCoupon && (
                                  <small className="text-success">
                                    <i className="fas fa-tag me-1"></i>
                                    {selectedPlan.appliedCoupon.code} applied
                                  </small>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  {/* Step 6: Payment */}
                  {currentStep === 6 && (
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-success bg-opacity-10 rounded-2 p-1 me-2">
                        <i className="fas fa-credit-card text-success"></i>
                      </div>
                      <h5 className="mb-0 fw-semibold">Payment Options</h5>
                    </div>
                    
                    <PaymentCheckout 
                      planData={selectedPlan}
                      customerData={{
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone
                      }}
                      onPaymentSuccess={() => {
                        setSuccess(true);
                      }}
                      onPaymentError={(error) => {
                        setError(error);
                      }}
                    />
                  </div>
                  )}

                  {error && (
                    <div className="alert alert-danger d-flex align-items-center border-0 rounded-3 mb-4">
                      <div className="bg-danger bg-opacity-10 rounded-2 p-2 me-3">
                        <i className="fas fa-exclamation-triangle text-danger"></i>
                      </div>
                      <div>
                        <strong>Registration Error</strong><br/>
                        {error}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="d-flex justify-content-between align-items-center mt-5">
                    <div>
                      {currentStep > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-lg px-4"
                          onClick={prevStep}
                        >
                          <i className="fas fa-arrow-left me-2"></i>
                          Previous
                        </button>
                      )}
                    </div>
                    
                    <div className="text-center flex-grow-1 mx-3">
                      {currentStep < totalSteps ? (
                        <small className="text-muted">
                          Step {currentStep} of {totalSteps} - Click Next to continue
                        </small>
                      ) : (
                        <small className="text-muted d-flex align-items-center justify-content-center">
                          <i className="fas fa-shield-alt me-2 text-success"></i>
                          By registering, you agree to receive SMS messages and will be redirected to complete payment.
                        </small>
                      )}
                    </div>
                    
                    <div>
                      {currentStep < 5 ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-lg px-4"
                          onClick={nextStep}
                        >
                          Next
                          <i className="fas fa-arrow-right ms-2"></i>
                        </button>
                      ) : currentStep === 5 ? (
                        <button
                          type="button"
                          className="btn btn-success btn-lg px-4"
                          onClick={proceedToPayment}
                        >
                          Proceed to Payment
                          <i className="fas fa-arrow-right ms-2"></i>
                        </button>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
