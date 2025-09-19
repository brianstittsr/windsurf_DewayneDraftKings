async function comprehensivePricingTest() {
  try {
    console.log('=== Comprehensive Pricing System Test ===\n');
    
    // Test 1: API Endpoint
    console.log('1. Testing API Endpoint (/api/pricing)...');
    const apiResponse = await fetch('http://localhost:3000/api/pricing');
    const apiData = await apiResponse.json();
    
    console.log(`   Status: ${apiResponse.status} ${apiResponse.ok ? '(OK)' : '(ERROR)'}`);
    
    if (apiData.plans && apiData.plans.length > 0) {
      console.log(`   Found ${apiData.plans.length} pricing plans`);
      
      // Verify each plan's total calculation
      const expectedTotals = {
        'Jamboree Game': 26.50,
        'Complete Season': 59.00,
        'Jamboree + Season': 88.50,
        'Assistant Coach': 45.00,
        'Head Coach': 75.00
      };
      
      let allTotalsCorrect = true;
      
      apiData.plans.forEach((plan, index) => {
        const calculatedTotal = plan.price + plan.serviceFee;
        const expectedTotal = expectedTotals[plan.title];
        const isCorrect = calculatedTotal === expectedTotal;
        
        if (!isCorrect) allTotalsCorrect = false;
        
        console.log(`   ${index + 1}. ${plan.title}: $${plan.price.toFixed(2)} + $${plan.serviceFee.toFixed(2)} = $${calculatedTotal.toFixed(2)} ${isCorrect ? '(OK)' : '(ERROR)'}`);
      });
      
      console.log(`   All totals correct: ${allTotalsCorrect ? 'YES' : 'NO'}\n`);
    } else {
      console.log('   No pricing plans found\n');
    }
    
    // Test 2: POST New Plan
    console.log('2. Testing POST New Plan...');
    const newPlan = {
      title: 'Test Plan',
      subtitle: 'Test Description',
      price: 10.00,
      serviceFee: 3.00,
      features: ['Feature 1', 'Feature 2'],
      popular: false,
      buttonText: 'Test Button',
      buttonClass: 'btn-primary',
      itemType: 'jamboree',
      category: 'player',
      isActive: true
    };
    
    const postResponse = await fetch('http://localhost:3000/api/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan)
    });
    
    console.log(`   Status: ${postResponse.status} ${postResponse.ok ? '(OK)' : '(ERROR)'}`);
    
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log(`   Created plan with ID: ${postData.id}\n`);
      
      // Clean up - delete the test plan
      if (postData.id) {
        const deleteResponse = await fetch(`http://localhost:3000/api/pricing/${postData.id}`, {
          method: 'DELETE'
        });
        console.log(`   Cleaned up test plan: ${deleteResponse.ok ? 'SUCCESS' : 'FAILED'}\n`);
      }
    } else {
      const errorData = await postResponse.json();
      console.log(`   Error: ${errorData.error}\n`);
    }
    
    console.log('=== Test Complete ===');
    
  } catch (error) {
    console.error('Error during comprehensive test:', error.message);
  }
}

comprehensivePricingTest();
