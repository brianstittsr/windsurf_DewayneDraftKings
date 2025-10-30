// Quick environment variable checker
require('dotenv').config({ path: '.env.local' });

console.log('\n📋 Checking Email Variables:\n');

const emailVars = {
  'EMAIL_HOST': process.env.EMAIL_HOST,
  'EMAIL_PORT': process.env.EMAIL_PORT,
  'EMAIL_USER': process.env.EMAIL_USER,
  'EMAIL_PASS': process.env.EMAIL_PASS ? '***SET***' : undefined,
  'EMAIL_FROM': process.env.EMAIL_FROM,
};

const smtpVars = {
  'SMTP_HOST': process.env.SMTP_HOST,
  'SMTP_PORT': process.env.SMTP_PORT,
  'SMTP_USER': process.env.SMTP_USER,
  'SMTP_PASS': process.env.SMTP_PASS ? '***SET***' : undefined,
  'SMTP_FROM': process.env.SMTP_FROM,
};

console.log('EMAIL_* Variables:');
Object.entries(emailVars).forEach(([key, val]) => {
  console.log(`  ${val ? '✅' : '❌'} ${key}: ${val || 'NOT SET'}`);
});

console.log('\nSMTP_* Variables:');
Object.entries(smtpVars).forEach(([key, val]) => {
  console.log(`  ${val ? '✅' : '❌'} ${key}: ${val || 'NOT SET'}`);
});

console.log('\n💡 Registration uses EMAIL_* variables (not SMTP_*)');
console.log('   Make sure your .env.local has EMAIL_HOST, EMAIL_USER, etc.\n');
