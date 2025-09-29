#!/usr/bin/env node

/**
 * Vercel Environment Setup Script
 * This script helps you set up all required environment variables for Vercel deployment
 */

const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupVercelEnv() {
  console.log('\n🚀 Vercel Environment Setup for All Pro Sports\n');
  console.log('This script will help you set up all required environment variables for Vercel.\n');

  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('❌ Vercel CLI not found. Please install it first:');
    console.log('npm i -g vercel\n');
    process.exit(1);
  }

  console.log('📋 Required Environment Variables:\n');

  const envVars = [
    {
      name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
      description: 'Firebase API Key (from Firebase Console)',
      required: true
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      description: 'Firebase Auth Domain (usually: your-project.firebaseapp.com)',
      required: true
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      description: 'Firebase Project ID',
      required: true
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      description: 'Firebase Storage Bucket (usually: your-project.appspot.com)',
      required: true
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      description: 'Firebase Messaging Sender ID',
      required: true
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_APP_ID',
      description: 'Firebase App ID',
      required: true
    },
    {
      name: 'STRIPE_SECRET_KEY',
      description: 'Stripe Secret Key (sk_test_... for testing)',
      required: true
    },
    {
      name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      description: 'Stripe Publishable Key (pk_test_... for testing)',
      required: true
    },
    {
      name: 'JWT_SECRET',
      description: 'JWT Secret for admin authentication (any secure random string)',
      required: true
    }
  ];

  const shouldSetup = await question('Do you want to set up environment variables? (y/n): ');
  
  if (shouldSetup.toLowerCase() !== 'y') {
    console.log('\n📝 Manual Setup Instructions:');
    console.log('1. Go to your Vercel Dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings → Environment Variables');
    console.log('4. Add the following variables:\n');
    
    envVars.forEach(envVar => {
      console.log(`${envVar.name}=${envVar.description}`);
    });
    
    console.log('\n5. Redeploy your application\n');
    rl.close();
    return;
  }

  console.log('\n🔧 Setting up environment variables...\n');

  for (const envVar of envVars) {
    const value = await question(`Enter ${envVar.name}: `);
    
    if (envVar.required && !value.trim()) {
      console.log(`❌ ${envVar.name} is required!`);
      process.exit(1);
    }

    try {
      execSync(`vercel env add ${envVar.name} production`, {
        input: value,
        stdio: ['pipe', 'inherit', 'inherit']
      });
      console.log(`✅ Added ${envVar.name}`);
    } catch (error) {
      console.log(`❌ Failed to add ${envVar.name}:`, error.message);
    }
  }

  console.log('\n🎉 Environment variables setup complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Run: vercel --prod');
  console.log('2. Test your deployment');
  console.log('3. Check: https://your-app.vercel.app/api/debug/env');
  console.log('4. Verify products load: https://your-app.vercel.app/api/products\n');

  rl.close();
}

// Run the setup
setupVercelEnv().catch(console.error);
