const { Twilio } = require('twilio');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

async function checkMessageStatus(client, messageSid) {
  try {
    const message = await client.messages(messageSid).fetch();
    return {
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateUpdated: message.dateUpdated
    };
  } catch (error) {
    console.error('Error checking message status:', error.message);
    return null;
  }
}

async function waitForDelivery(client, messageSid, maxWaitTime = 120000) {
  const startTime = Date.now();
  const checkInterval = 3000; // 3 seconds
  
  console.log('⏳ Monitoring message status...');
  console.log(`📊 Will check every ${checkInterval/1000} seconds for up to ${maxWaitTime/1000} seconds`);
  
  while (Date.now() - startTime < maxWaitTime) {
    const statusInfo = await checkMessageStatus(client, messageSid);
    
    if (!statusInfo) {
      console.log('❌ Failed to check status, retrying...');
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      continue;
    }
    
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`📱 [${elapsed}s] Status: ${statusInfo.status.toUpperCase()}`);
    
    // Check for final statuses
    if (statusInfo.status === 'delivered') {
      console.log('✅ Message delivered successfully!');
      console.log(`⏱️  Total delivery time: ${elapsed} seconds`);
      return statusInfo;
    } else if (statusInfo.status === 'failed' || statusInfo.status === 'undelivered') {
      console.log('❌ Message delivery failed!');
      if (statusInfo.errorCode) {
        console.log(`🚨 Error Code: ${statusInfo.errorCode}`);
        console.log(`📝 Error Message: ${statusInfo.errorMessage || 'No additional details'}`);
        
        // Provide specific guidance for common error codes
        if (statusInfo.errorCode === 30032) {
          console.log('\n💡 SOLUTION FOR ERROR 30032:');
          console.log('   This error means your Twilio phone number is a toll-free number');
          console.log('   that has not been verified for SMS messaging.');
          console.log('   ');
          console.log('   🔧 Quick Fix Options:');
          console.log('   1. Buy a regular local phone number in Twilio Console');
          console.log('   2. Submit toll-free verification (takes several days)');
          console.log('   ');
          console.log('   📞 Check your number in .env.local:');
          console.log(`   Current: ${process.env.TWILIO_PHONE_NUMBER}`);
          console.log('   Toll-free numbers start with: 800, 833, 844, 855, 866, 877, 888');
        }
      }
      return statusInfo;
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  // Timeout reached
  console.log('⏰ Timeout reached. Final status check...');
  const finalStatus = await checkMessageStatus(client, messageSid);
  if (finalStatus) {
    console.log(`📱 Final Status: ${finalStatus.status.toUpperCase()}`);
  }
  
  return finalStatus;
}

function formatPhoneNumber(input) {
  // Remove all non-digits
  const digits = input.replace(/\D/g, '');
  
  // Add +1 if not present and number is 10 digits
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  return input; // Return as-is if format is unclear
}

function validatePhoneNumber(phoneNumber) {
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Check for valid US phone number (10 or 11 digits)
  if (digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))) {
    return true;
  }
  
  return false;
}

async function getPhoneNumberInput() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('📱 SMS Test with Delivery Tracking');
    console.log('=====================================');
    rl.question('📞 Enter phone number to test (e.g., 9196083415 or +19196083415): ', (input) => {
      rl.close();
      
      if (!input.trim()) {
        console.log('❌ No phone number entered. Using default: +19196083415');
        resolve('+19196083415');
        return;
      }
      
      const formatted = formatPhoneNumber(input.trim());
      
      if (!validatePhoneNumber(formatted)) {
        console.log('⚠️  Invalid phone number format. Using default: +19196083415');
        resolve('+19196083415');
        return;
      }
      
      console.log(`✅ Using phone number: ${formatted}`);
      resolve(formatted);
    });
  });
}

async function testSMS() {
  try {
    // Validate environment variables
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Missing Twilio credentials in .env.local');
    }
    
    // Get phone number from user input
    const phoneNumber = await getPhoneNumberInput();
    
    console.log('\n📱 Starting SMS test with delivery tracking...');
    
    // Create Twilio client
    const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Send test SMS
    console.log(`📤 Sending test SMS to ${phoneNumber}...`);
    
    const message = await client.messages.create({
      body: 'Hello from All Pro Sports NC SMS Text Service!',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    console.log('✅ Test SMS sent successfully!');
    console.log('📱 Initial SMS Details:');
    console.log(`   To: ${phoneNumber}`);
    console.log('   Message: Hello from All Pro Sports NC SMS Text Service!');
    console.log('   Message ID:', message.sid);
    console.log('   Initial Status:', message.status);
    console.log('   Sent At:', message.dateCreated);
    console.log('');
    
    // Monitor delivery status
    const finalStatus = await waitForDelivery(client, message.sid);
    
    if (finalStatus) {
      console.log('');
      console.log('📊 Final Message Status:');
      console.log('   Status:', finalStatus.status.toUpperCase());
      if (finalStatus.dateUpdated) {
        console.log('   Last Updated:', finalStatus.dateUpdated);
      }
      if (finalStatus.errorCode) {
        console.log('   Error Code:', finalStatus.errorCode);
        console.log('   Error Message:', finalStatus.errorMessage);
      }
    }
    
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
