'use client';

import { useState } from 'react';
import { db, auth, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function TestFirebasePage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('🔥 Testing Firebase connection...');
      
      // Test Firestore connection
      console.log('📊 Testing Firestore...');
      const testCollection = collection(db, 'connection-test');
      
      // Try to add a test document
      const testDoc = await addDoc(testCollection, {
        message: 'Firebase connection test',
        timestamp: new Date(),
        project: 'DraftKings League Management'
      });
      
      console.log('✅ Firestore write successful! Document ID:', testDoc.id);
      
      // Try to read documents
      const snapshot = await getDocs(testCollection);
      console.log('✅ Firestore read successful! Found', snapshot.size, 'documents');
      
      // Clean up test document
      await deleteDoc(doc(db, 'connection-test', testDoc.id));
      console.log('🧹 Test document cleaned up');
      
      setTestResult({
        success: true,
        message: 'Firebase connection successful!',
        services: {
          firestore: '✅ Connected and working',
          auth: auth ? '✅ Initialized' : '❌ Failed',
          storage: storage ? '✅ Initialized' : '❌ Failed'
        },
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        testDocumentId: testDoc.id,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ Firebase connection failed:', error);
      
      setTestResult({
        success: false,
        error: error.message,
        details: 'Check Firebase configuration and project setup',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <h1 className="display-4 mb-4">Firebase Connection Test</h1>
          
          <div className="mb-4">
            <button
              onClick={testFirebaseConnection}
              disabled={loading}
              className="btn dk-btn-primary btn-lg"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Testing...
                </>
              ) : (
                'Test Firebase Connection'
              )}
            </button>
          </div>

          {testResult && (
            <div className={`card dk-card mb-4 ${testResult.success ? 'border-success' : 'border-danger'}`}>
              <div className="card-header">
                <h2 className="card-title h4 mb-0">
                  {testResult.success ? '✅ Test Results' : '❌ Test Failed'}
                </h2>
              </div>
              <div className="card-body">
                {testResult.success ? (
                  <div>
                    <p className="mb-2"><strong>Message:</strong> {testResult.message}</p>
                    <p className="mb-2"><strong>Project ID:</strong> {testResult.projectId}</p>
                    <p className="mb-2"><strong>Test Document ID:</strong> {testResult.testDocumentId}</p>
                    <div className="mb-3">
                      <strong>Services Status:</strong>
                      <ul className="list-unstyled ms-3 mt-2">
                        <li className="mb-1">🔥 Firestore: {testResult.services.firestore}</li>
                        <li className="mb-1">🔐 Authentication: {testResult.services.auth}</li>
                        <li className="mb-1">📁 Storage: {testResult.services.storage}</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="alert alert-danger" role="alert">
                      <strong>Error:</strong> {testResult.error}
                    </div>
                    <p className="mb-2"><strong>Details:</strong> {testResult.details}</p>
                  </div>
                )}
                
                <small className="text-muted">
                  <strong>Timestamp:</strong> {testResult.timestamp}
                </small>
              </div>
            </div>
          )}

          <div className="card dk-card">
            <div className="card-header">
              <h3 className="card-title h5 mb-0">Configuration Check</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-2"><strong>Project ID:</strong> 
                    <span className="badge bg-secondary ms-2">
                      {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}
                    </span>
                  </p>
                  <p className="mb-2"><strong>Auth Domain:</strong> 
                    <span className="badge bg-secondary ms-2">
                      {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-2"><strong>API Key:</strong> 
                    <span className={`badge ms-2 ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'bg-success' : 'bg-danger'}`}>
                      {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
