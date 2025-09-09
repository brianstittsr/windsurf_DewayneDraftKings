// Debug email configuration
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Debugging email configuration...');
console.log('Environment variables:');
console.log('EMAIL_SERVER_HOST:', process.env.EMAIL_SERVER_HOST);
console.log('EMAIL_SERVER_PORT:', process.env.EMAIL_SERVER_PORT);
console.log('EMAIL_SERVER_USER:', process.env.EMAIL_SERVER_USER);
console.log('EMAIL_SERVER_PASSWORD:', process.env.EMAIL_SERVER_PASSWORD ? '***HIDDEN***' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

async function testEmailConnection() {
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.log('❌ Email credentials not found in .env.local');
    console.log('💡 Please ensure your .env.local file contains:');
    console.log('   EMAIL_SERVER_HOST=smtp.privateemail.com');
    console.log('   EMAIL_SERVER_PORT=587');
    console.log('   EMAIL_SERVER_USER=info@allprosportsnc.com');
    console.log('   EMAIL_SERVER_PASSWORD=4Football!');
    console.log('   EMAIL_FROM=noreply@allprosportsnc.com');
    return;
  }

  try {
    console.log('\n📧 Testing SMTP connection...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    console.log('\n📤 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'bstitt@mjandco.com',
      subject: 'Test from All Pro Sports',
      text: 'Email is now sending from All Pro Sports NC website!',
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 To: bstitt@mjandco.com');
    console.log('📝 Subject: Test from All Pro Sports');
    console.log('💬 Body: Email is now sending from All Pro Sports NC website!');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n💡 Common issues:');
    console.log('- Check email credentials are correct');
    console.log('- Verify SMTP server settings');
    console.log('- Ensure firewall allows SMTP connections');
  }
}

testEmailConnection();
