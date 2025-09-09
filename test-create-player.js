// Test script to debug Create Player functionality
const testCreatePlayer = async () => {
  const testPlayerData = {
    firstName: "Test",
    lastName: "Player",
    email: "test@example.com",
    phone: "555-123-4567",
    dateOfBirth: "1990-01-01",
    position: "flex",
    playerTag: "free-agent",
    emergencyContactName: "Emergency Contact",
    emergencyContactPhone: "555-987-6543",
    medicalConditions: "None"
  };

  try {
    console.log('Testing Create Player API...');
    console.log('Request data:', testPlayerData);

    const response = await fetch('http://localhost:3000/api/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPlayerData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      console.log('✅ Player created successfully!');
      const responseData = JSON.parse(responseText);
      console.log('Created player:', responseData);
    } else {
      console.error('❌ Failed to create player');
      console.error('Error response:', responseText);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Run the test
testCreatePlayer();
