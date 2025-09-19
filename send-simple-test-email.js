const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

async function sendSimpleTestEmail() {
  try {
    console.log('🚀 Starting simple test email send...');
    
    // Read the HTML email template
    const emailTemplatePath = path.join(__dirname, 'test-registration-confirmation-email.html');
    const emailHtml = fs.readFileSync(emailTemplatePath, 'utf8');
    
    console.log('📧 Email template loaded successfully');
    
    // Use email credentials directly from .env.example
    const emailConfig = {
      host: 'smtp.privateemail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'info@allprosportsnc.com',
        pass: '4Football!'
      }
    };
    
    console.log('🔧 Creating email transporter...');
    console.log('📡 SMTP Host:', emailConfig.host);
    console.log('📡 SMTP Port:', emailConfig.port);
    console.log('👤 SMTP User:', emailConfig.auth.user);
    
    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig);
    
    // Verify connection
    console.log('🔍 Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection verified successfully!');
    
    // Email options
    const mailOptions = {
      from: '"All Pro Sports" <info@allprosportsnc.com>',
      to: 'dewayne.thomas2011@gmail.com',
      subject: '🏈 All Pro Sports - Registration Confirmation (Test Email)',
      html: emailHtml,
      text: `All Pro Sports - Registration Confirmation

Welcome to All Pro Sports, Marcus!

Thank you for registering for our Flag Football League. Your registration has been successfully processed and payment confirmed.

Personal Information:
- Name: Marcus Johnson
- Email: marcus.johnson@email.com
- Phone: (555) 123-4567
- Role: Player
- Position: Receiver
- Jersey Size: Large

Registration Plan: Complete Season Package
Amount: $88.50 + $3.00 service fee = $91.50
Payment Status: PAID

Emergency Contact: Sarah Johnson - (555) 987-6543

Next Steps:
- Team Draft: You'll be notified within 48 hours
- First Practice: Check email for schedule
- Jersey Pickup: At first practice or facility
- Season Schedule: Will be emailed once teams are finalized

League Information:
- Start Date: January 29, 2025
- Duration: 8 weeks + playoffs
- Location: All Pro Sports Complex, 123 Sports Drive, Charlotte, NC 28202
- Game Times: Saturdays 9:00 AM - 5:00 PM

Contact: info@allprosportsnc.com | (704) 555-PROS

Registration ID: APS-2025-001234
Transaction ID: ch_1234567890abcdef

See you on the field!
The All Pro Sports Team`
    };
    
    console.log('📤 Sending test registration email to brianstittsr@gmail.com...');
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Test registration email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📮 Email sent to:', mailOptions.to);
    console.log('📝 Subject:', mailOptions.subject);
    console.log('🎯 From:', mailOptions.from);
    
    if (info.response) {
      console.log('📡 Server Response:', info.response);
    }
    
    console.log('\n🎉 Test email delivery complete!');
    console.log('📬 Please check brianstittsr@gmail.com for the registration confirmation email.');
    console.log('📋 The email includes:');
    console.log('   • Complete registration details for Marcus Johnson');
    console.log('   • Payment confirmation ($91.50 - PAID)');
    console.log('   • Emergency contact information');
    console.log('   • Next steps and league information');
    console.log('   • Professional All Pro Sports branding');
    console.log('   • QR code placeholder for profile access');
    
  } catch (error) {
    console.error('❌ Error sending test registration email:', error);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Email credentials may be incorrect or expired.');
      console.error('💡 The credentials used are from .env.example - they may need to be updated.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Check internet connection and SMTP settings.');
    } else if (error.code === 'EENVELOPE') {
      console.error('📧 Invalid email address format.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Connection timeout. SMTP server may be unreachable.');
    }
    
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Verify internet connection');
    console.error('2. Check if SMTP credentials are still valid');
    console.error('3. Ensure SMTP server allows connections from your IP');
    console.error('4. Try using a different SMTP provider if needed');
    
    process.exit(1);
  }
}

// Run the test
sendSimpleTestEmail();
