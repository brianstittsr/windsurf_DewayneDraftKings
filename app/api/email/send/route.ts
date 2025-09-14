import { NextRequest, NextResponse } from 'next/server';
import { sendRegistrationEmail } from '@/lib/email-pdf-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationData, email } = body;

    if (!registrationData || !email) {
      return NextResponse.json({ 
        error: 'Registration data and email are required' 
      }, { status: 400 });
    }

    // Check if email environment variables are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email service not configured - missing EMAIL_USER or EMAIL_PASS');
      return NextResponse.json({ 
        error: 'Email service not configured. Please check environment variables.' 
      }, { status: 503 });
    }

    const result = await sendRegistrationEmail(registrationData, email);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Registration confirmation email sent successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Email sending failed'
    }, { status: 500 });
  }
}

export async function GET() {
  // Test endpoint to check email configuration
  const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  
  return NextResponse.json({
    emailConfigured,
    config: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || '587',
      secure: process.env.EMAIL_SECURE === 'true',
      userConfigured: !!process.env.EMAIL_USER,
      passConfigured: !!process.env.EMAIL_PASS
    }
  });
}
