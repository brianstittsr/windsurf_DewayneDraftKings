/**
 * Test Registration Email Script
 * Simulates a completed registration and sends confirmation email
 * Run with: node test-registration-email.js
 */

const testEmail = async () => {
  const testData = {
    to: 'brianstittsr@gmail.com',
    subject: '🏈 Registration Confirmed - All Pro Sports 2025 Fall Season',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Registration Confirmed!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Welcome to All Pro Sports</p>
                  </td>
                </tr>
                
                <!-- Success Message -->
                <tr>
                  <td style="padding: 30px 40px;">
                    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                      <p style="margin: 0; color: #155724; font-weight: bold;">✓ Your registration has been successfully processed!</p>
                    </div>
                    
                    <h2 style="color: #333; margin-top: 0;">Thank You for Registering!</h2>
                    <p style="color: #666; line-height: 1.6;">
                      Congratulations! You're now officially registered for the <strong>2025 Fall Flag Football Season</strong>. 
                      We're excited to have you join our league!
                    </p>
                  </td>
                </tr>
                
                <!-- Registration Details -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                      <tr>
                        <td>
                          <h3 style="color: #667eea; margin-top: 0; margin-bottom: 15px;">📋 Registration Details</h3>
                          
                          <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                              <td style="color: #666; padding: 8px 0;"><strong>Player Name:</strong></td>
                              <td style="color: #333; padding: 8px 0; text-align: right;">Brian Stitts</td>
                            </tr>
                            <tr>
                              <td style="color: #666; padding: 8px 0;"><strong>Email:</strong></td>
                              <td style="color: #333; padding: 8px 0; text-align: right;">brianstittsr@gmail.com</td>
                            </tr>
                            <tr>
                              <td style="color: #666; padding: 8px 0;"><strong>Season:</strong></td>
                              <td style="color: #333; padding: 8px 0; text-align: right;">Fall 2025</td>
                            </tr>
                            <tr>
                              <td style="color: #666; padding: 8px 0;"><strong>League:</strong></td>
                              <td style="color: #333; padding: 8px 0; text-align: right;">Flag Football - Men's</td>
                            </tr>
                            <tr>
                              <td style="color: #666; padding: 8px 0;"><strong>Registration Date:</strong></td>
                              <td style="color: #333; padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                            </tr>
                            <tr style="border-top: 2px solid #dee2e6;">
                              <td style="color: #666; padding: 12px 0 8px 0;"><strong>Player ID:</strong></td>
                              <td style="color: #667eea; padding: 12px 0 8px 0; text-align: right; font-weight: bold;">TEST-${Date.now()}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Payment Summary -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e7f3ff; border-radius: 8px; padding: 20px;">
                      <tr>
                        <td>
                          <h3 style="color: #0066cc; margin-top: 0; margin-bottom: 15px;">💳 Payment Summary</h3>
                          
                          <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                              <td style="color: #666; padding: 8px 0;">Registration Fee</td>
                              <td style="color: #333; padding: 8px 0; text-align: right;">$59.00</td>
                            </tr>
                            <tr>
                              <td style="color: #666; padding: 8px 0;">Setup Fee</td>
                              <td style="color: #333; padding: 8px 0; text-align: right;">$3.00</td>
                            </tr>
                            <tr>
                              <td style="color: #666; padding: 8px 0;">Jersey Fee</td>
                              <td style="color: #333; padding: 8px 0; text-align: right;">$26.50</td>
                            </tr>
                            <tr style="border-top: 2px solid #0066cc;">
                              <td style="color: #333; padding: 12px 0 8px 0;"><strong>Total Paid:</strong></td>
                              <td style="color: #28a745; padding: 12px 0 8px 0; text-align: right; font-size: 20px; font-weight: bold;">$88.50</td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding: 8px 0;">
                                <div style="background-color: #28a745; color: white; padding: 8px; border-radius: 4px; text-align: center; margin-top: 10px;">
                                  ✓ Payment Status: <strong>COMPLETED</strong>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Season Information -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-radius: 8px; padding: 20px;">
                      <tr>
                        <td>
                          <h3 style="color: #856404; margin-top: 0; margin-bottom: 15px;">📅 Season Information</h3>
                          <p style="color: #856404; margin: 0; line-height: 1.6;">
                            <strong>Season Dates:</strong> September 28 - November 16, 2025<br>
                            <strong>Registration Deadline:</strong> November 9, 2025 at 6:00 PM<br>
                            <strong>Location:</strong> All Pro Sports Complex
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- What's Next -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <h3 style="color: #333; margin-bottom: 15px;">🎯 What's Next?</h3>
                    <ol style="color: #666; line-height: 1.8; padding-left: 20px;">
                      <li><strong>Check Your Email:</strong> Keep this confirmation for your records</li>
                      <li><strong>Save Your Player ID:</strong> You'll need this for check-in and future reference</li>
                      <li><strong>Jersey Pickup:</strong> Information about jersey distribution will be sent soon</li>
                      <li><strong>Team Assignment:</strong> You'll be notified once you're drafted to a team</li>
                      <li><strong>Schedule Updates:</strong> Game schedules will be sent via email and SMS</li>
                      <li><strong>Join Our Community:</strong> Follow us on social media for updates and highlights</li>
                    </ol>
                  </td>
                </tr>
                
                <!-- Important Reminders -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; border-radius: 4px;">
                      <h4 style="color: #721c24; margin-top: 0; margin-bottom: 10px;">⚠️ Important Reminders</h4>
                      <ul style="color: #721c24; margin: 0; padding-left: 20px; line-height: 1.6;">
                        <li>Bring your Player ID to all games</li>
                        <li>League-issued jersey is required for official games</li>
                        <li>Arrive 15 minutes early for warm-ups</li>
                        <li>Review league rules and expectations</li>
                      </ul>
                    </div>
                  </td>
                </tr>
                
                <!-- Contact Information -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; text-align: center;">
                    <h3 style="color: #333; margin-bottom: 15px;">📞 Need Help?</h3>
                    <p style="color: #666; margin: 10px 0;">
                      <strong>Email:</strong> <a href="mailto:info@allprosportsnc.com" style="color: #667eea; text-decoration: none;">info@allprosportsnc.com</a><br>
                      <strong>Phone:</strong> <a href="tel:336-662-2855" style="color: #667eea; text-decoration: none;">336-662-2855</a><br>
                      <strong>Website:</strong> <a href="https://www.allprosportsnc.com" style="color: #667eea; text-decoration: none;">www.allprosportsnc.com</a>
                    </p>
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; text-align: center;">
                    <a href="https://www.allprosportsnc.com/2025-season" style="display: inline-block; background-color: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                      View Season Details
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #2c3e50; padding: 30px 40px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.8); margin: 0 0 10px 0; font-size: 14px;">
                      Thank you for choosing All Pro Sports!
                    </p>
                    <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">
                      &copy; ${new Date().getFullYear()} All Pro Sports NC. All rights reserved.<br>
                      This is an automated message. Please do not reply to this email.
                    </p>
                    <div style="margin-top: 20px;">
                      <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; margin: 0 10px;">Facebook</a>
                      <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; margin: 0 10px;">Twitter</a>
                      <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; margin: 0 10px;">Instagram</a>
                    </div>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  console.log('🚀 Sending test registration email...\n');
  console.log('To:', testData.to);
  console.log('Subject:', testData.subject);
  console.log('\n📧 Email Content Preview:');
  console.log('- Registration confirmed for Fall 2025 season');
  console.log('- Payment summary: $88.50 total');
  console.log('- Player ID included');
  console.log('- Season dates and next steps');
  console.log('- Contact information\n');

  try {
    // Use localhost for local testing, or update to your deployed URL
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${apiUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('\n📬 Check your inbox at:', testData.to);
      console.log('(Check spam folder if you don\'t see it)\n');
    } else {
      console.log('⚠️  Email API Response:', result);
      if (result.message && result.message.includes('not configured')) {
        console.log('\n📝 NOTE: Email service is not configured.');
        console.log('To enable emails, add these environment variables:');
        console.log('  EMAIL_HOST=smtp.gmail.com');
        console.log('  EMAIL_PORT=587');
        console.log('  EMAIL_USER=your-email@gmail.com');
        console.log('  EMAIL_PASS=your-app-password');
        console.log('  EMAIL_FROM=noreply@allprosportsnc.com\n');
      }
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    console.log('\n💡 Make sure your server is running:');
    console.log('   npm run dev\n');
  }
};

// Run the test
testEmail();
