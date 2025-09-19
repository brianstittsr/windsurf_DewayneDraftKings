async function verifyPricingData() {
  try {
    console.log('Verifying pricing data...');
    
    // Test GET request
    const response = await fetch('http://localhost:3000/api/pricing');
    const data = await response.json();
    
    console.log('Status:', response.status);
    
    if (data.plans && data.plans.length > 0) {
      console.log(`Found ${data.plans.length} pricing plans:`);
      
      data.plans.forEach((plan, index) => {
        const total = plan.price + plan.serviceFee;
        console.log(`${index + 1}. ${plan.title}`);
        console.log(`   Price: $${plan.price.toFixed(2)}`);
        console.log(`   Service Fee: $${plan.serviceFee.toFixed(2)}`);
        console.log(`   Total: $${total.toFixed(2)}`);
        console.log(`   Category: ${plan.category}`);
        console.log(`   Active: ${plan.isActive ? 'Yes' : 'No'}`);
        console.log('');
      });
      
      // Verify specific plans
      const jamboreeSeason = data.plans.find(p => p.title === 'Jamboree + Season');
      if (jamboreeSeason) {
        const total = jamboreeSeason.price + jamboreeSeason.serviceFee;
        console.log(`Jamboree + Season total: $${total.toFixed(2)} (Expected: $88.50)`);
        console.log(`Correct total: ${total === 88.50 ? 'YES' : 'NO'}`);
      }
    } else {
      console.log('No pricing plans found');
    }
  } catch (error) {
    console.error('Error verifying pricing data:', error.message);
  }
}

verifyPricingData();
