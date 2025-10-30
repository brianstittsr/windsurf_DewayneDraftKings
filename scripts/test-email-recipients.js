// Test script for email recipients functionality
const fetch = require('node-fetch');

async function testEmailRecipients() {
  console.log('Testing email recipients functionality...');
  
  // Base URL - change this to your actual server URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  try {
    // 1. Test getting recipients
    console.log('\n1. Testing GET /api/email/recipients');
    const getResponse = await fetch(`${baseUrl}/api/email/recipients`);
    const getData = await getResponse.json();
    
    console.log('Status:', getResponse.status);
    console.log('Response:', JSON.stringify(getData, null, 2));
    
    // 2. Test adding a recipient
    console.log('\n2. Testing POST /api/email/recipients');
    const addResponse = await fetch(`${baseUrl}/api/email/recipients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
      }),
    });
    
    const addData = await addResponse.json();
    console.log('Status:', addResponse.status);
    console.log('Response:', JSON.stringify(addData, null, 2));
    
    // 3. Test getting recipients again to verify addition
    console.log('\n3. Testing GET /api/email/recipients after addition');
    const getAfterAddResponse = await fetch(`${baseUrl}/api/email/recipients`);
    const getAfterAddData = await getAfterAddResponse.json();
    
    console.log('Status:', getAfterAddResponse.status);
    console.log('Response:', JSON.stringify(getAfterAddData, null, 2));
    
    // 4. Test sending a test email with CC recipients
    console.log('\n4. Testing POST /api/email/send with isRegistrationEmail=true');
    const sendResponse = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'primary@example.com',
        subject: 'Test Registration Email with CC Recipients',
        html: '<h1>Test Registration Email</h1><p>This is a test email to verify CC recipients functionality.</p>',
        isRegistrationEmail: true,
      }),
    });
    
    const sendData = await sendResponse.json();
    console.log('Status:', sendResponse.status);
    console.log('Response:', JSON.stringify(sendData, null, 2));
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

testEmailRecipients();
