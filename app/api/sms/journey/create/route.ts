import { NextRequest, NextResponse } from 'next/server';
import { smsJourneyService, SMSJourneyService } from '@/lib/sms-journey-service';

export async function POST(request: NextRequest) {
  try {
    const journeyData = await request.json();

    // Validate required fields
    if (!journeyData.name || !journeyData.type || !journeyData.steps) {
      return NextResponse.json(
        { error: 'Name, type, and steps are required' },
        { status: 400 }
      );
    }

    // Create the journey
    const journeyId = await smsJourneyService.createJourney(journeyData);

    return NextResponse.json({
      success: true,
      journeyId,
      message: 'Journey created successfully'
    });

  } catch (error) {
    console.error('Error creating SMS journey:', error);
    return NextResponse.json(
      { error: 'Failed to create journey' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return predefined journey templates
    const templates = SMSJourneyService.getJourneyTemplates();

    return NextResponse.json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('Error fetching journey templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
