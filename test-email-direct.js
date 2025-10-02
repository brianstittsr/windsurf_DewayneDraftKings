/**
 * Direct Email Test (No Server Required)
 * Tests email sending directly using nodemailer
 */

require('dotenv').config({ path: '.env.local' });

async function testEmailDirect() {
  console.log('📧 Testing Email Service Directly...\n');

  // Check configuration
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email not configured!');
    console.log('\nMissing variables:');
    if (!process.env.EMAIL_HOST) console.log('  - EMAIL_HOST');
    if (!process.env.EMAIL_PORT) console.log('  - EMAIL_PORT');
    if (!process.env.EMAIL_USER) console.log('  - EMAIL_USER');
    if (!process.env.EMAIL_PASS) console.log('  - EMAIL_PASS');
    if (!process.env.EMAIL_FROM) console.log('  - EMAIL_FROM');
    return;
  }

  console.log('✅ Email configuration found');
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   From: ${process.env.EMAIL_FROM}\n`);

  try {
    const nodemailer = require('nodemailer');

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

    console.log('🔌 Testing connection to email server...');
    await transporter.verify();
    console.log('✅ Connection successful!\n');

    console.log('📨 Sending test email to brianstittsr@gmail.com...');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: 'brianstittsr@gmail.com',
      subject: '🏈 Test Email - All Pro Sports Registration System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Email System Working!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Email Service Test Successful</h2>
            <p style="color: #666; line-height: 1.6;">
              This is a test email from your All Pro Sports registration system. 
              If you're seeing this, your email configuration is working correctly!
            </p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0066cc; margin-top: 0;">✅ What's Working:</h3>
              <ul style="color: #333;">
                <li>Email server connection</li>
                <li>SMTP authentication</li>
                <li>Email delivery</li>
                <li>HTML email formatting</li>
              </ul>
            </div>
            
            <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
              <p style="margin: 0; color: #155724;">
                <strong>✓ Test Date:</strong> ${new Date().toLocaleString()}<br>
                <strong>✓ Sent From:</strong> ${process.env.EMAIL_FROM || process.env.EMAIL_USER}<br>
                <strong>✓ Email Server:</strong> ${process.env.EMAIL_HOST}
              </p>
            </div>
            
            <p style="color: #666; margin-top: 20px;">
              Your payment confirmation emails will now be sent automatically when customers complete registration!
            </p>
          </div>
          
          <div style="background: #2c3e50; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; margin-top: -1px;">
            <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">
              All Pro Sports Registration System<br>
              Email Service Test - ${new Date().getFullYear()}
            </p>
          </div>
        </div>
      `
    });

    console.log('✅ SUCCESS! Email sent!\n');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Check inbox: brianstittsr@gmail.com');
    console.log('\n✨ Email system is working correctly!');
    console.log('   Payment confirmation emails will now be sent automatically.\n');

  } catch (error) {
    console.log('❌ Email sending failed!\n');
    console.log('Error:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 This usually means:');
      console.log('   1. Wrong EMAIL_USER or EMAIL_PASS');
      console.log('   2. Need to use App Password (not regular password)');
      console.log('   3. Generate new app password at:');
      console.log('      https://myaccount.google.com/apppasswords\n');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Cannot connect to email server');
      console.log('   Check EMAIL_HOST and EMAIL_PORT are correct\n');
    } else {
      console.log('\n💡 Check your email configuration in .env.local\n');
    }
  }
}

testEmailDirect();
