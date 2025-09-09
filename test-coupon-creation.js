// Simple test to create TEST100 coupon
const fetch = require('node-fetch');

const couponData = {
  code: 'TEST100',
  description: 'Test coupon - reduces any registration to $1',
  discountType: 'set_price',
  discountValue: 1.00,
  isActive: true,
  expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  usageLimit: null,
  minimumOrderAmount: 0,
  applicableItems: ['jamboree', 'complete_season', 'jamboree_and_season', 'coach_registration'],
  notes: 'Test coupon for development and testing purposes'
};

console.log('TEST100 Coupon Data Ready:');
console.log(JSON.stringify(couponData, null, 2));
console.log('\nTo create this coupon:');
console.log('1. Go to http://localhost:3000/admin');
console.log('2. Navigate to the Coupons tab');
console.log('3. Click "Add New Coupon"');
console.log('4. Fill in the form with the above data');
console.log('5. Or use the browser console to run:');
console.log(`
fetch('/api/coupons', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${JSON.stringify(couponData)})
}).then(r => r.json()).then(console.log);
`);
