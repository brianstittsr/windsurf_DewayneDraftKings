import { NextRequest, NextResponse } from 'next/server';
import { smsJourneyService } from '@/lib/sms-journey-service';

export async function POST(request: NextRequest) {
  try {
    const { subscriberId, journeyId } = await request.json();

    // Validate required fields
    if (!subscriberId || !journeyId) {
      return NextResponse.json(
        { error: 'Subscriber ID and Journey ID are required' },
        { status: 400 }
      );
    }

    // Start the subscriber on the journey
    await smsJourneyService.startSubscriberJourney(subscriberId, journeyId);

    return NextResponse.json({
      success: true,
      message: 'Journey started successfully'
    });

  } catch (error) {
    console.error('Error starting SMS journey:', error);
    return NextResponse.json(
      { error: 'Failed to start journey' },
      { status: 500 }
    );
  }
}
