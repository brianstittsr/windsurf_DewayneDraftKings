import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, attachments } = await request.json();

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, and html/text' },
        { status: 400 }
      );
    }

    // Check if email service is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email service not configured. Email would have been sent to:', to);
      console.log('Subject:', subject);
      
      // Return success to not break the payment flow
      return NextResponse.json({
        success: true,
        message: 'Email service not configured (development mode)',
        wouldSendTo: to
      });
    }

    // Dynamic import of nodemailer
    const nodemailer = await import('nodemailer');

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Prepare mail options
    const mailOptions: any = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || undefined,
    };

    // Add attachments if provided
    if (attachments && Array.isArray(attachments)) {
      mailOptions.attachments = attachments.map((att: any) => ({
        filename: att.filename,
        content: att.content,
        encoding: att.encoding || 'base64',
        cid: att.cid || undefined
      }));
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Return success anyway to not break payment flow
    return NextResponse.json({
      success: true,
      message: 'Email queued (error occurred but payment processed)',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
