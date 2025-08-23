// Initialize SMS Journey Templates
// Run this script after setting up environment variables

async function initializeJourneys() {
  try {
    console.log('🚀 Initializing SMS journey templates...');
    
    const response = await fetch('http://localhost:3000/api/sms/journeys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'initialize_templates'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Journey templates initialized successfully!');
      console.log('Created journeys:', result.journeys);
      
      result.journeys.forEach(journey => {
        console.log(`  - ${journey.name} (ID: ${journey.id})`);
      });
      
      console.log('\n🎉 Phase 1 SMS system is ready for use!');
      console.log('📱 Registration page: http://localhost:3000/register');
      console.log('📊 Admin dashboard: http://localhost:3000/admin');
    } else {
      console.error('❌ Failed to initialize journeys:', result.error);
    }
  } catch (error) {
    console.error('❌ Error initializing journeys:', error.message);
    console.log('\n💡 Make sure the development server is running with: npm run dev');
  }
}

// Run if called directly
if (require.main === module) {
  initializeJourneys();
}

module.exports = { initializeJourneys };
