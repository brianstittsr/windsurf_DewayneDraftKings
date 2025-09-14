// Create test coupons for all three types
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

async function createCoupon(couponData) {
  console.log(`Creating coupon: ${couponData.code} (${couponData.discountType})`);
  
  try {
    const { status, data } = await makeRequest('/api/coupons', couponData);
    
    if (data.success) {
      console.log(`✅ Created ${couponData.code} successfully`);
      return true;
    } else {
      console.log(`❌ Failed to create ${couponData.code}: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error creating ${couponData.code}: ${error.message}`);
    return false;
  }
}

async function createAllTestCoupons() {
  console.log('🚀 Creating Test Coupons for All Types\n');
  
  const coupons = [
    {
      code: 'PERCENT20',
      description: 'Test 20% off coupon',
      discountType: 'percentage',
      discountValue: 20,
      isActive: true,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: null,
      minimumOrderAmount: 0,
      applicableItems: {
        jamboreeAndSeason: true,
        jamboreeOnly: true,
        coachRegistration: true,
        completeSeason: true,
        playerRegistration: true
      },
      notes: 'Test percentage coupon'
    },
    {
      code: 'FIXED15',
      description: 'Test $15 off coupon',
      discountType: 'fixed_amount',
      discountValue: 15,
      isActive: true,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: null,
      minimumOrderAmount: 0,
      applicableItems: {
        jamboreeAndSeason: true,
        jamboreeOnly: true,
        coachRegistration: true,
        completeSeason: true,
        playerRegistration: true
      },
      notes: 'Test fixed amount coupon'
    },
    {
      code: 'PERCENT50',
      description: 'Test 50% off coupon',
      discountType: 'percentage',
      discountValue: 50,
      isActive: true,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: null,
      minimumOrderAmount: 0,
      applicableItems: {
        jamboreeAndSeason: true,
        jamboreeOnly: true,
        coachRegistration: true,
        completeSeason: true,
        playerRegistration: true
      },
      notes: 'Test 50% percentage coupon'
    }
  ];
  
  let successCount = 0;
  
  for (const coupon of coupons) {
    if (await createCoupon(coupon)) {
      successCount++;
    }
  }
  
  console.log(`\n📊 Created ${successCount}/${coupons.length} test coupons`);
  console.log('\nNow you can test all coupon types:');
  console.log('- SAVE100: Set price to $1.00');
  console.log('- PERCENT20: 20% off');
  console.log('- PERCENT50: 50% off');
  console.log('- FIXED15: $15 off');
}

createAllTestCoupons();
