import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint to create TEST100 coupon
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test endpoint is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Test coupon creation - received data:', JSON.stringify(data, null, 2));
    
    // Return success for testing
    return NextResponse.json({
      success: true,
      message: 'Test coupon creation endpoint working',
      receivedData: data
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}
