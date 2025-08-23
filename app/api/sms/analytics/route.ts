import { NextRequest, NextResponse } from 'next/server';
import { smsAnalyticsService } from '@/lib/sms-analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const type = searchParams.get('type') || 'dashboard';

    switch (type) {
      case 'dashboard':
        const dashboardData = await smsAnalyticsService.getDashboardData(days);
        return NextResponse.json({
          success: true,
          data: dashboardData
        });

      case 'delivery':
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const deliveryMetrics = await smsAnalyticsService.getDeliveryMetrics(startDate, endDate);
        return NextResponse.json({
          success: true,
          data: deliveryMetrics
        });

      case 'engagement':
        const engagementMetrics = await smsAnalyticsService.getEngagementMetrics();
        return NextResponse.json({
          success: true,
          data: engagementMetrics
        });

      case 'conversion':
        const conversionMetrics = await smsAnalyticsService.getConversionMetrics();
        return NextResponse.json({
          success: true,
          data: conversionMetrics
        });

      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'track_delivery':
        await smsAnalyticsService.trackDelivery(
          data.messageId,
          data.status,
          data.deliveredAt ? new Date(data.deliveredAt) : undefined
        );
        break;

      case 'track_engagement':
        await smsAnalyticsService.trackEngagement(
          data.subscriberId,
          data.engagementType
        );
        break;

      case 'create_snapshot':
        const date = data.date ? new Date(data.date) : new Date();
        await smsAnalyticsService.createDailySnapshot(date);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing analytics action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
