import { NextRequest, NextResponse } from 'next/server';
import { twilioService } from '@/lib/twilio-service';
import TwilioSMSService from '@/lib/twilio-service';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { SMS_COLLECTIONS } from '@/lib/sms-schema';

export async function POST(request: NextRequest) {
  try {
    const { phone, message, subscriberId, journeyId, stepId } = await request.json();

    // Validate required fields
    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

      // Validate and format phone number
      if (!TwilioSMSService.validatePhoneNumber(phone)) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        );
      }

      const formattedPhone = TwilioSMSService.formatPhoneNumber(phone);

    // Send SMS
    const smsMessage = await twilioService.sendSMS(
      formattedPhone,
      message,
      subscriberId,
      journeyId,
      stepId
    );

    return NextResponse.json({
      success: true,
      messageId: smsMessage.id,
      twilioSid: smsMessage.twilioSid,
      status: smsMessage.twilioStatus
    });

  } catch (error) {
    console.error('Error in SMS send API:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
