import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/ghl/imported-workflows - Get all imported workflows from Firebase
export async function GET() {
  try {
    console.log('=== Fetching imported GHL workflows from Firebase ===');
    
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      console.warn('⚠ Database unavailable');
      return NextResponse.json({ 
        success: true, 
        workflows: [] 
      });
    }
    console.log('✓ Firebase database available');

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    try {
      const workflowsRef = collection(db, 'ghl_imported_workflows');
      const q = query(workflowsRef, orderBy('importedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const workflows = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          firebaseId: doc.id,
          id: data.ghlWorkflowId,
          ghlWorkflowId: data.ghlWorkflowId,
          name: data.name,
          description: data.description,
          status: data.status,
          originalFormat: data.originalFormat, // Complete GHL workflow JSON
          trigger: data.trigger,
          actions: data.actions,
          plainLanguagePrompt: data.plainLanguagePrompt,
          importedAt: data.importedAt?.toDate?.()?.toISOString() || null,
          convertedAt: data.convertedAt?.toDate?.()?.toISOString() || null,
          locationId: data.locationId
        };
      });

      console.log('✓ Imported workflows fetched:', workflows.length);

      return NextResponse.json({
        success: true,
        workflows
      });
    } catch (firestoreError: any) {
      console.error('✗ Firestore error:', firestoreError);
      return NextResponse.json({ 
        success: true, 
        workflows: []
      });
    }
  } catch (error: any) {
    console.error('✗ Error fetching imported workflows:', error);
    return NextResponse.json({ 
      success: true, 
      workflows: []
    });
  }
}
