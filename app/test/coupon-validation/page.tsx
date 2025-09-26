'use client';

import { useState } from 'react';

interface CouponTest {
  name: string;
  couponCode: string;
  orderAmount: number;
  expectedDiscount: number;
  expectedFinalAmount: number;
  applicableItems: string[];
}

interface TestResult {
  test: CouponTest;
  status: 'pending' | 'running' | 'success' | 'error';
  actualDiscount?: number;
  actualFinalAmount?: number;
  message?: string;
  error?: string;
}

export default function CouponValidationTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [customTest, setCustomTest] = useState({
    couponCode: '',
    orderAmount: 100,
    applicableItems: ['player-registration']
  });

  // Predefined test cases
  const testCases: CouponTest[] = [
    {
      name: 'Percentage Discount (20% off $100)',
      couponCode: 'SAVE20',
      orderAmount: 100,
      expectedDiscount: 20,
      expectedFinalAmount: 80,
      applicableItems: ['player-registration']
    },
    {
      name: 'Fixed Amount Discount ($15 off $100)',
      couponCode: 'SAVE15',
      orderAmount: 100,
      expectedDiscount: 15,
      expectedFinalAmount: 85,
      applicableItems: ['player-registration']
    },
    {
      name: 'Set Price Coupon ($50 for $100 item)',
      couponCode: 'SPECIAL50',
      orderAmount: 100,
      expectedDiscount: 50,
      expectedFinalAmount: 50,
      applicableItems: ['player-registration']
    },
    {
      name: 'Percentage on Higher Amount (10% off $200)',
      couponCode: 'SAVE10',
      orderAmount: 200,
      expectedDiscount: 20,
      expectedFinalAmount: 180,
      applicableItems: ['coach-registration']
    }
  ];

  const runSingleTest = async (test: CouponTest): Promise<TestResult> => {
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: test.couponCode,
          orderAmount: test.orderAmount,
          applicableItems: test.applicableItems
        })
      });

      const result = await response.json();

      if (result.success) {
        const discountMatch = Math.abs(result.discount - test.expectedDiscount) < 0.01;
        const finalAmountMatch = Math.abs(result.finalAmount - test.expectedFinalAmount) < 0.01;
        
        if (discountMatch && finalAmountMatch) {
          return {
            test,
            status: 'success',
            actualDiscount: result.discount,
            actualFinalAmount: result.finalAmount,
            message: 'Discount calculation correct'
          };
        } else {
          return {
            test,
            status: 'error',
            actualDiscount: result.discount,
            actualFinalAmount: result.finalAmount,
            error: `Expected discount: $${test.expectedDiscount}, got: $${result.discount}. Expected final: $${test.expectedFinalAmount}, got: $${result.finalAmount}`
          };
        }
      } else {
        return {
          test,
          status: 'error',
          error: result.error || 'Coupon validation failed'
        };
      }
    } catch (error) {
      return {
        test,
        status: 'error',
        error: (error as Error).message
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    for (const test of testCases) {
      // Update UI to show current test running
      const runningResult: TestResult = { test, status: 'running' };
      results.push(runningResult);
      setTestResults([...results]);

      // Run the test
      const result = await runSingleTest(test);
      results[results.length - 1] = result;
      setTestResults([...results]);

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const runCustomTest = async () => {
    if (!customTest.couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    const test: CouponTest = {
      name: `Custom Test: ${customTest.couponCode}`,
      couponCode: customTest.couponCode,
      orderAmount: customTest.orderAmount,
      expectedDiscount: 0, // We don't know the expected value
      expectedFinalAmount: 0,
      applicableItems: customTest.applicableItems
    };

    const result = await runSingleTest(test);
    setTestResults(prev => [...prev, result]);
  };

  const createTestCoupons = async () => {
    try {
      const response = await fetch('/api/coupons/create-test-coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Test coupons created successfully!\nCreated: ${result.created.length}\nSkipped: ${result.skipped.length}\n\nYou can now run the validation tests.`);
      } else {
        alert(`Failed to create test coupons: ${result.error}`);
      }
    } catch (error) {
      alert(`Error creating test coupons: ${(error as Error).message}`);
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
            <div className="card-header bg-info text-white">
              <h4 className="mb-0">
                <i className="fas fa-tag me-2"></i>
                Coupon Validation & Discount Testing
              </h4>
            </div>
            <div className="card-body">

              {/* Instructions */}
              <div className="alert alert-info mb-4">
                <h6><i className="fas fa-info-circle me-2"></i>Test Instructions</h6>
                <p className="mb-2">This test verifies that coupon discounts are calculated correctly on the checkout page.</p>
                <p className="mb-2">
                  <strong>Required test coupons:</strong> SAVE20 (20% off), SAVE15 ($15 off), SPECIAL50 (set price $50), SAVE10 (10% off)
                </p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={createTestCoupons}
                    disabled={isRunning}
                  >
                    <i className="fas fa-magic me-2"></i>
                    Create Test Coupons
                  </button>
                  <span className="text-muted small align-self-center">
                    Click this if you haven't created the test coupons yet
                  </span>
                </div>
              </div>

              {/* Predefined Tests */}
              <div className="row mb-4">
                <div className="col-md-8">
                  <h5>Predefined Test Cases</h5>
                  <p className="text-muted">Tests common coupon scenarios with expected results</p>
                </div>
                <div className="col-md-4 text-end">
                  <button
                    className="btn btn-info"
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
              </div>

              {/* Custom Test */}
              <div className="card mb-4">
                <div className="card-header">
                  <h6 className="mb-0">Custom Coupon Test</h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label">Coupon Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter coupon code"
                        value={customTest.couponCode}
                        onChange={(e) => setCustomTest(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Order Amount ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={customTest.orderAmount}
                        onChange={(e) => setCustomTest(prev => ({ ...prev, orderAmount: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Item Type</label>
                      <select
                        className="form-select"
                        value={customTest.applicableItems[0]}
                        onChange={(e) => setCustomTest(prev => ({ ...prev, applicableItems: [e.target.value] }))}
                      >
                        <option value="player-registration">Player Registration</option>
                        <option value="coach-registration">Coach Registration</option>
                        <option value="jamboree">Jamboree Only</option>
                        <option value="season">Season Only</option>
                        <option value="bundle">Jamboree + Season</option>
                      </select>
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                      <button
                        className="btn btn-outline-info w-100"
                        onClick={runCustomTest}
                      >
                        <i className="fas fa-test-tube me-2"></i>
                        Test Coupon
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Test Results</h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Test Case</th>
                            <th>Coupon Code</th>
                            <th>Order Amount</th>
                            <th>Expected Discount</th>
                            <th>Actual Discount</th>
                            <th>Expected Final</th>
                            <th>Actual Final</th>
                            <th>Status</th>
                            <th>Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testResults.map((result, index) => (
                            <tr key={index}>
                              <td><strong>{result.test.name}</strong></td>
                              <td><code>{result.test.couponCode}</code></td>
                              <td>${result.test.orderAmount}</td>
                              <td>${result.test.expectedDiscount}</td>
                              <td>
                                {result.actualDiscount !== undefined ? (
                                  <span className={result.actualDiscount === result.test.expectedDiscount ? 'text-success' : 'text-danger'}>
                                    ${result.actualDiscount}
                                  </span>
                                ) : '-'}
                              </td>
                              <td>${result.test.expectedFinalAmount}</td>
                              <td>
                                {result.actualFinalAmount !== undefined ? (
                                  <span className={result.actualFinalAmount === result.test.expectedFinalAmount ? 'text-success' : 'text-danger'}>
                                    ${result.actualFinalAmount}
                                  </span>
                                ) : '-'}
                              </td>
                              <td>
                                <span className={getStatusColor(result.status)}>
                                  {getStatusIcon(result.status)} {result.status}
                                </span>
                              </td>
                              <td>
                                {result.message && (
                                  <span className="text-success">{result.message}</span>
                                )}
                                {result.error && (
                                  <span className="text-danger">{result.error}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              {testResults.length > 0 && !isRunning && (
                <div className="mt-4">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="card bg-success text-white">
                        <div className="card-body text-center">
                          <h5>{testResults.filter(r => r.status === 'success').length}</h5>
                          <p className="mb-0">Tests Passed</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-danger text-white">
                        <div className="card-body text-center">
                          <h5>{testResults.filter(r => r.status === 'error').length}</h5>
                          <p className="mb-0">Tests Failed</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-info text-white">
                        <div className="card-body text-center">
                          <h5>{testResults.length}</h5>
                          <p className="mb-0">Total Tests</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
