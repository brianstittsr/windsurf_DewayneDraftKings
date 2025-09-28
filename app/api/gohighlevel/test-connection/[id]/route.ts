import { NextRequest, NextResponse } from 'next/server';

// POST /api/gohighlevel/test-connection/[id] - Test GoHighLevel connection
export async function POST(
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

    const { doc, getDoc } = await import('firebase/firestore');
    
    // Get integration details
    const integrationRef = doc(db, 'gohighlevel_integrations', integrationId);
    const integrationSnap = await getDoc(integrationRef);
    
    if (!integrationSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found'
      }, { status: 404 });
    }

    const integration = integrationSnap.data();
    
    // Test connection to GoHighLevel API
    try {
      const response = await fetch(`https://services.leadconnectorhq.com/locations/${integration.locationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${integration.apiToken}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({
          success: false,
          error: `GoHighLevel API Error: ${response.status} - ${errorData.message || 'Unknown error'}`
        }, { status: 400 });
      }

      const locationData = await response.json();
      
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        locationName: locationData.location?.name || 'Unknown Location',
        locationData: {
          id: locationData.location?.id,
          name: locationData.location?.name,
          address: locationData.location?.address,
          timezone: locationData.location?.timezone
        }
      });
    } catch (apiError) {
      console.error('GoHighLevel API connection error:', apiError);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to GoHighLevel API. Please check your API token and location ID.'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error testing GoHighLevel connection:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to test connection' 
    }, { status: 500 });
  }
}
