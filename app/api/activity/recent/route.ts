import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for now - replace with actual database queries
    const activities = [
      {
        id: '1',
        type: 'registration',
        user: 'System',
        action: 'New player registration completed',
        time: '2 hours ago'
      },
      {
        id: '2',
        type: 'payment',
        user: 'Payment System',
        action: 'Payment processed successfully',
        time: '4 hours ago'
      },
      {
        id: '3',
        type: 'team',
        user: 'Admin',
        action: 'New team created: Lightning Bolts',
        time: '6 hours ago'
      }
    ];

    return NextResponse.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ 
      success: false, 
      activities: [] 
    });
  }
}
