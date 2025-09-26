// Test script to check user profiles API
const testUserProfilesAPI = async () => {
  try {
    console.log('Testing User Profiles API...');
    
    const response = await fetch('http://localhost:3002/api/user-profiles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`✅ API working! Found ${data.profiles?.length || 0} profiles`);
      
      if (data.profiles && data.profiles.length > 0) {
        console.log('Sample profile:', data.profiles[0]);
      } else {
        console.log('ℹ️  No profiles found - this is normal if no registrations have been submitted yet');
      }
    } else {
      console.log('❌ API returned error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

// Run the test
testUserProfilesAPI();
