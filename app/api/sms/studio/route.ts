import { NextRequest, NextResponse } from 'next/server';
import { twilioStudioService } from '@/lib/twilio-studio-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phoneNumber, journeyType, context, executionSid } = body;

    switch (action) {
      case 'start_journey':
        if (!phoneNumber || !journeyType) {
          return NextResponse.json(
            { error: 'Phone number and journey type are required' },
            { status: 400 }
          );
        }

        const execution = await twilioStudioService.startJourney(
          journeyType,
          phoneNumber,
          context || {}
        );

        return NextResponse.json({
          success: true,
          execution,
          message: `Started ${journeyType} journey for ${phoneNumber}`
        });

      case 'get_status':
        if (!executionSid) {
          return NextResponse.json(
            { error: 'Execution SID is required' },
            { status: 400 }
          );
        }

        const status = await twilioStudioService.getJourneyStatus(executionSid);
        return NextResponse.json({ success: true, status });

      case 'stop_journey':
        if (!executionSid) {
          return NextResponse.json(
            { error: 'Execution SID is required' },
            { status: 400 }
          );
        }

        const stopped = await twilioStudioService.stopJourney(executionSid);
        return NextResponse.json({
          success: stopped,
          message: stopped ? 'Journey stopped' : 'Failed to stop journey'
        });

      case 'trigger_by_action':
        if (!phoneNumber || !body.trigger) {
          return NextResponse.json(
            { error: 'Phone number and trigger are required' },
            { status: 400 }
          );
        }

        const triggered = await twilioStudioService.triggerJourneyByAction(
          body.trigger,
          phoneNumber,
          context || {}
        );

        return NextResponse.json({
          success: true,
          executions: triggered,
          message: `Triggered ${triggered.length} journeys for ${phoneNumber}`
        });

      case 'list_journeys':
        const journeys = twilioStudioService.getAvailableJourneys();
        return NextResponse.json({ success: true, journeys });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Studio API error:', error);
    return NextResponse.json(
      { error: 'Failed to process Studio request' },
      { status: 500 }
    );
  }
}

// Handle Twilio Studio webhooks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Convert URL search params to webhook data object
    const webhookData: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      webhookData[key] = value;
    });

    await twilioStudioService.handleWebhook(webhookData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Studio webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
