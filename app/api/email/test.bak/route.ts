import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to = 'bstitt@mjandco.com' } = body;

    // Verify email service connection first
    const isConnected = await emailService.verifyConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email service connection failed. Please check SMTP configuration.' 
        },
        { status: 500 }
      );
    }

    // Send test email
    await emailService.sendTestEmail(to);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      details: {
        to,
        subject: 'Test from All Pro Sports',
        body: 'Email is now sending from All Pro Sports NC website!'
      }
    });

  } catch (error: any) {
    console.error('Email test API error:', error);
    
    let errorMessage = 'Failed to send test email';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Check SMTP credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Email connection failed. Check SMTP host and port.';
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
    message: 'Email test endpoint',
    usage: 'POST to this endpoint to send a test email',
    defaultRecipient: 'bstitt@mjandco.com'
  });
}
