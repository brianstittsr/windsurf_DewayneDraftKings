import { NextRequest, NextResponse } from 'next/server';

// PUT /api/gohighlevel/integrations/[id] - Update integration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const integrationId = params.id;
    
    const { db } = await import('../../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    
    const integrationRef = doc(db, 'gohighlevel_integrations', integrationId);
    
    const updateData = {
      name: data.name,
      description: data.description || '',
      apiToken: data.apiToken,
      locationId: data.locationId,
      agencyId: data.agencyId || null,
      isActive: data.isActive,
      syncContacts: data.syncContacts,
      syncOpportunities: data.syncOpportunities,
      syncCalendars: data.syncCalendars,
      syncPipelines: data.syncPipelines,
      syncCampaigns: data.syncCampaigns,
      defaultPipelineId: data.defaultPipelineId || null,
      defaultStageId: data.defaultStageId || null,
      enableWebhooks: data.enableWebhooks,
      webhookUrl: data.webhookUrl || null,
      webhookSecret: data.webhookSecret || null,
      lastModifiedBy: 'admin', // TODO: Get from auth context
      updatedAt: Timestamp.now()
    };

    await updateDoc(integrationRef, updateData);

    return NextResponse.json({
      success: true,
      integration: {
        id: integrationId,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating GoHighLevel integration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update integration' 
    }, { status: 500 });
  }
}

// DELETE /api/gohighlevel/integrations/[id] - Delete integration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = params.id;
    
    const { db } = await import('../../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 503 });
    }

    const { doc, deleteDoc } = await import('firebase/firestore');
    
    const integrationRef = doc(db, 'gohighlevel_integrations', integrationId);
    await deleteDoc(integrationRef);

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting GoHighLevel integration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete integration' 
    }, { status: 500 });
  }
}
