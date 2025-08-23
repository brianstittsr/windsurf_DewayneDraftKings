'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { SMS_COLLECTIONS } from '@/lib/sms-schema';
import TwilioSMSService from '@/lib/twilio-service';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    source: 'website'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    try {
      // Validate phone number
      if (!TwilioSMSService.validatePhoneNumber(formData.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      const formattedPhone = TwilioSMSService.formatPhoneNumber(formData.phone);

      // Create SMS subscriber
      const subscriberData = {
        phone: formattedPhone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        isOptedIn: true,
        optInDate: Timestamp.now(),
        currentStep: 0,
        source: formData.source as any,
        totalMessagesSent: 0,
        totalMessagesDelivered: 0,
        totalReplies: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, SMS_COLLECTIONS.SMS_SUBSCRIBERS), subscriberData);

      // Send welcome SMS
      const welcomeMessage = `Hi ${formData.firstName}! 🏈 Welcome to the DraftKings League! You're now signed up for updates about registration, draft info, and game schedules. Reply STOP to opt out anytime.`;
      
      await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message: welcomeMessage,
          subscriberId: docRef.id,
          journeyId: 'welcome-sequence'
        }),
      });

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        source: 'website'
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card dk-card">
              <div className="card-body text-center">
                <h2 className="card-title text-success mb-4">🎉 Registration Successful!</h2>
                <p className="mb-3">
                  Welcome to the DraftKings League! You should receive a welcome text message shortly.
                </p>
                <p className="text-muted mb-4">
                  You'll receive updates about:
                </p>
                <ul className="list-unstyled mb-4">
                  <li>📱 Registration deadlines</li>
                  <li>🏈 Draft information</li>
                  <li>📅 Game schedules</li>
                  <li>🏆 League highlights</li>
                </ul>
                <button 
                  className="btn dk-btn-primary"
                  onClick={() => setSuccess(false)}
                >
                  Register Another Person
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card dk-card">
            <div className="card-header">
              <h1 className="card-title h3 mb-0">🏈 Join the DraftKings League</h1>
              <p className="text-muted mb-0">Get SMS updates about registration, drafts, and games</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control dk-metric-input"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control dk-metric-input"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
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
                  <div className="form-text">
                    We'll send you SMS updates. Standard message rates apply.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address (Optional)
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

                <div className="mb-4">
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
                    <option value="other">Other</option>
                  </select>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn dk-btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registering...
                      </>
                    ) : (
                      'Join League & Get SMS Updates'
                    )}
                  </button>
                </div>

                <div className="mt-3">
                  <small className="text-muted">
                    By clicking "Join League", you agree to receive SMS messages. 
                    Reply STOP to opt out anytime. Message and data rates may apply.
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
