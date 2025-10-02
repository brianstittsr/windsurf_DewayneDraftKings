/**
 * Email Configuration Checker
 * Checks if email environment variables are set
 */

console.log('🔍 Checking Email Configuration...\n');

const requiredVars = {
  'EMAIL_HOST': process.env.EMAIL_HOST,
  'EMAIL_PORT': process.env.EMAIL_PORT,
  'EMAIL_USER': process.env.EMAIL_USER,
  'EMAIL_PASS': process.env.EMAIL_PASS,
  'EMAIL_FROM': process.env.EMAIL_FROM,
};

let allConfigured = true;

console.log('Environment Variables Status:');
console.log('─────────────────────────────────────');

for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`✅ ${key}: ${key === 'EMAIL_PASS' ? '***hidden***' : value}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
    allConfigured = false;
  }
}

console.log('─────────────────────────────────────\n');

if (!allConfigured) {
  console.log('⚠️  EMAIL SERVICE NOT CONFIGURED\n');
  console.log('To enable emails, you need to set these environment variables:');
  console.log('\nFor Local Development (.env.local):');
  console.log('─────────────────────────────────────');
  console.log('EMAIL_HOST=smtp.gmail.com');
  console.log('EMAIL_PORT=587');
  console.log('EMAIL_USER=your-email@gmail.com');
  console.log('EMAIL_PASS=your-app-specific-password');
  console.log('EMAIL_FROM=noreply@allprosportsnc.com\n');
  
  console.log('For Gmail App Password:');
  console.log('1. Go to https://myaccount.google.com/security');
  console.log('2. Enable 2-Step Verification');
  console.log('3. Go to App Passwords');
  console.log('4. Create password for "Mail"');
  console.log('5. Use that password for EMAIL_PASS\n');
  
  console.log('For Vercel Production:');
  console.log('1. Go to Vercel Dashboard > Your Project');
  console.log('2. Settings > Environment Variables');
  console.log('3. Add each variable above');
  console.log('4. Redeploy your application\n');
} else {
  console.log('✅ All email configuration variables are set!');
  console.log('\nTesting email connection...\n');
  
  // Test email connection
  (async () => {
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
      console.log('🔌 Attempting to connect to email server...');
      await transporter.verify();
      console.log('✅ Email server connection successful!\n');
      console.log('📧 Ready to send emails!');
      console.log('\nRun: node test-registration-email.js');
      
    } catch (error) {
      console.log('❌ Email server connection failed!');
      console.log('Error:', error.message);
      console.log('\nPossible issues:');
      console.log('- Incorrect EMAIL_HOST or EMAIL_PORT');
      console.log('- Wrong EMAIL_USER or EMAIL_PASS');
      console.log('- Gmail: Need to use App Password, not regular password');
      console.log('- Firewall blocking SMTP connection');
      console.log('- 2-Factor Authentication not enabled (required for Gmail)');
    }
  })();
}
