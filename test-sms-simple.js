// Simple SMS test script for All Pro Sports
// Run with: node test-sms-simple.js

const { Twilio } = require('twilio');
require('dotenv').config({ path: '.env.local' });

async function sendTestSMS() {
  console.log('📱 Testing SMS functionality...');
  
  // Check if Twilio credentials are configured
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (!accountSid || !authToken || !fromNumber) {
    console.log('❌ Twilio credentials not found in .env.local');
    console.log('💡 Please ensure your .env.local file contains:');
    console.log('   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('   TWILIO_AUTH_TOKEN=your-twilio-auth-token');
    console.log('   TWILIO_PHONE_NUMBER=+1234567890');
    return;
  }

  // Create Twilio client
  const client = new Twilio(accountSid, authToken);

  try {
    console.log('📤 Sending test SMS to +19196083415...');
    
    const message = await client.messages.create({
      body: 'Hello from All Pro Sports NC SMS Text Service!',
      from: fromNumber,
      to: '+19196083415'
    });

    console.log('✅ SMS sent successfully!');
    console.log('📱 Message SID:', message.sid);
    console.log('📞 To: +19196083415');
    console.log('📝 Message: Hello from All Pro Sports NC SMS Text Service!');
    console.log('📊 Status:', message.status);
    
  } catch (error) {
    console.error('❌ Failed to send SMS:', error.message);
    
    if (error.code === 20003) {
      console.log('💡 Authentication failed. Check your Twilio credentials.');
    } else if (error.code === 21211) {
      console.log('💡 Invalid phone number format. Ensure number includes country code.');
    } else if (error.code === 21608) {
      console.log('💡 The phone number is not verified. Add it to your Twilio verified numbers.');
    } else {
      console.log('💡 Check your Twilio configuration and account status.');
    }
  }
}

// Run the test
sendTestSMS();
