import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/tournaments/email-bracket - Email tournament bracket as PDF
export async function POST(request: NextRequest) {
  try {
    const { email, tournamentName, bracketImage } = await request.json();

    if (!email || !tournamentName || !bracketImage) {
      return NextResponse.json({
        success: false,
        error: 'Email, tournament name, and bracket image are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email address'
      }, { status: 400 });
    }

    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('✗ Email not configured - missing EMAIL_USER or EMAIL_PASS');
      return NextResponse.json({
        success: false,
        error: 'Email service not configured',
        details: 'Please configure EMAIL_USER and EMAIL_PASS environment variables. See docs/email-setup-guide.md for instructions.'
      }, { status: 503 });
    }

    // Convert base64 image to buffer for attachment
    const base64Data = bracketImage.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Use nodemailer to send email
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.privateemail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: `${tournamentName} - Tournament Bracket`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">${tournamentName}</h2>
          <p>Please find the tournament bracket attached to this email.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Tournament Details</h3>
            <p><strong>Tournament:</strong> ${tournamentName}</p>
            <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>The bracket is attached as an image. You can also download it as a PDF from the admin dashboard.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
          
          <p style="color: #6c757d; font-size: 12px;">
            This email was sent from All Pro Sports NC Tournament Management System.<br>
            If you have any questions, please contact us.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${tournamentName.replace(/\s+/g, '-')}-bracket.png`,
          content: imageBuffer,
          contentType: 'image/png'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    console.log(`✓ Tournament bracket emailed to: ${email}`);

    return NextResponse.json({
      success: true,
      message: `Bracket emailed to ${email} successfully`
    });

  } catch (error: any) {
    console.error('✗ Error emailing bracket:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to email bracket',
      details: error.message
    }, { status: 500 });
  }
}
