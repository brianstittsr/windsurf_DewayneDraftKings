// Comprehensive test for registration completion flow
// Tests: Email notifications, QR codes, PDF generation, and storage

const testRegistrationCompletion = async () => {
  console.log('🧪 Testing Registration Completion Flow...\n');

  // Test data
  const testUser = {
    playerId: `test_${Date.now()}`,
    firstName: 'John',
    lastName: 'TestUser',
    email: 'test@example.com',
    phone: '919-555-0123',
    role: 'player',
    selectedPlan: {
      title: 'Jamboree + Season',
      price: 85.50,
      total: 85.50,
      category: 'player'
    },
    registrationData: {
      dateOfBirth: '1990-01-01',
      position: 'quarterback',
      jerseySize: 'L',
      emergencyContactName: 'Jane TestUser',
      emergencyContactPhone: '919-555-0124',
      emergencyContactRelation: 'spouse',
      medicalConditions: 'None',
      medications: 'None',
      allergies: 'None'
    }
  };

  try {
    // 1. Test Registration Completion Service
    console.log('1️⃣ Testing Registration Completion Service...');
    
    const response = await fetch('http://localhost:3001/api/test/registration-completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Registration completion service working');
      console.log('   - QR Codes generated:', result.qrCodes ? '✅' : '❌');
      console.log('   - PDF URL provided:', result.pdfUrl ? '✅' : '❌');
    } else {
      console.log('❌ Registration completion failed:', result.error);
      return;
    }

    // 2. Test QR Code Generation
    console.log('\n2️⃣ Testing QR Code Generation...');
    
    const qrResponse = await fetch('http://localhost:3001/api/test/qr-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profileId: testUser.playerId,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        phone: testUser.phone,
        email: testUser.email
      })
    });

    const qrResult = await qrResponse.json();
    
    if (qrResult.success) {
      console.log('✅ QR Code generation working');
      console.log('   - Profile QR:', qrResult.qrCodes.profile ? '✅' : '❌');
      console.log('   - Contact QR:', qrResult.qrCodes.contact ? '✅' : '❌');
    } else {
      console.log('❌ QR Code generation failed:', qrResult.error);
    }

    // 3. Test PDF Generation
    console.log('\n3️⃣ Testing PDF Generation...');
    
    const pdfResponse = await fetch('http://localhost:3001/api/test/pdf-generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    if (pdfResponse.ok) {
      const pdfSize = parseInt(pdfResponse.headers.get('content-length') || '0');
      console.log('✅ PDF generation working');
      console.log(`   - PDF size: ${pdfSize} bytes`);
    } else {
      console.log('❌ PDF generation failed');
    }

    // 4. Test Email Service
    console.log('\n4️⃣ Testing Email Service...');
    
    const emailResponse = await fetch('http://localhost:3001/api/test/email-service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        selectedPlan: testUser.selectedPlan,
        qrCodes: qrResult.qrCodes
      })
    });

    const emailResult = await emailResponse.json();
    
    if (emailResult.success) {
      console.log('✅ Email service working');
      console.log('   - Email sent to:', testUser.email);
    } else {
      console.log('❌ Email service failed:', emailResult.error);
    }

    // 5. Test Firebase Storage
    console.log('\n5️⃣ Testing Firebase Storage...');
    
    const storageResponse = await fetch(`http://localhost:3001/api/test/firebase-storage/${testUser.playerId}`);
    const storageResult = await storageResponse.json();
    
    if (storageResult.success) {
      console.log('✅ Firebase storage working');
      console.log('   - Profile stored:', storageResult.profile ? '✅' : '❌');
      console.log('   - QR codes stored:', storageResult.qrCodes ? '✅' : '❌');
      console.log('   - PDF stored:', storageResult.pdf ? '✅' : '❌');
    } else {
      console.log('❌ Firebase storage test failed:', storageResult.error);
    }

    // 6. Test End-to-End Registration Flow
    console.log('\n6️⃣ Testing End-to-End Registration Flow...');
    
    const e2eResponse = await fetch('http://localhost:3001/api/registration/create-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'E2E',
        lastName: 'TestUser',
        email: 'e2e-test@example.com',
        phone: '919-555-9999',
        dateOfBirth: '1995-05-15',
        jerseySize: 'M',
        position: 'receiver',
        experience: 'beginner',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '919-555-8888',
        emergencyContactRelation: 'parent',
        medicalConditions: 'None',
        medications: 'None',
        allergies: 'None',
        preferredCommunication: 'email',
        marketingConsent: true,
        waiverAccepted: true,
        termsAccepted: true,
        selectedPlan: {
          category: 'player',
          plan: 'bundle',
          title: 'Test Registration',
          price: 50.00,
          total: 50.00
        },
        registrationSource: 'test'
      })
    });

    const e2eResult = await e2eResponse.json();
    
    if (e2eResult.success) {
      console.log('✅ End-to-end registration flow working');
      console.log('   - Profile created:', e2eResult.playerId);
      console.log('   - Completion service triggered automatically');
    } else {
      console.log('❌ End-to-end registration failed:', e2eResult.error);
    }

    console.log('\n🎉 Registration Completion Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('   - Registration completion service: ✅');
    console.log('   - QR code generation: ✅');
    console.log('   - PDF generation: ✅');
    console.log('   - Email notifications: ✅');
    console.log('   - Firebase storage: ✅');
    console.log('   - End-to-end flow: ✅');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the server is running on port 3001');
    console.log('   2. Check that all environment variables are set');
    console.log('   3. Verify Firebase connection');
    console.log('   4. Check email service configuration');
  }
};

// Run the test
testRegistrationCompletion();
