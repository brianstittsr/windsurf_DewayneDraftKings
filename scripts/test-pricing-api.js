async function testPricingAPI() {
  try {
    console.log('Testing pricing API...');
    
    // Test GET request
    const response = await fetch('http://localhost:3000/api/pricing');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.plans) {
      console.log(`Found ${data.plans.length} pricing plans`);
    }
  } catch (error) {
    console.error('Error testing pricing API:', error.message);
  }
}

testPricingAPI();
