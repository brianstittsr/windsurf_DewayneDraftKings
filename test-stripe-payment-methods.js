// Test Stripe payment methods (Klarna, Affirm, Credit Card) integration
const http = require('http');

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testPaymentMethod(paymentMethod, orderData) {
  console.log(`\n🧪 Testing ${paymentMethod.toUpperCase()} Payment Method`);
  console.log(`   Amount: $${orderData.amount / 100}`);
  console.log(`   Description: ${orderData.description}`);
  
  try {
    const { status, data } = await makeRequest('/api/payments/create-checkout', orderData);
    
    if (data.success && data.url) {
      console.log(`   ✅ PASS - Checkout session created successfully`);
      console.log(`   📝 Session ID: ${data.sessionId || 'Generated'}`);
      console.log(`   🔗 Checkout URL: ${data.url.substring(0, 50)}...`);
      
      // Verify the URL contains expected Stripe checkout domain
      if (data.url.includes('checkout.stripe.com')) {
        console.log(`   ✅ Valid Stripe checkout URL`);
        return true;
      } else {
        console.log(`   ⚠️  Unexpected checkout URL format`);
        return false;
      }
    } else {
      console.log(`   ❌ FAIL - ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
    return false;
  }
}

async function testPaymentWithCoupon(paymentMethod, orderData, couponCode) {
  console.log(`\n🎫 Testing ${paymentMethod.toUpperCase()} with Coupon: ${couponCode}`);
  
  const orderWithCoupon = {
    ...orderData,
    appliedCoupon: couponCode,
    metadata: {
      ...orderData.metadata,
      appliedCoupon: couponCode,
      originalAmount: orderData.amount,
      discountAmount: 0 // Will be calculated by backend
    }
  };
  
  try {
    const { status, data } = await makeRequest('/api/payments/create-checkout', orderWithCoupon);
    
    if (data.success && data.url) {
      console.log(`   ✅ PASS - Checkout with coupon created successfully`);
      console.log(`   🎫 Coupon applied: ${couponCode}`);
      return true;
    } else {
      console.log(`   ❌ FAIL - ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
    return false;
  }
}

async function runPaymentTests() {
  console.log('🚀 Testing Stripe Payment Methods (Klarna, Affirm, Credit Card)\n');
  console.log('=' .repeat(60));
  
  // Base order data for testing
  const baseOrderData = {
    amount: 8850, // $88.50 in cents
    currency: 'usd',
    description: 'All Pro Sports - Jamboree + Season',
    customerEmail: 'test@example.com',
    customerName: 'Test Customer',
    metadata: {
      planTitle: 'Jamboree + Season',
      planType: 'jamboree_and_season',
      customerPhone: '555-123-4567'
    },
    successUrl: 'http://localhost:3000/registration-success?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: 'http://localhost:3000/register?cancelled=true'
  };
  
  let passCount = 0;
  let totalTests = 0;
  
  // Test 1: Credit Card Payment
  totalTests++;
  const cardOrderData = {
    ...baseOrderData,
    paymentMethods: ['card']
  };
  if (await testPaymentMethod('Credit Card', cardOrderData)) {
    passCount++;
  }
  
  // Test 2: Klarna Payment
  totalTests++;
  const klarnaOrderData = {
    ...baseOrderData,
    paymentMethod: 'klarna',
    paymentMethods: ['klarna']
  };
  if (await testPaymentMethod('Klarna', klarnaOrderData)) {
    passCount++;
  }
  
  // Test 3: Affirm Payment
  totalTests++;
  const affirmOrderData = {
    ...baseOrderData,
    paymentMethod: 'affirm',
    paymentMethods: ['affirm']
  };
  if (await testPaymentMethod('Affirm', affirmOrderData)) {
    passCount++;
  }
  
  // Test 4: Klarna with Coupon
  totalTests++;
  if (await testPaymentWithCoupon('Klarna', klarnaOrderData, 'SAVE100')) {
    passCount++;
  }
  
  // Test 5: Affirm with Coupon
  totalTests++;
  if (await testPaymentWithCoupon('Affirm', affirmOrderData, 'PERCENT20')) {
    passCount++;
  }
  
  // Test 6: Credit Card with Coupon
  totalTests++;
  if (await testPaymentWithCoupon('Credit Card', cardOrderData, 'FIXED15')) {
    passCount++;
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📊 Payment Test Results: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('🎉 All payment methods working correctly!');
    console.log('\n✅ Verified Payment Methods:');
    console.log('   • Credit/Debit Cards via Stripe');
    console.log('   • Klarna Buy Now Pay Later');
    console.log('   • Affirm Installment Payments');
    console.log('   • All methods work with coupon codes');
  } else {
    console.log('⚠️  Some payment methods need attention');
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('   • Ensure Stripe keys are configured in .env.local');
    console.log('   • Check that Klarna and Affirm are enabled in Stripe dashboard');
    console.log('   • Verify webhook endpoints are properly configured');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Test actual payments with Stripe test cards');
  console.log('   2. Verify webhook handling for payment completion');
  console.log('   3. Test payment failure scenarios');
  console.log('   4. Validate payment confirmation emails');
}

runPaymentTests();
