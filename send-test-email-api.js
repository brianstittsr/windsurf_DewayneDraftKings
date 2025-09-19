const fs = require('fs');
const path = require('path');

async function sendTestEmailViaAPI() {
  try {
    console.log('🚀 Starting test registration email send via API...');
    
    // Read the HTML email template
    const emailTemplatePath = path.join(__dirname, 'test-registration-confirmation-email.html');
    const emailHtml = fs.readFileSync(emailTemplatePath, 'utf8');
    
    console.log('📧 Email template loaded successfully');
    
    // Prepare mock registration data
    const registrationData = {
      role: 'player',
      firstName: 'Marcus',
      lastName: 'Johnson',
      phone: '(555) 123-4567',
      email: 'marcus.johnson@email.com',
      dateOfBirth: 'March 15, 1995',
      position: 'receiver',
      playerTag: 'free-agent',
      jerseySize: 'Large',
      experience: 'Intermediate',
      emergencyContactName: 'Sarah Johnson',
      emergencyContactPhone: '(555) 987-6543',
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
      submittedAt: new Date()
    };

    const emailData = {
      registrationData,
      email: 'brianstittsr@gmail.com'
    };
    
    // Also prepare fallback data for direct email
    const fallbackEmailData = {
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
    
    console.log('📤 Sending test registration email to brianstittsr@gmail.com via API...');
    console.log('📋 Registration data prepared for:', registrationData.firstName, registrationData.lastName);
    
    // Send email via API endpoint
    const response = await fetch('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test registration email sent successfully!');
      console.log('📧 Response:', result);
      console.log('📮 Email sent to:', emailData.email);
      console.log('📝 Registration ID:', registrationData.registrationId);
      
      console.log('\n🎉 Test email delivery complete!');
      console.log('📬 Please check brianstittsr@gmail.com for the registration confirmation email.');
    } else {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      
      if (response.status === 500) {
        console.error('🔧 Server error - likely email configuration issue');
        console.error('💡 Make sure email environment variables are set in .env.local:');
        console.error('   - EMAIL_HOST=smtp.privateemail.com');
        console.error('   - EMAIL_PORT=587');
        console.error('   - EMAIL_USER=info@allprosportsnc.com');
        console.error('   - EMAIL_PASS=4Football!');
        console.error('   - EMAIL_FROM=noreply@allprosportsnc.com');
      }
    }
    
  } catch (error) {
    console.error('❌ Error sending test registration email:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🌐 Connection refused. Make sure the Next.js development server is running:');
      console.error('   npm run dev');
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🔧 Fetch not available. Please run this with Node.js 18+ or install node-fetch');
    }
    
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Start the development server: npm run dev');
    console.error('2. Ensure .env.local file exists with proper email configuration');
    console.error('3. Check that the /api/email/send endpoint is working');
    console.error('4. Verify SMTP credentials are correct');
    
    process.exit(1);
  }
}

// Run the test
sendTestEmailViaAPI();
