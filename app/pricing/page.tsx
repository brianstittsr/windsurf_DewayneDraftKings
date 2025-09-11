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
        
        // Dynamic import to avoid build errors
        const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
        
        if (!db) {
          console.warn('Firebase not available, using static pricing data');
          setPricingPlans(getStaticPricingData());
          setError(''); // Clear any previous errors
          setLoading(false);
          return;
        }

        const { collection, getDocs } = await import('firebase/firestore');
        const pricingRef = collection(db, 'pricing');
        const snapshot = await getDocs(pricingRef);
        
        if (snapshot.empty) {
          console.log('No pricing data in Firebase, using static data');
          setPricingPlans(getStaticPricingData());
          setError(''); // Clear any previous errors
        } else {
          const plans = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as PricingPlan[];
          setPricingPlans(plans);
          setError(''); // Clear any previous errors
        }
      } catch (err) {
        console.error('Error loading pricing plans:', err);
        console.log('Falling back to static pricing data');
        setPricingPlans(getStaticPricingData());
        setError(''); // Don't show error to user, just use fallback data
      } finally {
        setLoading(false);
      }
    };

    loadPricingPlans();
  }, []);

  // Static pricing data as fallback
  const getStaticPricingData = (): PricingPlan[] => [
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
      itemType: 'jamboree',
      category: 'player'
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
      buttonText: 'Get Started',
      buttonClass: 'btn-primary',
      itemType: 'bundle',
      category: 'player'
    },
    {
      title: 'Complete Season',
      subtitle: 'Full season access',
      price: 59.00,
      serviceFee: 3.00,
      features: [
        'Complete season registration',
        'All regular season games',
        'Playoff eligibility',
        'Official team jersey',
        'Advanced stats tracking',
        'Team events access',
        'Season awards eligibility'
      ],
      popular: false,
      buttonText: 'Join Season',
      buttonClass: 'btn-outline-primary',
      itemType: 'season',
      category: 'player'
    },
    {
      title: 'Assistant Coach',
      subtitle: 'Support role',
      price: 45.00,
      serviceFee: 3.00,
      features: [
        'Assistant coaching role',
        'Team management access',
        'Player development training',
        'Game day sideline access',
        'Coach certification',
        'Equipment provided'
      ],
      popular: false,
      buttonText: 'Apply Now',
      buttonClass: 'btn-outline-primary',
      itemType: 'assistant_coach',
      category: 'coach'
    },
    {
      title: 'Head Coach',
      subtitle: 'Leadership role',
      price: 75.00,
      serviceFee: 3.00,
      features: [
        'Head coaching position',
        'Full team management',
        'Strategic planning authority',
        'Player recruitment rights',
        'Advanced coach training',
        'Leadership certification',
        'Premium equipment package'
      ],
      popular: true,
      buttonText: 'Lead Team',
      buttonClass: 'btn-primary',
      itemType: 'head_coach',
      category: 'coach'
    }
  ];

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
