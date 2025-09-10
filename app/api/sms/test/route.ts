import { NextRequest, NextResponse } from 'next/server';
import TwilioSMSService from '@/lib/twilio-service';

const smsService = new TwilioSMSService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to = '+19196083415', message = 'Hello from All Pro Sports NC SMS Text Service!' } = body;

    // Send test SMS
    const smsMessage = await smsService.sendSMS(to, message);

    return NextResponse.json({
      success: true,
      message: 'Test SMS sent successfully',
      details: {
        to,
        message,
        messageId: (smsMessage as any).id,
        status: (smsMessage as any).status,
        sentAt: (smsMessage as any).sentAt
      }
    });

  } catch (error: any) {
    console.error('SMS test API error:', error);
    
    let errorMessage = 'Failed to send test SMS';
    
    if (error.code === 20003) {
      errorMessage = 'Twilio authentication failed. Check credentials.';
    } else if (error.code === 21211) {
      errorMessage = 'Invalid phone number format. Include country code.';
    } else if (error.code === 21608) {
      errorMessage = 'Phone number not verified in Twilio account.';
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SMS test endpoint',
    usage: 'POST to this endpoint to send a test SMS',
    defaultRecipient: '+19196083415',
    defaultMessage: 'Hello from All Pro Sports NC SMS Text Service!'
  });
}
