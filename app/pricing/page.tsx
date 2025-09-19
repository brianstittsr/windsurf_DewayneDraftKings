'use client';

import { useState, useEffect } from 'react';
import ModernNavbar from '../../components/ModernNavbar';

interface PricingPlan {
  id?: string;
  title: string;
  subtitle: string;
  price: number;
  serviceFee: number;
  features: string[];
  popular: boolean;
  buttonText: string;
  buttonClass: string;
  itemType: 'jamboree' | 'season' | 'bundle' | 'assistant_coach' | 'head_coach';
  category: 'player' | 'coach';
}


export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'player' | 'coach'>('player');
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load pricing plans from Firebase
  useEffect(() => {
    const loadPricingPlans = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch from API endpoint
        const response = await fetch('/api/pricing');
        const data = await response.json();
        
        if (data.plans) {
          setPricingPlans(data.plans);
        } else {
          setError('No pricing plans available at the moment. Please check back later.');
        }
      } catch (err) {
        console.error('Error loading pricing plans:', err);
        setError('Failed to load pricing plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPricingPlans();
  }, []);

  // No static fallback - always use database

  // Filter pricing plans by category
  const currentPricing = pricingPlans.filter(plan => plan.category === activeTab);


  const calculatePricing = (plan: any) => {
    // Simplified pricing calculation without CouponService
    return {
      subtotal: plan.price,
      discount: 0,
      total: plan.price + plan.serviceFee
    };
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


          {/* Loading State */}
          {loading && (
            <div className="row justify-content-center">
              <div className="col-12 text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading pricing plans...</span>
                </div>
                <p className="mt-3 text-muted">Loading pricing plans...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="alert alert-warning" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          {!loading && !error && (
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
                          <span className="price-main">${plan.price.toFixed(2)}</span>
                          
                          <div className="service-fee text-muted small">
                            + ${plan.serviceFee.toFixed(2)} service fee
                          </div>
                          
                          <div className="total-price fw-bold text-success">
                            Total: ${pricing.total.toFixed(2)}
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
                              pricing: pricing
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
          )}

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
