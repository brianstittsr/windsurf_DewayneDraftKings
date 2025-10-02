import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/ghl/import-workflows - Fetch existing workflows from GoHighLevel
export async function GET() {
  try {
    const apiKey = process.env.GOHIGHLEVEL_API_KEY;
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID;

    if (!apiKey || !locationId) {
      return NextResponse.json({
        success: false,
        error: 'GoHighLevel API credentials not configured'
      }, { status: 503 });
    }

    // Fetch workflows from GoHighLevel API
    const response = await fetch(`https://rest.gohighlevel.com/v1/workflows?locationId=${locationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });

    if (!response.ok) {
      throw new Error(`GoHighLevel API Error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      workflows: data.workflows || [],
      count: data.workflows?.length || 0
    });

  } catch (error) {
    console.error('Error fetching GHL workflows:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch workflows from GoHighLevel',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
