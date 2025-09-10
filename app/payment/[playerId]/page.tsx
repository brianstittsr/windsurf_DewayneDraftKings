'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const playerId = params.playerId as string;
  
  const [loading, setLoading] = useState(true);

  // Redirect to checkout page if registration data exists
  useEffect(() => {
    const registrationParam = searchParams.get('registration');
    
    if (registrationParam) {
      // Redirect to new checkout page
      router.push(`/checkout?registration=${registrationParam}`);
    } else {
      // No registration data, redirect to registration
      router.push('/register');
    }
  }, [searchParams, router]);

  return (
    <div className="container mt-5 pt-5">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Redirecting to checkout...</p>
      </div>
    </div>
  );
}
