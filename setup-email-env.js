const fs = require('fs');
const path = require('path');

function setupEmailEnvironment() {
  console.log('🔧 Setting up email environment variables...');
  
  const envLocalPath = path.join(__dirname, '.env.local');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  // Check if .env.local already exists
  if (fs.existsSync(envLocalPath)) {
    console.log('📄 .env.local file already exists');
    
    // Read current content
    const currentContent = fs.readFileSync(envLocalPath, 'utf8');
    
    // Check if email variables are already configured
    const hasEmailHost = currentContent.includes('EMAIL_HOST=');
    const hasEmailUser = currentContent.includes('EMAIL_USER=');
    const hasEmailPass = currentContent.includes('EMAIL_PASS=');
    
    if (hasEmailHost && hasEmailUser && hasEmailPass) {
      console.log('✅ Email environment variables appear to be configured');
      console.log('🔍 Checking configuration...');
      
      // Load the environment
      require('dotenv').config({ path: '.env.local' });
      
      console.log('📧 Current email configuration:');
      console.log('   EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');
      console.log('   EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET');
      console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '***configured***' : 'NOT SET');
      console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
      console.log('   EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET');
      
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('✅ Email service is properly configured!');
        console.log('🚀 You can now run the test email script:');
        console.log('   node send-test-email-direct.js');
        return;
      }
    }
    
    console.log('⚠️  Email variables need to be configured in .env.local');
  } else {
    console.log('📄 .env.local file does not exist - creating it...');
  }
  
  // Read .env.example to get the email configuration template
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example file not found');
    return;
  }
  
  const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
  
  // Extract email configuration from .env.example
  const emailConfigLines = exampleContent
    .split('\n')
    .filter(line => 
      line.startsWith('EMAIL_') || 
      line.startsWith('# Email Configuration') ||
      line.trim() === ''
    );
  
  console.log('📋 Email configuration template from .env.example:');
  console.log('');
  emailConfigLines.forEach(line => {
    if (line.trim()) {
      console.log('   ' + line);
    }
  });
  
  console.log('');
  console.log('🔧 SETUP INSTRUCTIONS:');
  console.log('1. Create or edit your .env.local file');
  console.log('2. Add the following email configuration:');
  console.log('');
  console.log('# Email Configuration (Required for registration confirmations)');
  console.log('EMAIL_HOST=smtp.privateemail.com');
  console.log('EMAIL_PORT=587');
  console.log('EMAIL_SECURE=false');
  console.log('EMAIL_USER=info@allprosportsnc.com');
  console.log('EMAIL_PASS=4Football!');
  console.log('EMAIL_FROM=noreply@allprosportsnc.com');
  console.log('');
  console.log('3. Save the file');
  console.log('4. Run the test email script: node send-test-email-direct.js');
  console.log('');
  console.log('⚠️  IMPORTANT: .env.local is gitignored and will not be committed to version control');
  console.log('📧 These credentials are from the .env.example file for the All Pro Sports email service');
  
  // Try to create a basic .env.local if it doesn't exist
  if (!fs.existsSync(envLocalPath)) {
    try {
      const basicEnvContent = `# Email Configuration (Required for registration confirmations)
EMAIL_HOST=smtp.privateemail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@allprosportsnc.com
EMAIL_PASS=4Football!
EMAIL_FROM=noreply@allprosportsnc.com

# Add other environment variables as needed
# Copy from .env.example and customize for your local development
`;
      
      fs.writeFileSync(envLocalPath, basicEnvContent);
      console.log('');
      console.log('✅ Created .env.local file with email configuration!');
      console.log('🚀 You can now run the test email script:');
      console.log('   node send-test-email-direct.js');
      
    } catch (error) {
      console.error('❌ Could not create .env.local file:', error.message);
      console.log('💡 Please create the file manually with the configuration above');
    }
  }
}

// Run the setup
setupEmailEnvironment();
