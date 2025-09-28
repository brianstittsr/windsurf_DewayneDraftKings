// Script to create default coupons for All Pro Sports
// Run this with: node scripts/create-default-coupons.js

const defaultCoupons = [
  {
    code: 'SAVE100',
    name: 'Save $10 Discount',
    description: 'Get $10 off your registration',
    discountType: 'fixed_amount',
    discountValue: 10,
    maxUses: 100,
    maxUsesPerCustomer: 1,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    applicableItems: {
      playerRegistration: true,
      coachRegistration: true,
      jamboreeOnly: true,
      completeSeason: true,
      jamboreeAndSeason: true,
    },
    minimumAmount: 25,
    isActive: true,
    usedCount: 0
  },
  {
    code: 'EARLYBIRD',
    name: 'Early Bird 15% Off',
    description: 'Early registration discount - 15% off',
    discountType: 'percentage',
    discountValue: 15,
    maxUses: 50,
    maxUsesPerCustomer: 1,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    applicableItems: {
      playerRegistration: true,
      coachRegistration: false,
      jamboreeOnly: false,
      completeSeason: true,
      jamboreeAndSeason: true,
    },
    minimumAmount: 50,
    isActive: true,
    usedCount: 0
  },
  {
    code: 'COACH50',
    name: 'Coach Special - $5 Off',
    description: 'Special discount for coaches',
    discountType: 'fixed_amount',
    discountValue: 5,
    maxUses: 25,
    maxUsesPerCustomer: 1,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    applicableItems: {
      playerRegistration: false,
      coachRegistration: true,
      jamboreeOnly: false,
      completeSeason: false,
      jamboreeAndSeason: false,
    },
    minimumAmount: 20,
    isActive: true,
    usedCount: 0
  },
  {
    code: 'JAMBOREE25',
    name: 'Jamboree Special - $2.50 Off',
    description: 'Special discount for Jamboree registration',
    discountType: 'fixed_amount',
    discountValue: 2.5,
    maxUses: 75,
    maxUsesPerCustomer: 1,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    applicableItems: {
      playerRegistration: true,
      coachRegistration: false,
      jamboreeOnly: true,
      completeSeason: false,
      jamboreeAndSeason: true,
    },
    minimumAmount: 15,
    isActive: true,
    usedCount: 0
  },
  {
    code: 'BUNDLE20',
    name: 'Bundle Deal - 20% Off',
    description: 'Get 20% off Jamboree + Season bundle',
    discountType: 'percentage',
    discountValue: 20,
    maxUses: 30,
    maxUsesPerCustomer: 1,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months
    applicableItems: {
      playerRegistration: true,
      coachRegistration: false,
      jamboreeOnly: false,
      completeSeason: false,
      jamboreeAndSeason: true,
    },
    minimumAmount: 75,
    isActive: true,
    usedCount: 0
  }
];

async function createCoupons() {
  console.log('Creating default coupons...');
  
  for (const coupon of defaultCoupons) {
    try {
      const response = await fetch('http://localhost:3000/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coupon),
      });

      if (response.ok) {
        console.log(`✅ Created coupon: ${coupon.code}`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create coupon ${coupon.code}: ${error}`);
      }
    } catch (error) {
      console.log(`❌ Error creating coupon ${coupon.code}:`, error.message);
    }
  }
  
  console.log('Finished creating default coupons!');
}

// Run if called directly
if (require.main === module) {
  createCoupons();
}

module.exports = { defaultCoupons, createCoupons };
