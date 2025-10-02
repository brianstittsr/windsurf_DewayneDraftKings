import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/ghl/workflows - Get all saved workflows
export async function GET() {
  try {
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: true, 
        workflows: [] 
      });
    }

    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const workflowsRef = collection(db, 'ghl_workflows');
    const q = query(workflowsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const workflows = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        deployedAt: data.deployedAt?.toDate?.()?.toISOString() || null
      };
    });

    return NextResponse.json({
      success: true,
      workflows
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ 
      success: false, 
      workflows: [],
      error: 'Failed to fetch workflows' 
    }, { status: 500 });
  }
}

// POST /api/ghl/workflows - Save a new workflow
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    const workflowData = {
      name: data.name,
      description: data.description || '',
      workflow: data.workflow,
      status: 'draft', // draft, deployed, archived
      ghlWorkflowId: null, // Set when deployed to GoHighLevel
      createdBy: 'admin', // TODO: Get from auth
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      deployedAt: null
    };
    
    const workflowsRef = collection(db, 'ghl_workflows');
    const docRef = await addDoc(workflowsRef, workflowData);
    
    return NextResponse.json({
      success: true,
      message: 'Workflow saved successfully',
      workflowId: docRef.id
    });
  } catch (error) {
    console.error('Error saving workflow:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save workflow' 
    }, { status: 500 });
  }
}

// DELETE /api/ghl/workflows?id=xxx - Delete a workflow
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Workflow ID is required' 
      }, { status: 400 });
    }
    
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database unavailable' 
      }, { status: 503 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    
    const workflowRef = doc(db, 'ghl_workflows', id);
    await deleteDoc(workflowRef);
    
    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete workflow' 
    }, { status: 500 });
  }
}
