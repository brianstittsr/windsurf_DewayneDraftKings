// Simple email test script for All Pro Sports
// Run with: node test-email-simple.js

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function sendTestEmail() {
  console.log('🚀 Testing email functionality...');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.privateemail.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  // Verify connection
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log('\n💡 Please check your .env.local file and ensure:');
    console.log('   - SMTP_USER is set to your email address');
    console.log('   - SMTP_PASS is set to your app password (not regular password)');
    console.log('   - For Gmail, enable 2FA and generate an app password');
    return;
  }

  // Send test email
  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER || '"All Pro Sports NC" <info@allprosportsnc.com>',
    to: 'bstitt@mjandco.com',
    subject: 'Test from All Pro Sports',
    text: 'Email is now sending from All Pro Sports NC website!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">Test from All Pro Sports</h2>
        <p>Email is now sending from All Pro Sports NC website!</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          This is a test email from the All Pro Sports NC registration system.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 Sent to: bstitt@mjandco.com');
    console.log('📝 Subject: Test from All Pro Sports');
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   - EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD are correct');
      console.log('   - For private email, verify your credentials with your provider');
    }
  }
}

// Run the test
sendTestEmail();
