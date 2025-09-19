const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function sendTestRegistrationEmail() {
  try {
    console.log('🚀 Starting test registration email send...');
    
    // Read the HTML email template
    const emailTemplatePath = path.join(__dirname, 'test-registration-confirmation-email.html');
    const emailHtml = fs.readFileSync(emailTemplatePath, 'utf8');
    
    console.log('📧 Email template loaded successfully');
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.privateemail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    console.log('🔧 Email transporter configured');
    console.log('📡 SMTP Host:', process.env.EMAIL_HOST || 'smtp.privateemail.com');
    console.log('📡 SMTP Port:', process.env.EMAIL_PORT || '587');
    console.log('👤 SMTP User:', process.env.EMAIL_USER ? '***configured***' : 'NOT SET');
    
    // Verify connection
    console.log('🔍 Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection verified successfully!');
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"All Pro Sports" <noreply@allprosportsnc.com>',
      to: 'brianstittsr@gmail.com',
      subject: '🏈 All Pro Sports - Registration Confirmation (Test Email)',
      html: emailHtml,
      text: `
All Pro Sports - Registration Confirmation

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
The All Pro Sports Team
      `.trim()
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
    
  } catch (error) {
    console.error('❌ Error sending test registration email:', error);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check your email credentials in .env.local');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Please check your SMTP settings and internet connection');
    } else if (error.code === 'EENVELOPE') {
      console.error('📧 Invalid email address format');
    }
    
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Ensure .env.local file exists with proper email configuration');
    console.error('2. Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS variables');
    console.error('3. Verify SMTP credentials are correct');
    console.error('4. Check if email provider allows SMTP access');
    
    process.exit(1);
  }
}

// Run the test
sendTestRegistrationEmail();
