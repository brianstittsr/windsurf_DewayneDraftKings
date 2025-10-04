const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmailConnection() {
  console.log('🔧 Testing Email Configuration');
  console.log('==============================');

  // Check environment variables
  const requiredVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
  let allSet = true;

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName}: NOT SET`);
      allSet = false;
    } else {
      console.log(`✅ ${varName}: [CONFIGURED]`);
    }
  });

  console.log(`📧 EMAIL_FROM: ${process.env.EMAIL_FROM || 'DEFAULT'}`);
  console.log(`🔌 EMAIL_PORT: ${process.env.EMAIL_PORT || '587'}`);
  console.log(`🔒 EMAIL_SECURE: ${process.env.EMAIL_SECURE || 'false'}`);

  if (!allSet) {
    console.log('\n❌ Email configuration incomplete!');
    console.log('Please check your .env.local file.');
    process.exit(1);
  }

  // Test connection
  console.log('\n🔄 Testing SMTP connection...');

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true,
      logger: true
    });

    // Test connection
    const result = await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    console.log('\n📤 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to ourselves
      subject: 'All Pro Sports NC - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>✅ Email Test Successful!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Your email configuration is working correctly.</p>
            <p><strong>Test sent at:</strong> ${new Date().toLocaleString()}</p>
            <p>This confirms that registration emails should work properly.</p>
          </div>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Sent to: ${process.env.EMAIL_USER}`);

  } catch (error) {
    console.log('❌ Email test failed!');
    console.log(`Error: ${error.message}`);

    if (error.code === 'EAUTH') {
      console.log('This is likely an authentication issue. Please check:');
      console.log('1. Email credentials are correct');
      console.log('2. App passwords are enabled (for Gmail)');
      console.log('3. SMTP access is enabled for your email provider');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('This is likely a connection issue. Please check:');
      console.log('1. SMTP server host and port are correct');
      console.log('2. Firewall/antivirus is not blocking connections');
      console.log('3. Network allows SMTP connections');
    }
  }
}

testEmailConnection();
