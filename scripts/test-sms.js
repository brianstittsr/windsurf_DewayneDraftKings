const { TwilioSMSService } = require('../lib/twilio-service');
require('dotenv').config({ path: '.env.local' });

async function testSMS() {
  console.log('📱 Starting SMS test...');
  
  try {
    // Create SMS service instance
    const smsService = new TwilioSMSService();
    
    // Send test SMS
    console.log('📤 Sending test SMS to +19196083415...');
    
    const smsMessage = await smsService.sendSMS(
      '+19196083415',
      'Hello from All Pro Sports NC SMS Text Service!'
    );
    
    console.log('✅ Test SMS sent successfully!');
    console.log('📱 SMS Details:');
    console.log('   To: +19196083415');
    console.log('   Message: Hello from All Pro Sports NC SMS Text Service!');
    console.log('   Message ID:', smsMessage.id);
    console.log('   Status:', smsMessage.status);
    console.log('   Sent At:', smsMessage.sentAt);
    
  } catch (error) {
    console.error('❌ SMS test failed:', error.message);
    
    if (error.code === 20003) {
      console.log('💡 Authentication failed. Please check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local');
    } else if (error.code === 21211) {
      console.log('💡 Invalid phone number format. Ensure number includes country code (+1)');
    } else if (error.code === 21608) {
      console.log('💡 Phone number not verified. Add +19196083415 to your Twilio verified numbers');
    } else {
      console.log('💡 Please check your Twilio configuration in .env.local file');
    }
  }
}

// Run the test
testSMS();
