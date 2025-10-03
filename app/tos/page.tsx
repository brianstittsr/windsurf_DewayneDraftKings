import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link href="/" className="navbar-brand">
            <strong>All Pro Sports NC</strong>
          </Link>
          <Link href="/" className="btn btn-outline-light btn-sm">
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow">
              <div className="card-body p-5">
                <h1 className="mb-4">Terms of Service</h1>
                <p className="text-muted mb-4">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>

                <hr className="my-4" />

                <section className="mb-5">
                  <h2 className="h4 mb-3">1. Acceptance of Terms</h2>
                  <p>
                    Welcome to All Pro Sports NC. By accessing or using our services, including our 
                    website, mobile applications, and league programs, you agree to be bound by these 
                    Terms of Service ("Terms"). If you do not agree to these Terms, please do not use 
                    our services.
                  </p>
                  <p>
                    These Terms constitute a legally binding agreement between you and All Pro Sports NC 
                    ("we," "our," or "us").
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">2. Eligibility and Registration</h2>
                  
                  <h3 className="h5 mb-2">Age Requirements</h3>
                  <ul>
                    <li>Participants must meet the age requirements for their selected league</li>
                    <li>Participants under 18 must have parental or guardian consent</li>
                    <li>Parents/guardians are responsible for their minor children's use of our services</li>
                  </ul>

                  <h3 className="h5 mb-2 mt-4">Account Registration</h3>
                  <ul>
                    <li>You must provide accurate and complete information</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>You must notify us immediately of any unauthorized access</li>
                    <li>One person may not maintain multiple accounts</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">3. Payment and Fees</h2>
                  
                  <h3 className="h5 mb-2">Registration Fees</h3>
                  <ul>
                    <li>All fees must be paid in full before participation</li>
                    <li>Fees are non-refundable except as outlined in our refund policy</li>
                    <li>We reserve the right to change fees with 30 days notice</li>
                    <li>Late payments may result in suspension from league activities</li>
                  </ul>

                  <h3 className="h5 mb-2 mt-4">Payment Methods</h3>
                  <p>We accept:</p>
                  <ul>
                    <li>Credit and debit cards (Visa, Mastercard, American Express, Discover)</li>
                    <li>Buy Now, Pay Later options (Klarna, Affirm)</li>
                    <li>ACH bank transfers (for certain plans)</li>
                  </ul>

                  <h3 className="h5 mb-2 mt-4">Refund Policy</h3>
                  <ul>
                    <li>Refunds requested before season start: 90% refund (10% processing fee)</li>
                    <li>Refunds requested within first week of season: 50% refund</li>
                    <li>No refunds after first week of season</li>
                    <li>Medical exemptions may qualify for prorated refunds (with documentation)</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">4. Code of Conduct</h2>
                  <p>All participants, parents, coaches, and spectators must:</p>
                  <ul>
                    <li>Treat others with respect and dignity</li>
                    <li>Follow all league rules and regulations</li>
                    <li>Refrain from violent, abusive, or discriminatory behavior</li>
                    <li>Respect officials' decisions</li>
                    <li>Maintain good sportsmanship at all times</li>
                    <li>Comply with facility rules and regulations</li>
                  </ul>
                  <p className="text-danger">
                    <strong>Violation of the code of conduct may result in suspension or permanent ban 
                    from the league without refund.</strong>
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">5. Health and Safety</h2>
                  
                  <h3 className="h5 mb-2">Medical Requirements</h3>
                  <ul>
                    <li>All participants must complete a medical information form</li>
                    <li>Participants must disclose any medical conditions that may affect participation</li>
                    <li>Parents/guardians must provide emergency contact information</li>
                    <li>Participants may be required to provide medical clearance</li>
                  </ul>

                  <h3 className="h5 mb-2 mt-4">Insurance</h3>
                  <ul>
                    <li>League provides general liability insurance for covered activities</li>
                    <li>Participants are encouraged to maintain personal health insurance</li>
                    <li>League insurance is secondary to personal insurance</li>
                  </ul>

                  <h3 className="h5 mb-2 mt-4">Assumption of Risk</h3>
                  <p>
                    Participation in sports activities involves inherent risks, including but not limited to:
                  </p>
                  <ul>
                    <li>Physical injury (sprains, fractures, concussions)</li>
                    <li>Property damage</li>
                    <li>Exposure to weather conditions</li>
                    <li>Contact with other participants</li>
                  </ul>
                  <p>
                    By participating, you acknowledge and accept these risks.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">6. Waiver and Release of Liability</h2>
                  <p>
                    By using our services, you agree to release, waive, and discharge All Pro Sports NC, 
                    its officers, employees, coaches, volunteers, and agents from any and all liability for:
                  </p>
                  <ul>
                    <li>Personal injury or death</li>
                    <li>Property damage or loss</li>
                    <li>Any claims arising from participation in league activities</li>
                  </ul>
                  <p className="text-warning">
                    <strong>This waiver applies even if the injury or damage is caused by negligence, 
                    except where prohibited by law.</strong>
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">7. Intellectual Property</h2>
                  
                  <h3 className="h5 mb-2">Our Content</h3>
                  <p>
                    All content on our platform, including logos, text, graphics, photos, and software, 
                    is owned by All Pro Sports NC and protected by copyright and trademark laws.
                  </p>

                  <h3 className="h5 mb-2 mt-4">User Content</h3>
                  <p>By submitting content (photos, videos, comments), you grant us:</p>
                  <ul>
                    <li>A worldwide, non-exclusive, royalty-free license to use your content</li>
                    <li>The right to display, reproduce, and distribute your content</li>
                    <li>The right to use your content for promotional purposes</li>
                  </ul>
                  <p>You retain ownership of your content and can request removal at any time.</p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">8. Photography and Media</h2>
                  <p>
                    We may photograph or video record league activities for promotional, educational, 
                    or archival purposes. By participating, you consent to:
                  </p>
                  <ul>
                    <li>Being photographed or recorded during league events</li>
                    <li>Use of your likeness in promotional materials</li>
                    <li>Posting of photos/videos on our website and social media</li>
                  </ul>
                  <p>
                    If you do not wish to be photographed, please notify us in writing. We will make 
                    reasonable efforts to accommodate your request.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">9. Cancellations and Postponements</h2>
                  <ul>
                    <li>We reserve the right to cancel or postpone games due to weather, facility issues, 
                    or other circumstances</li>
                    <li>Cancelled games will be rescheduled when possible</li>
                    <li>No refunds for individual game cancellations</li>
                    <li>Season may be shortened without refund if circumstances require</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">10. Privacy and Data Protection</h2>
                  <p>
                    Your privacy is important to us. Our collection and use of personal information is 
                    governed by our <Link href="/privacy">Privacy Policy</Link>, which is incorporated 
                    into these Terms by reference.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">11. Communications</h2>
                  <p>By registering, you consent to receive:</p>
                  <ul>
                    <li>Email communications about schedules, updates, and announcements</li>
                    <li>SMS text messages for urgent notifications (with opt-in)</li>
                    <li>Marketing communications (you can opt-out anytime)</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">12. Termination</h2>
                  <p>We reserve the right to:</p>
                  <ul>
                    <li>Suspend or terminate your account for violation of these Terms</li>
                    <li>Remove participants who pose a safety risk</li>
                    <li>Ban individuals who violate the code of conduct</li>
                    <li>Refuse service to anyone for any lawful reason</li>
                  </ul>
                  <p>Termination does not entitle you to a refund unless otherwise stated.</p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">13. Limitation of Liability</h2>
                  <p>
                    To the maximum extent permitted by law, All Pro Sports NC shall not be liable for:
                  </p>
                  <ul>
                    <li>Indirect, incidental, or consequential damages</li>
                    <li>Loss of profits, data, or goodwill</li>
                    <li>Damages exceeding the amount you paid for services</li>
                    <li>Acts or omissions of third parties</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">14. Indemnification</h2>
                  <p>
                    You agree to indemnify and hold harmless All Pro Sports NC from any claims, damages, 
                    or expenses arising from:
                  </p>
                  <ul>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any law or regulation</li>
                    <li>Your violation of third-party rights</li>
                    <li>Your use of our services</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">15. Dispute Resolution</h2>
                  
                  <h3 className="h5 mb-2">Informal Resolution</h3>
                  <p>
                    Before filing a claim, you agree to contact us to attempt informal resolution.
                  </p>

                  <h3 className="h5 mb-2 mt-4">Arbitration</h3>
                  <p>
                    Any disputes that cannot be resolved informally shall be resolved through binding 
                    arbitration in accordance with the rules of the American Arbitration Association.
                  </p>

                  <h3 className="h5 mb-2 mt-4">Class Action Waiver</h3>
                  <p>
                    You agree to resolve disputes individually and waive the right to participate in 
                    class action lawsuits.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">16. Governing Law</h2>
                  <p>
                    These Terms are governed by the laws of the State of North Carolina, without regard 
                    to conflict of law principles. Any legal action must be brought in the courts of 
                    North Carolina.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">17. Changes to Terms</h2>
                  <p>
                    We reserve the right to modify these Terms at any time. Changes will be effective 
                    immediately upon posting. Your continued use of our services constitutes acceptance 
                    of the modified Terms.
                  </p>
                  <p>
                    Material changes will be communicated via email or prominent notice on our website.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">18. Severability</h2>
                  <p>
                    If any provision of these Terms is found to be unenforceable, the remaining provisions 
                    will remain in full force and effect.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">19. Entire Agreement</h2>
                  <p>
                    These Terms, together with our Privacy Policy, constitute the entire agreement between 
                    you and All Pro Sports NC regarding use of our services.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">20. Contact Information</h2>
                  <p>For questions about these Terms, please contact us:</p>
                  <div className="card bg-light">
                    <div className="card-body">
                      <p className="mb-2"><strong>All Pro Sports NC</strong></p>
                      <p className="mb-2">
                        <i className="fas fa-envelope me-2"></i>
                        Email: <a href="mailto:legal@allprosportsnc.com">legal@allprosportsnc.com</a>
                      </p>
                      <p className="mb-2">
                        <i className="fas fa-phone me-2"></i>
                        Phone: (919) 555-0100
                      </p>
                      <p className="mb-0">
                        <i className="fas fa-clock me-2"></i>
                        Hours: Monday-Friday, 9:00 AM - 6:00 PM EST
                      </p>
                    </div>
                  </div>
                </section>

                <hr className="my-4" />

                <div className="alert alert-info">
                  <strong>Important:</strong> By registering for our services, you acknowledge that you 
                  have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </div>

                <div className="text-center mt-4">
                  <Link href="/privacy" className="btn btn-outline-primary me-2">
                    View Privacy Policy
                  </Link>
                  <Link href="/" className="btn btn-primary">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">&copy; {new Date().getFullYear()} All Pro Sports NC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
