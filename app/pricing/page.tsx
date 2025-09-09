'use client';

import { useState } from 'react';
import ModernNavbar from '../../components/ModernNavbar';
import { CouponService } from '../../lib/coupon-service';
import { Coupon } from '../../lib/firestore-schema';

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'player' | 'coach'>('player');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const playerPricing = [
    {
      title: 'Jamboree Game',
      subtitle: 'Registration + Jersey',
      price: 26.50,
      serviceFee: 3.00,
      features: [
        'Single game registration',
        'Official team jersey',
        'Game day participation',
        'Basic stats tracking',
        'Team photo inclusion'
      ],
      popular: false,
      buttonText: 'Register Now',
      buttonClass: 'btn-outline-primary',
      itemType: 'jamboree' as const
    },
    {
      title: 'Jamboree + Season',
      subtitle: 'Complete package',
      price: 88.50,
      serviceFee: 3.00,
      features: [
        'Jamboree game registration',
        'Complete season access',
        'Official team jersey',
        'Priority team placement',
        'All games & playoffs',
        'Premium stats package',
        'Exclusive team events',
        'Season highlight reel'
      ],
      popular: true,
      buttonText: 'Get Complete Package',
      buttonClass: 'btn-success',
      itemType: 'jamboree_and_season' as const
    },
    {
      title: 'Complete Season',
      subtitle: 'Full season access',
      price: 59.00,
      serviceFee: 3.00,
      features: [
        'Full season registration',
        'Official team jersey',
        'All regular season games',
        'Playoff eligibility',
        'Advanced stats tracking',
        'Team photo & highlights',
        'End of season awards'
      ],
      popular: false,
      buttonText: 'Join Season',
      buttonClass: 'btn-primary',
      itemType: 'complete_season' as const
    }
  ];

  const coachPricing = [
    {
      title: 'Assistant Coach',
      subtitle: 'Support role',
      price: 45.00,
      serviceFee: 3.00,
      features: [
        'Assistant coaching certification',
        'Team management access',
        'Practice planning tools',
        'Player development resources',
        'Safety training included'
      ],
      popular: false,
      buttonText: 'Apply Now',
      buttonClass: 'btn-outline-primary',
      itemType: 'coach_registration' as const
    },
    {
      title: 'Head Coach',
      subtitle: 'Team leadership',
      price: 75.00,
      serviceFee: 3.00,
      features: [
        'Head coaching certification',
        'Full team management',
        'Game strategy tools',
        'Player evaluation system',
        'Parent communication portal',
        'League coordinator access',
        'Advanced training materials'
      ],
      popular: true,
      buttonText: 'Lead a Team',
      buttonClass: 'btn-primary',
      itemType: 'coach_registration' as const
    }
  ];

  const currentPricing = activeTab === 'player' ? playerPricing : coachPricing;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (selectedPlan === null) {
      setCouponError('Please select a plan first');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    const plan = currentPricing[selectedPlan];
    const result = await CouponService.validateCoupon(
      couponCode,
      plan.price + plan.serviceFee,
      undefined,
      undefined,
      plan.itemType
    );

    setValidatingCoupon(false);

    if (result.isValid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponError('');
    } else {
      setAppliedCoupon(null);
      setCouponError(result.error || 'Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const calculatePricing = (plan: any) => {
    return CouponService.calculateFinalPrice(
      plan.price,
      plan.serviceFee,
      appliedCoupon
    );
  };

  return (
    <div className="min-vh-100 bg-light">
      <ModernNavbar />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3 text-primary">
                Choose Your All Pro Sports Plan
              </h1>
              <p className="lead mb-4 text-primary">
                Join the premier youth sports league with flexible pricing options designed for players and coaches
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-5">
        <div className="container">
          {/* Tab Navigation */}
          <div className="row justify-content-center mb-5">
            <div className="col-md-6">
              <div className="nav nav-pills nav-fill modern-tabs" role="tablist">
                <button
                  className={`nav-link ${activeTab === 'player' ? 'active' : ''}`}
                  onClick={() => setActiveTab('player')}
                  type="button"
                >
                  <i className="fas fa-user-athlete me-2"></i>
                  Player Registration
                </button>
                <button
                  className={`nav-link ${activeTab === 'coach' ? 'active' : ''}`}
                  onClick={() => setActiveTab('coach')}
                  type="button"
                >
                  <i className="fas fa-whistle me-2"></i>
                  Coach Registration
                </button>
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          {selectedPlan !== null && (
            <div className="row justify-content-center mb-4">
              <div className="col-lg-6">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">
                      <i className="fas fa-tag me-2"></i>
                      Have a Coupon Code?
                    </h5>
                    {!appliedCoupon ? (
                      <div className="row">
                        <div className="col-8">
                          <input
                            type="text"
                            className={`form-control ${couponError ? 'is-invalid' : ''}`}
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          />
                          {couponError && (
                            <div className="invalid-feedback">{couponError}</div>
                          )}
                        </div>
                        <div className="col-4">
                          <button
                            className="btn btn-outline-primary w-100"
                            onClick={handleApplyCoupon}
                            disabled={validatingCoupon}
                          >
                            {validatingCoupon ? (
                              <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : (
                              <i className="fas fa-check me-2"></i>
                            )}
                            Apply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="badge bg-success me-2">
                            <i className="fas fa-check me-1"></i>
                            {appliedCoupon.code}
                          </span>
                          <span className="text-success">
                            {CouponService.getDiscountDisplay(appliedCoupon)} applied!
                          </span>
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={removeCoupon}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="row justify-content-center">
            {currentPricing.map((plan, index) => {
              const pricing = calculatePricing(plan);
              const isSelected = selectedPlan === index;
              
              return (
                <div key={index} className="col-lg-4 col-md-6 mb-4">
                  <div 
                    className={`card pricing-card h-100 ${plan.popular ? 'popular-plan' : ''} ${isSelected ? 'selected-plan' : ''}`}
                    onClick={() => setSelectedPlan(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    {plan.popular && (
                      <div className="popular-badge">
                        <span className="badge bg-primary">Most Popular</span>
                      </div>
                    )}
                    
                    <div className="card-body d-flex flex-column">
                      <div className="text-center mb-4">
                        <h3 className="card-title fw-bold text-primary">{plan.title}</h3>
                        <p className="text-muted mb-3">{plan.subtitle}</p>
                        
                        <div className="pricing-display">
                          {appliedCoupon && pricing.discount > 0 ? (
                            <>
                              <div className="original-price text-muted text-decoration-line-through">
                                ${plan.price.toFixed(2)}
                              </div>
                              <span className="price-main text-success">
                                ${(pricing.subtotal - pricing.discount).toFixed(2)}
                              </span>
                              <div className="discount-amount text-success small fw-bold">
                                Save ${pricing.discount.toFixed(2)}!
                              </div>
                            </>
                          ) : (
                            <span className="price-main">${plan.price.toFixed(2)}</span>
                          )}
                          
                          <div className="service-fee text-muted small">
                            + ${plan.serviceFee.toFixed(2)} service fee
                          </div>
                          
                          <div className="total-price fw-bold text-success">
                            Total: ${pricing.total.toFixed(2)}
                            {appliedCoupon && pricing.discount > 0 && (
                              <span className="text-muted text-decoration-line-through ms-2 small">
                                ${(plan.price + plan.serviceFee).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ul className="list-unstyled features-list flex-grow-1">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="mb-2">
                            <i className="fas fa-check text-success me-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto">
                        <button 
                          className={`btn ${plan.buttonClass} w-100 btn-lg`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const planData = {
                              ...plan,
                              pricing: pricing,
                              appliedCoupon: appliedCoupon
                            };
                            const queryParams = new URLSearchParams({
                              plan: JSON.stringify(planData),
                              role: activeTab
                            });
                            window.location.href = `/register?${queryParams.toString()}`;
                          }}
                        >
                          {plan.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="row justify-content-center mt-5">
            <div className="col-lg-8 text-center">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h4 className="card-title">
                    <i className="fas fa-info-circle me-2"></i>
                    Important Information
                  </h4>
                  <p className="mb-2">
                    <strong>Service Fee:</strong> A $3.00 processing fee applies to all registrations to cover payment processing and administrative costs.
                  </p>
                  <p className="mb-2">
                    <strong>Refund Policy:</strong> Full refunds available up to 7 days before season start. Partial refunds may apply thereafter.
                  </p>
                  <p className="mb-0">
                    <strong>Questions?</strong> Contact our support team at support@allprosports.com or call (555) 123-4567
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
