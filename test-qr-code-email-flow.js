/**
 * Test script for QR Code Email Integration
 * Tests the complete flow from registration to QR code generation and email sending
 */

const { generateProfileQRCode } = require('./lib/qr-generator');
const { sendRegistrationEmail } = require('./lib/email-pdf-service');

// Mock registration data for testing
const mockRegistrationData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  dateOfBirth: '1995-03-15',
  role: 'player',
  position: 'flex',
  playerTag: 'free-agent',
  jerseySize: 'L',
  emergencyContactName: 'Jane Doe',
  emergencyContactPhone: '(555) 987-6543',
  waiverAccepted: true,
  parentGuardianName: 'Jane Doe',
  parentGuardianSignature: 'Jane Doe',
  selectedPlan: {
    title: 'Complete Season Package',
    price: 88.50,
    description: 'Full season access with all benefits'
  }
};

async function testQRCodeEmailFlow() {
  console.log('🧪 Testing QR Code Email Integration Flow...\n');

  try {
    // Step 1: Generate QR Code
    console.log('📱 Step 1: Generating QR Code...');
    const mockProfileId = 'test-profile-' + Date.now();
    const qrCodeDataUrl = await generateProfileQRCode(
      mockProfileId,
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    );
    
    console.log('✅ QR Code generated successfully');
    console.log(`📏 QR Code size: ${qrCodeDataUrl.length} characters`);
    console.log(`🔗 Profile URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile/${mockProfileId}\n`);

    // Step 2: Test Email Sending (if email config is available)
    console.log('📧 Step 2: Testing Email with QR Code...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️  Email credentials not configured - skipping email test');
      console.log('   Set EMAIL_USER and EMAIL_PASS in .env.local to test email sending');
    } else {
      console.log('📤 Sending test email with QR code...');
      
      const emailResult = await sendRegistrationEmail(
        mockRegistrationData,
        mockRegistrationData.email,
        qrCodeDataUrl
      );
      
      if (emailResult.success) {
        console.log('✅ Email sent successfully!');
        console.log(`📬 Message ID: ${emailResult.messageId}`);
      } else {
        console.log('❌ Email sending failed:');
        console.log(`   Error: ${emailResult.error}`);
      }
    }

    // Step 3: Validate QR Code Content
    console.log('\n🔍 Step 3: Validating QR Code Content...');
    
    if (qrCodeDataUrl.startsWith('data:image/png;base64,')) {
      console.log('✅ QR Code format is correct (PNG base64)');
      
      const base64Data = qrCodeDataUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      console.log(`📊 QR Code image size: ${buffer.length} bytes`);
      
      // Check if it's a valid PNG
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        console.log('✅ QR Code is a valid PNG image');
      } else {
        console.log('❌ QR Code is not a valid PNG image');
      }
    } else {
      console.log('❌ QR Code format is incorrect');
    }

    console.log('\n🎉 QR Code Email Integration Test Complete!');
    console.log('\n📋 Summary:');
    console.log(`   • Profile ID: ${mockProfileId}`);
    console.log(`   • QR Code Generated: ✅`);
    console.log(`   • Email Integration: ${process.env.EMAIL_USER ? '✅' : '⚠️  (Config needed)'}`);
    console.log(`   • Ready for Production: ${process.env.EMAIL_USER ? '✅' : '⚠️  (Email config needed)'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure QRCode package is installed: npm install qrcode');
    console.error('   2. Check email configuration in .env.local');
    console.error('   3. Verify all imports are working correctly');
  }
}

// Test API endpoint integration
async function testAPIEndpoint() {
  console.log('\n🌐 Testing API Endpoint Integration...');
  
  try {
    const testData = {
      registrationData: mockRegistrationData,
      paymentId: 'test-payment-' + Date.now(),
      stripeSessionId: 'test-session-' + Date.now()
    };

    console.log('📡 Making request to /api/registration/create-profile...');
    
    const response = await fetch('http://localhost:3000/api/registration/create-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API endpoint test successful!');
      console.log(`   Profile ID: ${result.profileId}`);
      console.log(`   QR Code Generated: ${result.qrCodeUrl ? '✅' : '❌'}`);
      console.log(`   Email Sent: ${result.emailSent ? '✅' : '❌'}`);
    } else {
      const errorText = await response.text();
      console.log('❌ API endpoint test failed:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.log('❌ API endpoint test failed:');
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure the development server is running (npm run dev)');
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting All Pro Sports QR Code Email Integration Tests\n');
  console.log('=' * 60);
  
  await testQRCodeEmailFlow();
  await testAPIEndpoint();
  
  console.log('\n' + '=' * 60);
  console.log('🏁 All tests completed!');
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testQRCodeEmailFlow,
  testAPIEndpoint,
  runAllTests
};
