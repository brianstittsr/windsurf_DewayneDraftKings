const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Mock the Next.js environment for the email service
global.process = process;

async function sendTestEmailDirect() {
  try {
    console.log('🚀 Starting direct test registration email send...');
    
    // Read the HTML email template
    const emailTemplatePath = path.join(__dirname, 'test-registration-confirmation-email.html');
    const emailHtml = fs.readFileSync(emailTemplatePath, 'utf8');
    
    console.log('📧 Email template loaded successfully');
    
    // Import the email service dynamically
    const { sendRegistrationEmail } = await import('./lib/email-pdf-service.js');
    
    // Prepare mock registration data matching the schema
    const registrationData = {
      role: 'player',
      firstName: 'Marcus',
      lastName: 'Johnson',
      phone: '(555) 123-4567',
      email: 'marcus.johnson@email.com',
      dateOfBirth: new Date('1995-03-15'),
      position: 'receiver',
      playerTag: 'free-agent',
      jerseySize: 'Large',
      experience: 'Intermediate',
      emergencyContactName: 'Sarah Johnson',
      emergencyContactPhone: '(555) 987-6543',
      emergencyContactRelationship: 'Spouse',
      selectedPlan: {
        name: 'Complete Season Package',
        price: 88.50,
        serviceFee: 3.00,
        total: 91.50,
        features: [
          'Full season participation',
          'Official team jersey',
          'End of season tournament',
          'Awards ceremony access'
        ]
      },
      waiverAccepted: true,
      paymentStatus: 'paid',
      registrationId: 'APS-2025-001234',
      transactionId: 'ch_1234567890abcdef',
      submittedAt: new Date(),
      profileUrl: 'https://allprosportsnc.com/profile/marcus-johnson',
      qrCodeData: 'APS-2025-001234'
    };
    
    console.log('📋 Registration data prepared for:', registrationData.firstName, registrationData.lastName);
    console.log('📧 Email configuration check:');
    console.log('   EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');
    console.log('   EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '***configured***' : 'NOT SET');
    console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email service not configured!');
      console.error('💡 Please create .env.local file with email configuration:');
      console.error('');
      console.error('EMAIL_HOST=smtp.privateemail.com');
      console.error('EMAIL_PORT=587');
      console.error('EMAIL_SECURE=false');
      console.error('EMAIL_USER=info@allprosportsnc.com');
      console.error('EMAIL_PASS=4Football!');
      console.error('EMAIL_FROM=noreply@allprosportsnc.com');
      console.error('');
      console.error('🔧 Copy these values from .env.example to .env.local');
      process.exit(1);
    }
    
    console.log('📤 Sending test registration email to brianstittsr@gmail.com...');
    
    // Send email using the registration email service
    const result = await sendRegistrationEmail(registrationData, 'brianstittsr@gmail.com');
    
    if (result.success) {
      console.log('✅ Test registration email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📮 Email sent to: brianstittsr@gmail.com');
      console.log('📝 Registration ID:', registrationData.registrationId);
      
      console.log('\n🎉 Test email delivery complete!');
      console.log('📬 Please check brianstittsr@gmail.com for the registration confirmation email.');
      console.log('📋 The email includes:');
      console.log('   • Complete registration details');
      console.log('   • Payment confirmation');
      console.log('   • Emergency contact information');
      console.log('   • Next steps and league information');
      console.log('   • Professional All Pro Sports branding');
      
    } else {
      console.error('❌ Failed to send test registration email');
      console.error('📧 Error:', result.error);
      
      if (result.error && result.error.includes('authentication')) {
        console.error('🔐 Authentication failed - check email credentials');
      } else if (result.error && result.error.includes('connection')) {
        console.error('🌐 Connection failed - check SMTP settings');
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error sending test registration email:', error);
    
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('📦 Module not found - make sure all dependencies are installed:');
      console.error('   npm install');
    } else if (error.message && error.message.includes('import')) {
      console.error('📦 ES Module import error - the email service may need to be running in Next.js context');
      console.error('💡 Try starting the development server and using the API endpoint instead:');
      console.error('   npm run dev');
      console.error('   node send-test-email-api.js');
    }
    
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Ensure .env.local file exists with proper email configuration');
    console.error('2. Install dependencies: npm install');
    console.error('3. Start development server: npm run dev');
    console.error('4. Use API endpoint: node send-test-email-api.js');
    
    process.exit(1);
  }
}

// Run the test
sendTestEmailDirect();
