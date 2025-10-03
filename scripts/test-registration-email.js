/**
 * Test script to send a mock registration confirmation email
 * Run: node scripts/test-registration-email.js
 */

const mockRegistrationData = {
  email: 'brianstittsr@gmail.com',
  firstName: 'Brian',
  lastName: 'Stitt',
  planName: 'Basic Registration',
  planAmount: 87.00,
  registrationDate: new Date().toLocaleDateString(),
  profileId: 'test-profile-123',
  sessionId: 'test-session-456'
};

async function sendTestEmail() {
  try {
    console.log('📧 Sending test registration email...');
    console.log('To:', mockRegistrationData.email);
    console.log('');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: mockRegistrationData.email,
        subject: 'Welcome to All Pro Sports NC - Registration Confirmed',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
              h1 { margin: 0; font-size: 28px; }
              h2 { color: #667eea; margin-top: 0; }
              .highlight { background: #fff3cd; padding: 2px 6px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏈 Welcome to All Pro Sports NC!</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px;">Registration Confirmed</p>
              </div>
              
              <div class="content">
                <p>Hi <strong>${mockRegistrationData.firstName}</strong>,</p>
                
                <p>Thank you for registering with All Pro Sports NC! We're excited to have you join our community.</p>
                
                <div class="info-box">
                  <h2>📋 Registration Details</h2>
                  <p><strong>Name:</strong> ${mockRegistrationData.firstName} ${mockRegistrationData.lastName}</p>
                  <p><strong>Email:</strong> ${mockRegistrationData.email}</p>
                  <p><strong>Plan:</strong> ${mockRegistrationData.planName}</p>
                  <p><strong>Amount Paid:</strong> $${mockRegistrationData.planAmount.toFixed(2)}</p>
                  <p><strong>Registration Date:</strong> ${mockRegistrationData.registrationDate}</p>
                </div>
                
                <div class="info-box">
                  <h2>✅ What's Included</h2>
                  <ul>
                    <li>✓ QR Code for easy check-in (attached)</li>
                    <li>✓ Access to all league events</li>
                    <li>✓ Player profile in our system</li>
                    <li>✓ SMS notifications for games and events</li>
                    <li>✓ Digital registration confirmation (this email)</li>
                  </ul>
                </div>
                
                <div class="info-box">
                  <h2>📱 Next Steps</h2>
                  <ol>
                    <li><strong>Save your QR code</strong> - You'll need it for check-in at events</li>
                    <li><strong>Complete medical forms</strong> - Required before first game</li>
                    <li><strong>Check your schedule</strong> - Games and practice times will be sent via SMS</li>
                    <li><strong>Join our community</strong> - Follow us on social media for updates</li>
                  </ol>
                </div>
                
                <div style="text-align: center;">
                  <a href="${baseUrl}/admin?tab=user-profiles" class="button">
                    View My Profile
                  </a>
                </div>
                
                <div class="info-box" style="background: #d1ecf1; border-left-color: #0c5460;">
                  <p style="margin: 0;"><strong>📞 Need Help?</strong></p>
                  <p style="margin: 10px 0 0 0;">
                    Contact us at: <a href="mailto:info@allprosportsnc.com">info@allprosportsnc.com</a><br>
                    Phone: (919) 555-0100
                  </p>
                </div>
              </div>
              
              <div class="footer">
                <p><strong>All Pro Sports NC</strong></p>
                <p>Professional Youth Sports League</p>
                <p>This is an automated message. Please do not reply to this email.</p>
                <p style="margin-top: 15px;">
                  <a href="${baseUrl}" style="color: #667eea; text-decoration: none;">Visit Website</a> | 
                  <a href="${baseUrl}/contact" style="color: #667eea; text-decoration: none;">Contact Us</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome to All Pro Sports NC!

Hi ${mockRegistrationData.firstName},

Thank you for registering! Here are your registration details:

Name: ${mockRegistrationData.firstName} ${mockRegistrationData.lastName}
Email: ${mockRegistrationData.email}
Plan: ${mockRegistrationData.planName}
Amount: $${mockRegistrationData.planAmount.toFixed(2)}
Date: ${mockRegistrationData.registrationDate}

What's Included:
- QR Code for check-in
- Access to all league events
- Player profile
- SMS notifications
- Digital confirmation

Next Steps:
1. Save your QR code
2. Complete medical forms
3. Check your schedule
4. Join our community

Need help? Contact us at info@allprosportsnc.com or (919) 555-0100

All Pro Sports NC
        `
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Check', mockRegistrationData.email);
      console.log('');
      console.log('Email Details:');
      console.log('- Subject: Welcome to All Pro Sports NC - Registration Confirmed');
      console.log('- Recipient:', mockRegistrationData.email);
      console.log('- Plan:', mockRegistrationData.planName);
      console.log('- Amount: $' + mockRegistrationData.planAmount.toFixed(2));
    } else {
      console.error('❌ Failed to send email');
      console.error('Error:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
      console.log('');
      console.log('💡 Make sure email environment variables are configured:');
      console.log('   EMAIL_USER=info@allprosportsnc.com');
      console.log('   EMAIL_PASS=4Football!');
      console.log('   EMAIL_HOST=smtp.privateemail.com');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

// Run the script
sendTestEmail();
