import { NextRequest, NextResponse } from 'next/server';
import { conversionTrackingService } from '@/lib/conversion-tracking';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'track_click':
        await conversionTrackingService.trackSMSClick(
          data.subscriberId,
          data.messageId,
          data.url,
          data.journeyId,
          data.stepId
        );
        break;

      case 'track_registration':
        await conversionTrackingService.trackRegistration(
          data.subscriberId,
          data.value,
          data.source
        );
        break;

      case 'track_referral':
        await conversionTrackingService.trackReferral(
          data.referrerSubscriberId,
          data.newSubscriberId,
          data.value
        );
        break;

      case 'track_custom':
        await conversionTrackingService.trackConversion(data);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking conversion:', error);
    return NextResponse.json(
      { error: 'Failed to track conversion' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'report';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '10');

    switch (type) {
      case 'report':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'Start date and end date are required for report' },
            { status: 400 }
          );
        }
        
        const report = await conversionTrackingService.getConversionReport(
          new Date(startDate),
          new Date(endDate)
        );
        
        return NextResponse.json({
          success: true,
          data: report
        });

      case 'top_journeys':
        const topJourneys = await conversionTrackingService.getTopPerformingJourneys(limit);
        
        return NextResponse.json({
          success: true,
          data: topJourneys
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error fetching conversion data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversion data' },
      { status: 500 }
    );
  }
}
