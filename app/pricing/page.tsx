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
  const [activeTab, setActiveTab] = useState('player');
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch('/api/pricing');
      const data = await response.json();
      
      if (data.plans) {
        setPricingPlans(data.plans);
      } else {
        // Fallback to default pricing if API fails
        setPricingPlans(getDefaultPricing());
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      // Fallback to default pricing
      setPricingPlans(getDefaultPricing());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPricing = (): PricingPlan[] => [
    {
      title: "Jamboree Game",
      subtitle: "Single game participation",
      price: 29.50,
      serviceFee: 3.00,
      features: [
        "Single game entry",
        "Official jersey",
        "Game statistics tracking",
        "Team photo",
        "SMS updates"
      ],
      popular: false,
      buttonText: "Register Now",
      buttonClass: "btn-outline-primary",
      itemType: "jamboree",
      category: "player"
    },
    {
      title: "Jamboree + Season",
      subtitle: "Complete package deal",
      price: 91.50,
      serviceFee: 3.00,
      features: [
        "Jamboree game entry",
        "Full season participation",
        "Official jersey",
        "Complete statistics tracking",
        "Team photos",
        "SMS updates",
        "Playoff eligibility",
        "Awards ceremony",
        "Priority team selection"
      ],
      popular: true,
      buttonText: "Register Now",
      buttonClass: "btn-primary",
      itemType: "bundle",
      category: "player"
    },
    {
      title: "Complete Season",
      subtitle: "Full season participation",
      price: 62.00,
      serviceFee: 3.00,
      features: [
        "All season games",
        "Official jersey",
        "Complete statistics tracking",
        "Team photos",
        "SMS updates",
        "Playoff eligibility",
        "Awards ceremony"
      ],
      popular: false,
      buttonText: "Register Now",
      buttonClass: "btn-outline-primary",
      itemType: "season",
      category: "player"
    },
    {
      title: "Assistant Coach",
      subtitle: "Support coaching role",
      price: 48.00,
      serviceFee: 3.00,
      features: [
        "Team assignment",
        "Coaching materials",
        "Training resources",
        "SMS updates",
        "Coach recognition"
      ],
      popular: false,
      buttonText: "Apply Now",
      buttonClass: "btn-outline-success",
      itemType: "assistant_coach",
      category: "coach"
    },
    {
      title: "Head Coach",
      subtitle: "Lead coaching position",
      price: 78.00,
      serviceFee: 3.00,
      features: [
        "Team leadership",
        "Full coaching materials",
        "Advanced training resources",
        "SMS updates",
        "Coach recognition",
        "Team management tools",
        "Priority support"
      ],
      popular: true,
      buttonText: "Apply Now",
      buttonClass: "btn-success",
      itemType: "head_coach",
      category: "coach"
    }
  ];

  const filteredPlans = pricingPlans.filter(plan => plan.category === activeTab);

  const handleRegister = (plan: PricingPlan) => {
    const params = new URLSearchParams({
      plan: plan.itemType,
      title: plan.title,
      price: plan.price.toString(),
      category: plan.category
    });
    
    window.location.href = `/register?${params.toString()}`;
  };

  if (loading) {
    return (
      <>
        <ModernNavbar />
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading pricing plans...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ModernNavbar />
      
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-4">Join All Pro Sports</h1>
              <p className="lead mb-4">
                Choose your registration type and join our elite athletic community. 
                All plans include SMS updates, professional statistics tracking, and team support.
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
            <div className="col-lg-6">
              <div className="nav nav-pills nav-fill bg-light rounded p-1" role="tablist">
                <button
                  className={`nav-link ${activeTab === 'player' ? 'active' : ''}`}
                  onClick={() => setActiveTab('player')}
                  type="button"
                >
                  <i className="fas fa-running me-2"></i>
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

          {/* Pricing Cards */}
          <div className="row justify-content-center g-4" style={{paddingTop: '25px'}}>
            {filteredPlans.map((plan, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="position-relative" style={{paddingTop: plan.popular ? '25px' : '0'}}>
                  {plan.popular && (
                    <div className="position-absolute w-100 d-flex justify-content-center" style={{top: '0', zIndex: 10}}>
                      <span className="badge bg-primary px-3 py-2 text-nowrap shadow-sm">
                        <i className="fas fa-star me-1"></i>
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className={`card h-100 shadow-sm ${plan.popular ? 'border-primary' : ''}`}>
                    <div className={`card-header bg-transparent text-center ${plan.popular ? 'pt-5 pb-4' : 'py-4'}`}>
                    <h4 className="card-title mb-2">{plan.title}</h4>
                    <p className="text-muted mb-3">{plan.subtitle}</p>
                    <div className="pricing-display">
                      <span className="h2 fw-bold text-primary">${plan.price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <ul className="list-unstyled">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="mb-2">
                          <i className="fas fa-check text-success me-2"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="card-footer bg-transparent">
                    <button
                      className={`btn ${plan.buttonClass} w-100 py-2`}
                      onClick={() => handleRegister(plan)}
                    >
                      <i className={`fas ${plan.category === 'player' ? 'fa-user-plus' : 'fa-clipboard-check'} me-2`}></i>
                      {plan.buttonText}
                    </button>
                  </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Important Information */}
          <div className="row justify-content-center mt-5">
            <div className="col-lg-8">
              <div className="card bg-light">
                <div className="card-body">
                  <h4 className="card-title">
                    <i className="fas fa-info-circle me-2"></i>
                    Important Information
                  </h4>
                  <p className="mb-2">
                    <strong>Refund Policy:</strong> Full refunds available up to 7 days before season start. Partial refunds may apply thereafter.
                  </p>
                  <p className="mb-0">
                    <strong>Questions?</strong> Contact our support team at info@allprosportsnc.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
