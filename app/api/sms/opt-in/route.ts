import { NextRequest, NextResponse } from 'next/server';
import { smsOptInService } from '@/lib/firebase-services';
import { Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { firstName, lastName, phoneNumber, consent } = body;
    
    if (!firstName || !lastName || !phoneNumber || !consent) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, phoneNumber, and consent are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (should be digits only at this point)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    // Format phone number with country code
    const formattedPhone = `+1${cleanPhone}`;

    // Get client IP and user agent for compliance tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create opt-in record
    const optInData = {
      firstName: body.firstName?.trim() || '',
      lastName: body.lastName?.trim() || '',
      phoneNumber: formattedPhone,
      email: body.email?.trim() || undefined,
      consent: true,
      marketingConsent: body.marketingConsent || false,
      source: 'web_form' as const,
      status: 'active' as const,
      optInDate: Timestamp.now(),
      messagesSent: 0,
      tcpaCompliant: true,
      consentText: 'User provided explicit consent via web form opt-in'
    };

    const optInId = await smsOptInService.createOptIn(
      optInData,
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully opted in to SMS notifications',
      optInId,
      phoneNumber: formattedPhone
    });

  } catch (error: any) {
    console.error('SMS opt-in error:', error);
    
    if (error.message === 'Phone number is already opted in') {
      return NextResponse.json(
        { error: 'This phone number is already opted in to receive text messages' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process opt-in request. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    if (phoneNumber) {
      // Check opt-in status for specific phone number
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = `+1${cleanPhone}`;
      
      const optIn = await smsOptInService.getByPhoneNumber(formattedPhone);
      
      return NextResponse.json({
        phoneNumber: formattedPhone,
        optedIn: !!optIn && optIn.status === 'active',
        status: optIn?.status || 'not_found',
        optInDate: optIn?.optInDate || null
      });
    }

    // Return general opt-in information
    return NextResponse.json({
      message: 'SMS Opt-in API',
      endpoints: {
        'POST /api/sms/opt-in': 'Submit opt-in form',
        'GET /api/sms/opt-in?phone=1234567890': 'Check opt-in status'
      },
      requiredFields: ['firstName', 'lastName', 'phoneNumber', 'consent'],
      optionalFields: ['email', 'marketingConsent']
    });

  } catch (error) {
    console.error('SMS opt-in GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
