import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for now - replace with actual database queries
    const stats = {
      success: true,
      total: 0,
      change: '+0%'
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return NextResponse.json({ 
      success: false, 
      total: 0, 
      change: '+0%' 
    });
  }
}
