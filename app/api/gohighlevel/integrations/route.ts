import { NextRequest, NextResponse } from 'next/server';
import { GoHighLevelIntegration } from '../../../../lib/firestore-schema';

// GET /api/gohighlevel/integrations - Get all integrations
export async function GET(request: NextRequest) {
  try {
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        integrations: [],
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    
    const integrationsQuery = query(
      collection(db, 'gohighlevel_integrations'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(integrationsQuery);
    const integrations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      integrations
    });
  } catch (error) {
    console.error('Error fetching GoHighLevel integrations:', error);
    return NextResponse.json({ 
      success: false, 
      integrations: [],
      error: 'Failed to fetch integrations' 
    }, { status: 500 });
  }
}

// POST /api/gohighlevel/integrations - Create new integration
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { db } = await import('../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    // Validate required fields
    if (!data.name || !data.apiToken || !data.locationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, apiToken, locationId'
      }, { status: 400 });
    }

    const integrationData: Partial<GoHighLevelIntegration> = {
      // API Configuration
      apiToken: data.apiToken, // In production, encrypt this
      locationId: data.locationId,
      agencyId: data.agencyId || null,
      
      // Integration Settings
      name: data.name,
      description: data.description || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      
      // Sync Settings
      syncContacts: data.syncContacts !== undefined ? data.syncContacts : true,
      syncOpportunities: data.syncOpportunities !== undefined ? data.syncOpportunities : true,
      syncCalendars: data.syncCalendars !== undefined ? data.syncCalendars : false,
      syncPipelines: data.syncPipelines !== undefined ? data.syncPipelines : false,
      syncCampaigns: data.syncCampaigns !== undefined ? data.syncCampaigns : false,
      
      // Mapping Configuration
      contactMapping: data.contactMapping || {},
      
      // Pipeline Configuration
      defaultPipelineId: data.defaultPipelineId || null,
      defaultStageId: data.defaultStageId || null,
      
      // Webhook Configuration
      webhookUrl: data.webhookUrl || null,
      webhookSecret: data.webhookSecret || null,
      enableWebhooks: data.enableWebhooks !== undefined ? data.enableWebhooks : false,
      
      // Last Sync Information
      lastSyncAt: null,
      lastSyncStatus: 'never' as const,
      lastSyncError: null,
      totalContactsSynced: 0,
      totalOpportunitiesSynced: 0,
      
      // Rate Limiting
      rateLimitRemaining: null,
      rateLimitReset: null,
      
      // Metadata
      createdBy: 'admin', // TODO: Get from auth context
      lastModifiedBy: 'admin',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'gohighlevel_integrations'), integrationData);

    return NextResponse.json({
      success: true,
      integration: {
        id: docRef.id,
        ...integrationData
      }
    });
  } catch (error) {
    console.error('Error creating GoHighLevel integration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create integration' 
    }, { status: 500 });
  }
}
