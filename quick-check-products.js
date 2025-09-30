const http = require('http');

console.log('🔍 Checking products collection via API...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/products',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.products) {
        console.log(`✅ Products collection EXISTS!`);
        console.log(`📦 Found ${json.products.length} products\n`);
        
        if (json.products.length > 0) {
          console.log('Products:');
          json.products.forEach((p, i) => {
            console.log(`${i + 1}. ${p.title} - $${p.totalPrice} (${p.category})`);
          });
        } else {
          console.log('⚠️  Collection is EMPTY - no products found');
          console.log('\n💡 To add products, run:');
          console.log('   node scripts/populate-production-firebase.js');
        }
      } else if (json.error) {
        console.log('❌ Error from API:', json.error);
        console.log('Details:', json.details || 'No details');
        
        if (json.debug) {
          console.log('\nDebug info:', json.debug);
        }
      }
    } catch (e) {
      console.log('❌ Failed to parse response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Cannot connect to local server');
  console.log('Error:', error.message);
  console.log('\n💡 Make sure your dev server is running:');
  console.log('   npm run dev');
});

req.end();
