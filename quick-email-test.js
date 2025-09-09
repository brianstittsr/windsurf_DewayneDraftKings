const nodemailer = require('nodemailer');

// Direct configuration using your email settings
const transporter = nodemailer.createTransport({
  host: 'smtp.privateemail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'info@allprosportsnc.com',
    pass: '4Football!',
  },
});

async function sendTestEmail() {
  try {
    console.log('🚀 Sending test email...');
    
    const info = await transporter.sendMail({
      from: '"All Pro Sports NC" <info@allprosportsnc.com>',
      to: 'bstitt@mjandco.com',
      subject: 'Test from All Pro Sports',
      text: 'Email is now sending from All Pro Sports NC website!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">Test from All Pro Sports</h2>
          <p><strong>Email is now sending from All Pro Sports NC website!</strong></p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            This test email confirms that the All Pro Sports NC email system is working properly.
          </p>
        </div>
      `
    });

    console.log('✅ SUCCESS! Email sent to bstitt@mjandco.com');
    console.log('📧 Subject: Test from All Pro Sports');
    console.log('💬 Body: Email is now sending from All Pro Sports NC website!');
    console.log('🆔 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('💡 Authentication issue - check email credentials');
    } else if (error.code === 'ECONNECTION') {
      console.log('💡 Connection issue - check SMTP server settings');
    }
  }
}

sendTestEmail();
