'use client';

import { useState } from 'react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: any;
}

export default function RegistrationCompletionTestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Registration Completion Service', status: 'pending' },
    { name: 'QR Code Generation', status: 'pending' },
    { name: 'PDF Generation', status: 'pending' },
    { name: 'Email Service', status: 'pending' },
    { name: 'Firebase Storage', status: 'pending' },
    { name: 'End-to-End Registration', status: 'pending' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [testData, setTestData] = useState({
    firstName: 'John',
    lastName: 'TestUser',
    email: 'test@example.com',
    phone: '919-555-0123'
  });

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    const testUser = {
      playerId: `test_${Date.now()}`,
      firstName: testData.firstName,
      lastName: testData.lastName,
      email: testData.email,
      phone: testData.phone,
      role: 'player' as const,
      selectedPlan: {
        title: 'Test Plan',
        price: 50.00,
        total: 50.00,
        category: 'player'
      },
      registrationData: {
        dateOfBirth: '1990-01-01',
        position: 'quarterback',
        jerseySize: 'L',
        emergencyContactName: 'Jane TestUser',
        emergencyContactPhone: '919-555-0124',
        emergencyContactRelation: 'spouse',
        medicalConditions: 'None',
        medications: 'None',
        allergies: 'None'
      }
    };

    try {
      // Test 1: Registration Completion Service
      updateTest(0, { status: 'running' });
      try {
        const response = await fetch('/api/test/registration-completion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUser)
        });
        const result = await response.json();
        
        if (result.success) {
          updateTest(0, { 
            status: 'success', 
            message: 'Service working correctly',
            details: { qrCodes: !!result.qrCodes, pdfUrl: !!result.pdfUrl }
          });
        } else {
          updateTest(0, { status: 'error', message: result.error });
        }
      } catch (error) {
        updateTest(0, { status: 'error', message: (error as Error).message });
      }

      // Test 2: QR Code Generation
      updateTest(1, { status: 'running' });
      try {
        const response = await fetch('/api/test/qr-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: testUser.playerId,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            phone: testUser.phone,
            email: testUser.email
          })
        });
        const result = await response.json();
        
        if (result.success) {
          updateTest(1, { 
            status: 'success', 
            message: 'QR codes generated successfully',
            details: result.qrCodes
          });
        } else {
          updateTest(1, { status: 'error', message: result.error });
        }
      } catch (error) {
        updateTest(1, { status: 'error', message: (error as Error).message });
      }

      // Test 3: PDF Generation
      updateTest(2, { status: 'running' });
      try {
        const response = await fetch('/api/test/pdf-generation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUser)
        });
        
        if (response.ok) {
          const pdfSize = parseInt(response.headers.get('content-length') || '0');
          updateTest(2, { 
            status: 'success', 
            message: `PDF generated (${pdfSize} bytes)`,
            details: { size: pdfSize }
          });
        } else {
          updateTest(2, { status: 'error', message: 'PDF generation failed' });
        }
      } catch (error) {
        updateTest(2, { status: 'error', message: (error as Error).message });
      }

      // Test 4: Email Service
      updateTest(3, { status: 'running' });
      try {
        const response = await fetch('/api/test/email-service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: testUser.email,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            selectedPlan: testUser.selectedPlan,
            qrCodes: { profile: 'test-qr', contact: 'test-qr' }
          })
        });
        const result = await response.json();
        
        if (result.success) {
          updateTest(3, { 
            status: 'success', 
            message: `Email sent to ${result.to}`,
            details: result
          });
        } else {
          updateTest(3, { status: 'error', message: result.error });
        }
      } catch (error) {
        updateTest(3, { status: 'error', message: (error as Error).message });
      }

      // Test 5: Firebase Storage
      updateTest(4, { status: 'running' });
      try {
        const response = await fetch(`/api/test/firebase-storage/${testUser.playerId}`);
        const result = await response.json();
        
        if (result.success) {
          updateTest(4, { 
            status: 'success', 
            message: 'Firebase storage accessible',
            details: result
          });
        } else {
          updateTest(4, { status: 'error', message: result.error });
        }
      } catch (error) {
        updateTest(4, { status: 'error', message: (error as Error).message });
      }

      // Test 6: End-to-End Registration
      updateTest(5, { status: 'running' });
      try {
        const response = await fetch('/api/registration/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: 'E2E',
            lastName: 'TestUser',
            email: 'e2e-test@example.com',
            phone: '919-555-9999',
            dateOfBirth: '1995-05-15',
            jerseySize: 'M',
            position: 'receiver',
            experience: 'beginner',
            emergencyContactName: 'Emergency Contact',
            emergencyContactPhone: '919-555-8888',
            emergencyContactRelation: 'parent',
            medicalConditions: 'None',
            medications: 'None',
            allergies: 'None',
            preferredCommunication: 'email',
            marketingConsent: true,
            waiverAccepted: true,
            termsAccepted: true,
            selectedPlan: {
              category: 'player',
              plan: 'bundle',
              title: 'Test Registration',
              price: 50.00,
              total: 50.00
            },
            registrationSource: 'test'
          })
        });
        const result = await response.json();
        
        if (result.success) {
          updateTest(5, { 
            status: 'success', 
            message: `Registration created: ${result.playerId}`,
            details: result
          });
        } else {
          updateTest(5, { status: 'error', message: result.error });
        }
      } catch (error) {
        updateTest(5, { status: 'error', message: (error as Error).message });
      }

    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-muted';
      case 'running': return 'text-primary';
      case 'success': return 'text-success';
      case 'error': return 'text-danger';
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-flask me-2"></i>
                Registration Completion System Test
              </h4>
            </div>
            <div className="card-body">
              
              {/* Test Configuration */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Test Configuration</h5>
                  <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={testData.firstName}
                      onChange={(e) => setTestData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={isRunning}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={testData.lastName}
                      onChange={(e) => setTestData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={isRunning}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <h5>&nbsp;</h5>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={testData.email}
                      onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={isRunning}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={testData.phone}
                      onChange={(e) => setTestData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={isRunning}
                    />
                  </div>
                </div>
              </div>

              {/* Run Tests Button */}
              <div className="text-center mb-4">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={runAllTests}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play me-2"></i>
                      Run All Tests
                    </>
                  )}
                </button>
              </div>

              {/* Test Results */}
              <div className="row">
                <div className="col-12">
                  <h5>Test Results</h5>
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Test</th>
                          <th>Status</th>
                          <th>Message</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tests.map((test, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{test.name}</strong>
                            </td>
                            <td>
                              <span className={getStatusColor(test.status)}>
                                {getStatusIcon(test.status)} {test.status}
                              </span>
                            </td>
                            <td>
                              {test.message && (
                                <span className={getStatusColor(test.status)}>
                                  {test.message}
                                </span>
                              )}
                            </td>
                            <td>
                              {test.details && (
                                <details>
                                  <summary className="btn btn-sm btn-outline-secondary">
                                    View Details
                                  </summary>
                                  <pre className="mt-2 p-2 bg-light rounded">
                                    {JSON.stringify(test.details, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="alert alert-info mt-4">
                <h6><i className="fas fa-info-circle me-2"></i>Test Instructions</h6>
                <ul className="mb-0">
                  <li>This test verifies the complete registration completion system</li>
                  <li>Make sure your email service is configured (check .env.local)</li>
                  <li>Firebase must be connected and accessible</li>
                  <li>The test will create temporary test data</li>
                  <li>Check your email inbox for test messages</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
