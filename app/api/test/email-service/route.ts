import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, firstName, lastName, selectedPlan, qrCodes } = await request.json();
    
    // Import email service
    const { EmailService } = await import('../../../../lib/email-service');
    
    const emailService = new EmailService();
    
    const subject = `Test Email - Registration Confirmation for ${firstName} ${lastName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test Registration Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .qr-section { background: white; padding: 15px; margin: 15px 0; text-align: center; }
          .qr-code { max-width: 150px; height: auto; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Test Email - Registration Confirmation</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${firstName} ${lastName}!</h2>
            
            <p>This is a test email to verify the registration completion system is working correctly.</p>
            
            ${selectedPlan ? `
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3>📋 Test Registration Details</h3>
                <p><strong>Plan:</strong> ${selectedPlan.title}</p>
                <p><strong>Amount:</strong> $${selectedPlan.total?.toFixed(2) || selectedPlan.price?.toFixed(2)}</p>
              </div>
            ` : ''}
            
            ${qrCodes ? `
              <div class="qr-section">
                <h3>📱 Your QR Codes</h3>
                <p>Test QR codes generated successfully:</p>
                
                <div style="display: inline-block; margin: 10px;">
                  <h4>Profile QR Code</h4>
                  <img src="${qrCodes.profile}" alt="Profile QR Code" class="qr-code">
                </div>
                
                <div style="display: inline-block; margin: 10px;">
                  <h4>Contact QR Code</h4>
                  <img src="${qrCodes.contact}" alt="Contact QR Code" class="qr-code">
                </div>
              </div>
            ` : ''}
            
            <h3>✅ Test Results</h3>
            <ul>
              <li>Email service: Working</li>
              <li>QR code generation: ${qrCodes ? 'Working' : 'Not tested'}</li>
              <li>HTML email formatting: Working</li>
              <li>Image embedding: ${qrCodes ? 'Working' : 'Not tested'}</li>
            </ul>
            
            <p><strong>Note:</strong> This is a test email from the All Pro Sports registration system.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await emailService.sendEmail({
      to,
      subject,
      html
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      to,
      subject
    });
    
  } catch (error) {
    console.error('Email service test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
