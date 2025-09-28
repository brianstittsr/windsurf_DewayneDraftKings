import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow this in development or for debugging
  const isDev = process.env.NODE_ENV === 'development';
  const isVercel = process.env.VERCEL === '1';
  
  if (!isDev && !isVercel) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const envStatus = {
    environment: process.env.NODE_ENV,
    isVercel: isVercel,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 
      `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ? 
      `${process.env.STRIPE_SECRET_KEY.substring(0, 12)}...` : 'NOT SET',
    firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET',
    firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 
      `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 12)}...` : 'NOT SET',
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(envStatus);
}
