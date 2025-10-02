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

    // Fetch workflows from GoHighLevel API
    const response = await fetch(`https://rest.gohighlevel.com/v1/workflows?locationId=${locationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });

    console.log('GHL API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('✗ GHL API Error:', response.status, errorText);
      
      // Return empty array with error message instead of failing
      return NextResponse.json({
        success: true,
        workflows: [],
        count: 0,
        message: `GoHighLevel API returned error ${response.status}. Please check your API credentials.`
      });
    }

    const data = await response.json();
    console.log('✓ Workflows fetched:', data.workflows?.length || 0);

    return NextResponse.json({
      success: true,
      workflows: data.workflows || [],
      count: data.workflows?.length || 0
    });

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
