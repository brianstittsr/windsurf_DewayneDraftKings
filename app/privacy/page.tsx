import Link from 'next/link';

export default function PrivacyPolicy() {
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
                <h1 className="mb-4">Privacy Policy</h1>
                <p className="text-muted mb-4">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>

                <hr className="my-4" />

                <section className="mb-5">
                  <h2 className="h4 mb-3">1. Introduction</h2>
                  <p>
                    All Pro Sports NC ("we," "our," or "us") is committed to protecting your privacy. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                    information when you use our services, including our website and mobile applications.
                  </p>
                  <p>
                    Please read this privacy policy carefully. If you do not agree with the terms of 
                    this privacy policy, please do not access the site or use our services.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">2. Information We Collect</h2>
                  
                  <h3 className="h5 mb-2">Personal Information</h3>
                  <p>We collect information that you provide directly to us, including:</p>
                  <ul>
                    <li>Name, email address, and phone number</li>
                    <li>Date of birth and age verification</li>
                    <li>Physical address and emergency contact information</li>
                    <li>Payment and billing information</li>
                    <li>Medical information (allergies, conditions, medications)</li>
                    <li>Player statistics and performance data</li>
                    <li>Photos and videos from league events</li>
                  </ul>

                  <h3 className="h5 mb-2 mt-4">Automatically Collected Information</h3>
                  <p>When you access our services, we automatically collect:</p>
                  <ul>
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage data (pages visited, time spent, features used)</li>
                    <li>Location data (with your permission)</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">3. How We Use Your Information</h2>
                  <p>We use the information we collect to:</p>
                  <ul>
                    <li>Process registrations and manage your account</li>
                    <li>Process payments and prevent fraud</li>
                    <li>Communicate with you about schedules, events, and updates</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Track player statistics and performance</li>
                    <li>Ensure safety and emergency preparedness</li>
                    <li>Improve our services and develop new features</li>
                    <li>Send marketing communications (with your consent)</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">4. Information Sharing and Disclosure</h2>
                  <p>We may share your information with:</p>
                  
                  <h3 className="h5 mb-2">Service Providers</h3>
                  <ul>
                    <li>Payment processors (Stripe, PayPal)</li>
                    <li>Email and SMS service providers</li>
                    <li>Cloud hosting services (Firebase, Vercel)</li>
                    <li>Analytics providers</li>
                  </ul>

                  <h3 className="h5 mb-2 mt-4">Legal Requirements</h3>
                  <p>We may disclose your information if required by law or to:</p>
                  <ul>
                    <li>Comply with legal processes or government requests</li>
                    <li>Enforce our terms of service</li>
                    <li>Protect our rights, property, or safety</li>
                    <li>Prevent fraud or security issues</li>
                  </ul>

                  <h3 className="h5 mb-2 mt-4">With Your Consent</h3>
                  <p>
                    We may share information with third parties when you give us explicit consent, 
                    such as sharing photos on social media or with sponsors.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">5. Data Security</h2>
                  <p>
                    We implement appropriate technical and organizational measures to protect your 
                    personal information, including:
                  </p>
                  <ul>
                    <li>Encryption of data in transit and at rest</li>
                    <li>Secure payment processing through PCI-compliant providers</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication</li>
                    <li>Employee training on data protection</li>
                  </ul>
                  <p className="text-warning">
                    <strong>Note:</strong> No method of transmission over the internet is 100% secure. 
                    While we strive to protect your information, we cannot guarantee absolute security.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">6. Children's Privacy</h2>
                  <p>
                    Our services are designed for youth sports participants. We comply with the 
                    Children's Online Privacy Protection Act (COPPA) and take special care to protect 
                    children's information.
                  </p>
                  <ul>
                    <li>We require parental consent for children under 13</li>
                    <li>Parents can review, update, or delete their child's information</li>
                    <li>We limit the collection of children's data to what is necessary</li>
                    <li>We do not sell children's personal information</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">7. Your Rights and Choices</h2>
                  <p>You have the right to:</p>
                  <ul>
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                    <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
                    <li><strong>Restrict Processing:</strong> Limit how we use your information</li>
                  </ul>
                  <p>
                    To exercise these rights, contact us at{' '}
                    <a href="mailto:privacy@allprosportsnc.com">privacy@allprosportsnc.com</a>
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">8. Cookies and Tracking</h2>
                  <p>We use cookies and similar technologies to:</p>
                  <ul>
                    <li>Remember your preferences and settings</li>
                    <li>Analyze site traffic and usage patterns</li>
                    <li>Provide personalized content</li>
                    <li>Improve site performance</li>
                  </ul>
                  <p>
                    You can control cookies through your browser settings. Note that disabling cookies 
                    may affect site functionality.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">9. Third-Party Links</h2>
                  <p>
                    Our services may contain links to third-party websites. We are not responsible for 
                    the privacy practices of these sites. We encourage you to review their privacy policies.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">10. Data Retention</h2>
                  <p>
                    We retain your information for as long as necessary to provide our services and 
                    comply with legal obligations. Retention periods vary based on:
                  </p>
                  <ul>
                    <li>The type of information</li>
                    <li>The purpose for which it was collected</li>
                    <li>Legal and regulatory requirements</li>
                    <li>Your relationship with us</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">11. International Data Transfers</h2>
                  <p>
                    Your information may be transferred to and processed in countries other than your own. 
                    We ensure appropriate safeguards are in place to protect your information in accordance 
                    with this privacy policy.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">12. Changes to This Policy</h2>
                  <p>
                    We may update this privacy policy from time to time. We will notify you of significant 
                    changes by:
                  </p>
                  <ul>
                    <li>Posting the new policy on our website</li>
                    <li>Updating the "Last Updated" date</li>
                    <li>Sending email notifications for material changes</li>
                  </ul>
                  <p>
                    Your continued use of our services after changes constitutes acceptance of the updated policy.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3">13. Contact Us</h2>
                  <p>If you have questions or concerns about this privacy policy, please contact us:</p>
                  <div className="card bg-light">
                    <div className="card-body">
                      <p className="mb-2"><strong>All Pro Sports NC</strong></p>
                      <p className="mb-2">
                        <i className="fas fa-envelope me-2"></i>
                        Email: <a href="mailto:privacy@allprosportsnc.com">privacy@allprosportsnc.com</a>
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

                <div className="text-center">
                  <Link href="/tos" className="btn btn-outline-primary me-2">
                    View Terms of Service
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
