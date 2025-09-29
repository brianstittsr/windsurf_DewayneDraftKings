import { NextResponse } from 'next/server';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    tests: []
  };

  // Test 1: Check environment variables
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const envTest = {
    name: 'Environment Variables',
    status: 'checking',
    details: {}
  };

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    envTest.details[varName] = {
      set: !!value,
      length: value?.length || 0,
      preview: value ? `${value.substring(0, 8)}...` : 'NOT SET'
    };
  });

  const missingVars = requiredVars.filter(v => !process.env[v]);
  envTest.status = missingVars.length === 0 ? 'PASS' : 'FAIL';
  if (missingVars.length > 0) {
    envTest.details.missing = missingVars;
  }
  results.tests.push(envTest);

  // Test 2: Try Firebase REST API
  const restTest = {
    name: 'Firebase REST API',
    status: 'checking',
    details: {}
  };

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId) {
      const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?pageSize=1`;
      
      const response = await fetch(restUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      restTest.details.url = restUrl;
      restTest.details.status = response.status;
      restTest.details.statusText = response.statusText;

      if (response.ok) {
        const data = await response.json();
        restTest.status = 'PASS';
        restTest.details.documentsFound = data.documents?.length || 0;
        restTest.details.response = 'Success';
      } else {
        restTest.status = 'FAIL';
        const errorText = await response.text();
        restTest.details.error = errorText;
      }
    } else {
      restTest.status = 'FAIL';
      restTest.details.error = 'No project ID';
    }
  } catch (error) {
    restTest.status = 'FAIL';
    restTest.details.error = error instanceof Error ? error.message : 'Unknown error';
  }
  results.tests.push(restTest);

  // Test 3: Try Firebase Client SDK
  const clientTest = {
    name: 'Firebase Client SDK',
    status: 'checking',
    details: {}
  };

  try {
    const { db } = await import('../../../lib/firebase').catch(err => {
      clientTest.details.importError = err.message;
      return { db: null };
    });

    if (db) {
      clientTest.details.dbConnected = true;
      
      const { collection, getDocs, limit, query } = await import('firebase/firestore');
      const productsRef = collection(db, 'products');
      const q = query(productsRef, limit(1));
      const snapshot = await getDocs(q);
      
      clientTest.status = 'PASS';
      clientTest.details.documentsFound = snapshot.docs.length;
      clientTest.details.response = 'Success';
    } else {
      clientTest.status = 'FAIL';
      clientTest.details.error = 'Database not available';
    }
  } catch (error) {
    clientTest.status = 'FAIL';
    clientTest.details.error = error instanceof Error ? error.message : 'Unknown error';
  }
  results.tests.push(clientTest);

  // Summary
  const passedTests = results.tests.filter(t => t.status === 'PASS').length;
  const totalTests = results.tests.length;
  
  results.summary = {
    passed: passedTests,
    total: totalTests,
    allPassed: passedTests === totalTests,
    recommendation: passedTests === totalTests ? 
      'All tests passed! Firebase should be working.' :
      'Some tests failed. Check the details above for specific issues.'
  };

  return NextResponse.json(results, { 
    status: passedTests === totalTests ? 200 : 500 
  });
}
