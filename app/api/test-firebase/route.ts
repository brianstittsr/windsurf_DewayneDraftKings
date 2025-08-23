import { NextResponse } from 'next/server';
import { db, auth, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export async function GET() {
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
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection successful!',
      services: {
        firestore: '✅ Connected',
        auth: auth ? '✅ Initialized' : '❌ Failed',
        storage: storage ? '✅ Initialized' : '❌ Failed'
      },
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      testDocumentId: testDoc.id
    });
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Check Firebase configuration and project setup'
    }, { status: 500 });
  }
}
