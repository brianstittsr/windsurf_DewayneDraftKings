'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ModernNavbar from '../../components/ModernNavbar';
import RegistrationWizard from '../../components/RegistrationWizard';

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    // Get plan data from URL parameters
    const plan = searchParams.get('plan');
    const title = searchParams.get('title');
    const price = searchParams.get('price');
    const serviceFee = searchParams.get('serviceFee');
    const category = searchParams.get('category');

    if (plan && title && price && serviceFee && category) {
      setSelectedPlan({
        plan,
        title,
        price: parseFloat(price),
        serviceFee: parseFloat(serviceFee),
        category,
        total: parseFloat(price) + parseFloat(serviceFee)
      });
    }
  }, [searchParams]);

  return (
    <>
      <ModernNavbar />
      <RegistrationWizard selectedPlan={selectedPlan} />
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <>
        <ModernNavbar />
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
