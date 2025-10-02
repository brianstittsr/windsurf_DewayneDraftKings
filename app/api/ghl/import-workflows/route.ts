import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/ghl/import-workflows - Fetch existing workflows from GoHighLevel
export async function GET() {
  try {
    console.log('=== GHL Import Workflows endpoint called ===');
    
    const apiKey = process.env.GOHIGHLEVEL_API_KEY;
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID;

    console.log('Checking GHL credentials:', {
      hasApiKey: !!apiKey,
      hasLocationId: !!locationId
    });

    if (!apiKey || !locationId) {
      console.warn('⚠ GoHighLevel credentials not configured');
      // Return empty array instead of error to allow UI to load
      return NextResponse.json({
        success: true,
        workflows: [],
        count: 0,
        message: 'GoHighLevel API credentials not configured. Please add GOHIGHLEVEL_API_KEY and GOHIGHLEVEL_LOCATION_ID to environment variables.'
      });
    }

    console.log('✓ GHL credentials available');
    console.log('Fetching workflows from GoHighLevel API...');

    // Use Axios to fetch workflows from GoHighLevel API v2
    const axios = (await import('axios')).default;
    
    const ghlClient = axios.create({
      baseURL: 'https://services.leadconnectorhq.com',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      timeout: 30000
    });

    console.log('Fetching workflows from GoHighLevel API v2...');
    
    try {
      // GHL API v2 endpoint for workflows
      const response = await ghlClient.get(`/workflows/`, {
        params: {
          locationId: locationId
        }
      });
      
      // API v2 returns workflows in response.data.workflows array
      const workflows = response.data.workflows || response.data || [];
      
      console.log('✓ Workflows fetched from GHL:', workflows.length);

      // Store workflows in Firebase with original GHL format
      const firebaseModule = await import('../../../../lib/firebase').catch(() => ({ db: null }));
      const { db } = firebaseModule;
      
      if (db) {
        const { collection, addDoc, Timestamp, query, where, getDocs } = await import('firebase/firestore');
        
        for (const workflow of workflows) {
          try {
            // Check if workflow already exists
            const workflowsRef = collection(db, 'ghl_imported_workflows');
            const q = query(workflowsRef, where('ghlWorkflowId', '==', workflow.id));
            const existingDocs = await getDocs(q);
            
            if (existingDocs.empty) {
              // Store new workflow with original GHL format
              await addDoc(workflowsRef, {
                ghlWorkflowId: workflow.id,
                name: workflow.name,
                description: workflow.description || '',
                status: workflow.status || 'draft',
                originalFormat: workflow, // Store complete original GHL format
                trigger: workflow.trigger || {},
                actions: workflow.actions || [],
                importedAt: Timestamp.now(),
                plainLanguagePrompt: null, // Will be generated on demand
                locationId: locationId
              });
              console.log(`✓ Stored workflow: ${workflow.name}`);
            } else {
              console.log(`⚠ Workflow already exists: ${workflow.name}`);
            }
          } catch (storeError) {
            console.error(`Error storing workflow ${workflow.name}:`, storeError);
          }
        }
      }

      return NextResponse.json({
        success: true,
        workflows: workflows,
        count: workflows.length,
        message: `Successfully imported ${workflows.length} workflows from GoHighLevel`
      });
      
    } catch (axiosError: any) {
      console.error('✗ GHL API Error:', axiosError.response?.status, axiosError.response?.data);
      
      // Return empty array with error message instead of failing
      return NextResponse.json({
        success: true,
        workflows: [],
        count: 0,
        message: `GoHighLevel API error: ${axiosError.response?.status || 'Unknown'}. Please check your API credentials.`
      });
    }

  } catch (error: any) {
    console.error('✗ Error fetching GHL workflows:', error);
    console.error('Error details:', error?.message);
    
    // Return empty array instead of error to prevent UI crash
    return NextResponse.json({
      success: true,
      workflows: [],
      count: 0,
      message: 'Unable to fetch workflows. Please check your GoHighLevel configuration.'
    });
  }
}
