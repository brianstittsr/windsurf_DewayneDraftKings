import { NextRequest, NextResponse } from 'next/server';
import { twilioService } from '@/lib/twilio-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract Twilio webhook data
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const errorCode = formData.get('ErrorCode') as string;
    const errorMessage = formData.get('ErrorMessage') as string;

    // Handle status updates (delivery receipts)
    if (messageSid && messageStatus) {
      await twilioService.updateMessageStatus(
        messageSid,
        messageStatus,
        errorCode,
        errorMessage
      );
    }

    // Handle incoming messages (replies)
    if (from && body) {
      await twilioService.handleIncomingSMS(from, body, messageSid);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in SMS webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
