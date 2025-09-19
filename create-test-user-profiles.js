const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  // You'll need to add your Firebase service account key here
  // For now, we'll use the web SDK approach
};

// Simple test data creation using HTTP requests
const http = require('http');

const createTestProfile = (profileData) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(profileData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/user-profiles',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          resolve({ error: 'Invalid JSON', rawData: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
};

async function createTestProfiles() {
  const testProfiles = [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "555-0101",
      dateOfBirth: new Date('1990-05-15'),
      role: "player",
      jerseySize: "L",
      registrationData: {
        role: "player",
        firstName: "John",
        lastName: "Doe",
        phone: "555-0101",
        email: "john.doe@example.com",
        dateOfBirth: "1990-05-15",
        position: "quarterback",
        playerTag: "free-agent",
        jerseySize: "L",
        waiverAccepted: true,
        submittedAt: new Date()
      },
      paymentStatus: "paid",
      status: "active",
      isVerified: true
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "555-0102",
      dateOfBirth: new Date('1985-08-22'),
      role: "coach",
      jerseySize: "M",
      registrationData: {
        role: "coach",
        firstName: "Jane",
        lastName: "Smith",
        phone: "555-0102",
        email: "jane.smith@example.com",
        dateOfBirth: "1985-08-22",
        experience: "5 years",
        coachingLevel: "head",
        certifications: "Youth Sports Certification",
        specialties: "Offensive Strategy",
        jerseySize: "M",
        maxTeams: 2,
        waiverAccepted: true,
        submittedAt: new Date()
      },
      paymentStatus: "paid",
      status: "active",
      isVerified: true
    },
    {
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@example.com",
      phone: "555-0103",
      dateOfBirth: new Date('1992-12-10'),
      role: "player",
      jerseySize: "XL",
      registrationData: {
        role: "player",
        firstName: "Mike",
        lastName: "Johnson",
        phone: "555-0103",
        email: "mike.johnson@example.com",
        dateOfBirth: "1992-12-10",
        position: "receiver",
        playerTag: "draft-pick",
        jerseySize: "XL",
        waiverAccepted: true,
        submittedAt: new Date()
      },
      paymentStatus: "pending",
      status: "active",
      isVerified: false
    }
  ];

  console.log('Creating test user profiles...');
  
  for (let i = 0; i < testProfiles.length; i++) {
    try {
      const result = await createTestProfile(testProfiles[i]);
      console.log(`Profile ${i + 1} created:`, result);
    } catch (error) {
      console.error(`Error creating profile ${i + 1}:`, error.message);
    }
  }
  
  console.log('Test profile creation completed!');
}

createTestProfiles();
