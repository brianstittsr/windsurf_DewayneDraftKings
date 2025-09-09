const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('🚀 Starting email test...');
  
  try {
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
    
    // First verify the email service connection
    console.log('📧 Verifying email service connection...');
    const isConnected = await transporter.verify();
    
    if (!isConnected) {
      console.error('❌ Email service connection failed. Please check your SMTP configuration.');
      return;
    }
    
    console.log('✅ Email service connection verified!');
    
    // Send test email
    console.log('📤 Sending test email to bstitt@mjoandco.com, brianstittsr@gmail.com...');
    
    const mailOptions = {
      from: process.env.EMAIL_SERVER_USER || '"All Pro Sports NC" <info@allprosportsnc.com>',
      to: 'mjoandcohelp@mjoandco.com, dewayne.thomas2011@gmail.com, bullockanitra@gmail.com, bstitt@mjoandco.com',
      subject: 'Test from All Pro Sports Website Email Sending System',
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
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Email Details:');
    console.log('   To: bstitt@mjandco.com');
    console.log('   Subject: Test from All Pro Sports');
    console.log('   Body: Email is now sending from All Pro Sports NC website!');
    console.log('   Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('💡 Authentication failed. Please check your EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD in .env.local');
    } else if (error.code === 'ECONNECTION') {
      console.log('💡 Connection failed. Please check your EMAIL_SERVER_HOST and EMAIL_SERVER_PORT in .env.local');
    } else {
      console.log('💡 Please check your email configuration in .env.local file');
    }
  }
}

// Run the test
testEmail();
