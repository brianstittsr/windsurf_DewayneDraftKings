const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testAmount: 100, // $1.00 in cents
  testCustomer: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '+15551234567'
  },
  testPlan: {
    title: 'Test Registration',
    itemType: 'jamboree',
    price: 1.00,
    pricing: {
      subtotal: 1.00,
      serviceFee: 0,
      total: 1.00
    }
  }
};

async function testPaymentIntentCreation() {
  console.log('🧪 Testing Payment Intent Creation...');
  
  try {
    const response = await axios.post(`${TEST_CONFIG.baseUrl}/api/payments/create-payment-intent`, {
      amount: TEST_CONFIG.testAmount,
      currency: 'usd',
      description: 'Test Payment Intent',
      customerEmail: TEST_CONFIG.testCustomer.email,
      customerName: `${TEST_CONFIG.testCustomer.firstName} ${TEST_CONFIG.testCustomer.lastName}`,
      metadata: {
        planTitle: TEST_CONFIG.testPlan.title,
        planType: TEST_CONFIG.testPlan.itemType,
        customerPhone: TEST_CONFIG.testCustomer.phone
      }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.clientSecret && response.data.paymentIntentId) {
      console.log('✅ Payment Intent Created Successfully');
      console.log(`   - Payment Intent ID: ${response.data.paymentIntentId}`);
      console.log(`   - Client Secret: ${response.data.clientSecret.substring(0, 20)}...`);
      return { success: true, data: response.data };
    } else {
      console.log('❌ Payment Intent Creation Failed - Missing required fields');
      return { success: false, error: 'Missing clientSecret or paymentIntentId' };
    }
  } catch (error) {
    console.log('❌ Payment Intent Creation Error:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data.error || 'Unknown error'}`);
    } else {
      console.log(`   - Network Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function testCheckoutSessionCreation() {
  console.log('\n🧪 Testing Checkout Session Creation (BNPL)...');
  
  try {
    const response = await axios.post(`${TEST_CONFIG.baseUrl}/api/payments/create-checkout`, {
      amount: TEST_CONFIG.testAmount,
      currency: 'usd',
      description: 'Test Checkout Session',
      customerEmail: TEST_CONFIG.testCustomer.email,
      customerName: `${TEST_CONFIG.testCustomer.firstName} ${TEST_CONFIG.testCustomer.lastName}`,
      paymentMethod: 'klarna',
      paymentMethods: ['klarna'],
      successUrl: `${TEST_CONFIG.baseUrl}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${TEST_CONFIG.baseUrl}/register?cancelled=true`,
      metadata: {
        planTitle: TEST_CONFIG.testPlan.title,
        planType: TEST_CONFIG.testPlan.itemType,
        customerPhone: TEST_CONFIG.testCustomer.phone
      }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.success && response.data.url) {
      console.log('✅ Checkout Session Created Successfully');
      console.log(`   - Session URL: ${response.data.url.substring(0, 50)}...`);
      return { success: true, data: response.data };
    } else {
      console.log('❌ Checkout Session Creation Failed');
      console.log(`   - Error: ${response.data.error || 'Unknown error'}`);
      return { success: false, error: response.data.error };
    }
  } catch (error) {
    console.log('❌ Checkout Session Creation Error:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data.error || 'Unknown error'}`);
    } else {
      console.log(`   - Network Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function testCouponValidation() {
  console.log('\n🧪 Testing Coupon Validation...');
  
  try {
    const response = await axios.post(`${TEST_CONFIG.baseUrl}/api/coupons/validate`, {
      code: 'TEST100',
      orderAmount: TEST_CONFIG.testPlan.price,
      applicableItems: [TEST_CONFIG.testPlan.itemType]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.success) {
      console.log('✅ Coupon Validation Successful');
      console.log(`   - Discount: $${response.data.discount}`);
      console.log(`   - Final Amount: $${response.data.finalAmount}`);
      return { success: true, data: response.data };
    } else {
      console.log('❌ Coupon Validation Failed');
      console.log(`   - Error: ${response.data.error || 'Unknown error'}`);
      return { success: false, error: response.data.error };
    }
  } catch (error) {
    console.log('❌ Coupon Validation Error:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data.error || 'Unknown error'}`);
    } else {
      console.log(`   - Network Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function checkEnvironmentVariables() {
  console.log('🔍 Checking Environment Variables...');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];
  
  let allPresent = true;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Present`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

async function runFullTest() {
  console.log('🚀 Starting Stripe Payment Flow Test\n');
  
  // Check environment variables
  const envCheck = await checkEnvironmentVariables();
  if (!envCheck) {
    console.log('\n❌ Environment variables missing. Please check your .env.local file.');
    return;
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Test payment intent creation
  const paymentIntentTest = await testPaymentIntentCreation();
  
  // Test checkout session creation
  const checkoutSessionTest = await testCheckoutSessionCreation();
  
  // Test coupon validation
  const couponTest = await testCouponValidation();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  console.log(`Payment Intent Creation: ${paymentIntentTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Checkout Session Creation: ${checkoutSessionTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Coupon Validation: ${couponTest.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const allTestsPassed = paymentIntentTest.success && checkoutSessionTest.success && couponTest.success;
  
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED - System ready for live transactions!');
    console.log('\nNext Steps:');
    console.log('1. Test with Stripe test cards: 4242424242424242');
    console.log('2. Verify webhook endpoints for production');
    console.log('3. Test complete checkout flow in browser');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Review errors above');
    console.log('\nCommon Issues:');
    console.log('- Missing or invalid Stripe API keys');
    console.log('- Server not running on localhost:3000');
    console.log('- Database connection issues');
  }
  console.log('='.repeat(50));
}

// Run the test
runFullTest().catch(console.error);
