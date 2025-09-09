// Debug SMS configuration
const { Twilio } = require('twilio');
require('dotenv').config({ path: '.env.local' });

console.log('📱 Debugging SMS configuration...');
console.log('Environment variables:');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'NOT SET');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET');
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || 'NOT SET');

async function testSMSConnection() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('❌ Twilio credentials not found in .env.local');
    console.log('💡 Please ensure your .env.local file contains:');
    console.log('   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('   TWILIO_AUTH_TOKEN=your-twilio-auth-token');
    console.log('   TWILIO_PHONE_NUMBER=+1234567890');
    return;
  }

  try {
    console.log('\n📱 Testing Twilio connection...');
    
    const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Test account access
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('✅ Twilio connection successful!');
    console.log('📊 Account Status:', account.status);

    console.log('\n📤 Sending test SMS...');
    const message = await client.messages.create({
      body: 'Hello from All Pro Sports NC SMS Text Service!',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+19196083415'
    });

    console.log('✅ SMS sent successfully!');
    console.log('📱 Message SID:', message.sid);
    console.log('📞 To: +19196083415');
    console.log('📝 Message: Hello from All Pro Sports NC SMS Text Service!');
    console.log('📊 Status:', message.status);

  } catch (error) {
    console.error('❌ SMS test failed:', error.message);
    console.log('\n💡 Common issues:');
    console.log('- Check Twilio credentials are correct');
    console.log('- Verify phone number is verified in Twilio console');
    console.log('- Ensure account has SMS credits');
    console.log('- Check if trial account restrictions apply');
  }
}

testSMSConnection();
