import { NextResponse } from 'next/server';

export async function GET() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const envStatus = requiredEnvVars.map(envVar => ({
    name: envVar,
    set: !!process.env[envVar],
    value: process.env[envVar] ? `${process.env[envVar]?.substring(0, 10)}...` : 'NOT SET'
  }));

  const missingVars = envStatus.filter(env => !env.set);

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    allEnvVarsSet: missingVars.length === 0,
    missingVariables: missingVars.map(v => v.name),
    environmentVariables: envStatus,
    instructions: missingVars.length > 0 ? {
      message: "Missing Firebase environment variables on Vercel",
      steps: [
        "1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables",
        "2. Add the missing variables listed above",
        "3. Get values from Firebase Console → Project Settings → General → Your apps",
        "4. Redeploy your application"
      ]
    } : "All environment variables are properly configured!"
  });
}
