import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Import the registration completion service
    const { completeUserRegistration } = await import('../../../../lib/registration-completion-service');
    
    // Test the registration completion service
    const result = await completeUserRegistration(data);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Registration completion test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
