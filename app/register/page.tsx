'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { SMS_COLLECTIONS } from '@/lib/sms-schema';
import { COLLECTIONS } from '@/lib/firestore-schema';
import TwilioSMSService, { twilioService } from '@/lib/twilio-service';
import QRCode from 'qrcode';
import ModernNavbar from '@/components/ModernNavbar';

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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setSuccess(true);
      
      // Redirect to payment page after a short delay (only for players)
      setTimeout(() => {
        if (formData.role === 'player') {
          window.location.href = `/payment/${entityId}`;
        } else {
          window.location.href = '/';
        }
      }, 2000);
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
      <div className="hero-section py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-6">
              <div className="feature-icon mx-auto mb-4">
                <i className="fas fa-user-plus"></i>
              </div>
              <h1 className="display-5 fw-bold mb-3">Join All Pro Sports</h1>
              <p className="lead mb-0">Register for our elite athletic league and get instant SMS updates</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="dk-card fade-in">
              <div className="card-header">
                <h3 className="mb-0">Registration</h3>
                <p className="text-muted mb-0">Complete your profile to get started</p>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit} className="needs-validation">
                  {/* Role Selection */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3">👤 Registration Type</h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className={`dk-card p-3 text-center hover-lift ${formData.role === 'player' ? 'border-primary' : ''}`} 
                             style={{ cursor: 'pointer', borderWidth: formData.role === 'player' ? '2px' : '1px' }}
                             onClick={() => setFormData(prev => ({ ...prev, role: 'player' }))}>
                          <i className="fas fa-running fa-2x text-primary mb-2"></i>
                          <h6>Player Registration</h6>
                          <p className="text-muted small mb-0">Join as a player to compete in games</p>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className={`dk-card p-3 text-center hover-lift ${formData.role === 'coach' ? 'border-primary' : ''}`}
                             style={{ cursor: 'pointer', borderWidth: formData.role === 'coach' ? '2px' : '1px' }}
                             onClick={() => setFormData(prev => ({ ...prev, role: 'coach' }))}>
                          <i className="fas fa-chalkboard-teacher fa-2x text-success mb-2"></i>
                          <h6>Coach Registration</h6>
                          <p className="text-muted small mb-0">Register as a coach to lead teams</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3">👤 Personal Information</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-4">
                          <label htmlFor="firstName" className="form-label">
                            <i className="fas fa-user me-2"></i>First Name
                          </label>
                          <input
                            type="text"
                            className="form-control dk-metric-input"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter your first name"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-4">
                          <label htmlFor="lastName" className="form-label">
                            <i className="fas fa-user me-2"></i>Last Name
                          </label>
                          <input
                            type="text"
                            className="form-control dk-metric-input"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter your last name"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="phone" className="form-label">
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className="form-control dk-metric-input"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(555) 123-4567"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control dk-metric-input"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="dateOfBirth" className="form-label">
                        Date of Birth <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control dk-metric-input"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Role-Specific Information */}
                  {formData.role === 'player' ? (
                    <div className="mb-4">
                      <h5 className="text-primary mb-3">🏈 Player Information</h5>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="position" className="form-label">
                            Preferred Position
                          </label>
                          <select
                            className="form-select dk-metric-input"
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
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="playerTag" className="form-label">
                            Player Type
                          </label>
                          <select
                            className="form-select dk-metric-input"
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
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <h5 className="text-primary mb-3">🏃‍♂️ Coaching Information</h5>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="experience" className="form-label">
                            Coaching Experience <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control dk-metric-input"
                            id="experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            placeholder="e.g., 5 years, High School, College"
                            required={formData.role === 'coach'}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="coachingLevel" className="form-label">
                            Coaching Level
                          </label>
                          <select
                            className="form-select dk-metric-input"
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
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="certifications" className="form-label">
                            Certifications
                          </label>
                          <input
                            type="text"
                            className="form-control dk-metric-input"
                            id="certifications"
                            name="certifications"
                            value={formData.certifications}
                            onChange={handleInputChange}
                            placeholder="e.g., CPR, First Aid, USA Football"
                          />
                          <div className="form-text">Separate multiple certifications with commas</div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="specialties" className="form-label">
                            Specialties
                          </label>
                          <input
                            type="text"
                            className="form-control dk-metric-input"
                            id="specialties"
                            name="specialties"
                            value={formData.specialties}
                            onChange={handleInputChange}
                            placeholder="e.g., Offense, Defense, Special Teams"
                          />
                          <div className="form-text">Separate multiple specialties with commas</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3">🚨 Emergency Contact</h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="emergencyContactName" className="form-label">
                          Emergency Contact Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control dk-metric-input"
                          id="emergencyContactName"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleInputChange}
                          placeholder="Full name of emergency contact"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="emergencyContactPhone" className="form-label">
                          Emergency Contact Phone <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className="form-control dk-metric-input"
                          id="emergencyContactPhone"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleInputChange}
                          placeholder="(555) 123-4567"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3">🏥 Medical Information</h5>
                    <div className="mb-3">
                      <label htmlFor="medicalConditions" className="form-label">
                        Medical Conditions or Allergies
                      </label>
                      <textarea
                        className="form-control dk-metric-input"
                        id="medicalConditions"
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="List any medical conditions, allergies, or medications (optional)"
                      ></textarea>
                      <div className="form-text">
                        This information is kept confidential and used only for safety purposes.
                      </div>
                    </div>
                  </div>

                  {/* Referral Information */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3">👥 Referral & Source</h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="referredBy" className="form-label">
                          Referred By (Player Name)
                        </label>
                        <input
                          type="text"
                          className="form-control dk-metric-input"
                          id="referredBy"
                          name="referredBy"
                          value={formData.referredBy}
                          onChange={handleInputChange}
                          placeholder="Name of player who referred you"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="source" className="form-label">
                          How did you hear about us?
                        </label>
                        <select
                          className="form-select dk-metric-input"
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
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger border-0 rounded-3 mb-4">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  <div className="d-grid mt-4">
                    <button
                      type="submit"
                      className="btn dk-btn-primary btn-lg py-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Your Profile...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-rocket me-2"></i>
                          {formData.role === 'player' ? 'Join as Player' : 'Register as Coach'}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-3">
                    <small className="text-muted">
                      By registering, you agree to receive SMS messages and will be redirected to complete payment.
                    </small>
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
