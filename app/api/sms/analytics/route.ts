import { NextRequest, NextResponse } from 'next/server';

// Temporarily disabled analytics to fix undici module error
// This will be re-enabled once Firebase compatibility is resolved

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard';

    // Return mock data temporarily
    const mockData = {
      dashboard: {
        delivery: {
          totalSent: 1234,
          totalDelivered: 1198,
          totalFailed: 36,
          deliveryRate: 97.1,
          failureRate: 2.9
        },
        engagement: {
          totalReplies: 45,
          totalOptOuts: 12,
          replyRate: 3.6,
          optOutRate: 1.0,
          activeSubscribers: 580
        },
        conversion: {
          totalClicks: 89,
          clickThroughRate: 7.2,
          conversionsByJourney: {},
          conversionsByStep: {}
        },
        trends: []
      },
      delivery: {
        totalSent: 1234,
        totalDelivered: 1198,
        totalFailed: 36,
        deliveryRate: 97.1,
        failureRate: 2.9
      },
      engagement: {
        totalReplies: 45,
        totalOptOuts: 12,
        replyRate: 3.6,
        optOutRate: 1.0,
        activeSubscribers: 580
      },
      conversion: {
        totalClicks: 89,
        clickThroughRate: 7.2,
        conversionsByJourney: {},
        conversionsByStep: {}
      }
    };

    return NextResponse.json({
      success: true,
      data: mockData[type as keyof typeof mockData] || mockData.dashboard
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Return success for now - analytics tracking disabled temporarily
    return NextResponse.json({ success: true, message: 'Analytics temporarily disabled' });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics action' },
      { status: 500 }
    );
  }
}
