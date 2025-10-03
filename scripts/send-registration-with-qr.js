/**
 * Send mock registration confirmation email with QR code
 * Run: node scripts/send-registration-with-qr.js
 */

const QRCode = require('qrcode');

const mockPlayer = {
  id: 'player_' + Date.now(),
  firstName: 'Brian',
  lastName: 'Stitt',
  email: 'brianstittsr@gmail.com',
  phone: '(919) 555-1234',
  dateOfBirth: '1990-05-15',
  position: 'Wide Receiver',
  jerseyNumber: 88,
  teamName: 'Thunder Strikers',
  planName: 'Basic Registration + Meal Plan',
  planAmount: 112.00,
  registrationDate: new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  seasonYear: '2024-2025',
  emergencyContact: {
    name: 'Sarah Stitt',
    phone: '(919) 555-5678',
    relationship: 'Spouse'
  }
};

async function generateQRCode() {
  try {
    // Generate QR code with player data
    const qrData = JSON.stringify({
      playerId: mockPlayer.id,
      name: `${mockPlayer.firstName} ${mockPlayer.lastName}`,
      team: mockPlayer.teamName,
      jersey: mockPlayer.jerseyNumber,
      season: mockPlayer.seasonYear,
      verified: true
    });

    // Generate QR code as base64 data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

async function sendRegistrationEmail() {
  try {
    console.log('🏈 Generating mock registration confirmation...');
    console.log('');
    console.log('Player Details:');
    console.log('- Name:', `${mockPlayer.firstName} ${mockPlayer.lastName}`);
    console.log('- Email:', mockPlayer.email);
    console.log('- Team:', mockPlayer.teamName);
    console.log('- Jersey #:', mockPlayer.jerseyNumber);
    console.log('- Position:', mockPlayer.position);
    console.log('');

    // Generate QR code
    console.log('📱 Generating QR code...');
    const qrCodeImage = await generateQRCode();
    
    if (!qrCodeImage) {
      console.error('❌ Failed to generate QR code');
      return;
    }
    console.log('✅ QR code generated successfully');
    console.log('');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    console.log('📧 Sending registration email...');
    
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: mockPlayer.email,
        subject: `🏈 Registration Confirmed - ${mockPlayer.firstName} ${mockPlayer.lastName} #${mockPlayer.jerseyNumber}`,
        attachments: [
          {
            filename: `${mockPlayer.firstName}_${mockPlayer.lastName}_QR_Code.png`,
            content: qrCodeImage.split('base64,')[1],
            encoding: 'base64',
            cid: 'qrcode@allprosportsnc.com'
          }
        ],
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #333; 
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .email-wrapper { 
                background-color: #f4f4f4; 
                padding: 20px; 
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .header { 
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
              }
              .header h1 { 
                margin: 0; 
                font-size: 32px; 
                font-weight: 700;
              }
              .header p { 
                margin: 10px 0 0 0; 
                font-size: 18px; 
                opacity: 0.9;
              }
              .content { 
                padding: 40px 30px; 
              }
              .player-card {
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
                border-left: 5px solid #3b82f6;
              }
              .player-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
              }
              .player-details h2 {
                margin: 0 0 5px 0;
                color: #1e3a8a;
                font-size: 28px;
              }
              .jersey-badge {
                background: #1e3a8a;
                color: white;
                width: 70px;
                height: 70px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                font-weight: bold;
                box-shadow: 0 4px 6px rgba(0,0,0,0.2);
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-top: 20px;
              }
              .info-item {
                background: white;
                padding: 12px;
                border-radius: 8px;
              }
              .info-label {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
              }
              .info-value {
                font-size: 16px;
                color: #1f2937;
                font-weight: 600;
              }
              .qr-section {
                background: white;
                border: 3px dashed #3b82f6;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
              }
              .qr-section h3 {
                color: #1e3a8a;
                margin-top: 0;
                font-size: 22px;
              }
              .qr-code-container {
                background: white;
                padding: 20px;
                border-radius: 8px;
                display: inline-block;
                margin: 20px 0;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .qr-instructions {
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
                padding: 15px;
                border-radius: 8px;
                text-align: left;
                margin-top: 20px;
              }
              .info-box {
                background: #f9fafb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .info-box h3 {
                color: #1e3a8a;
                margin-top: 0;
                font-size: 18px;
              }
              .info-box ul {
                margin: 10px 0;
                padding-left: 20px;
              }
              .info-box li {
                margin: 8px 0;
                color: #4b5563;
              }
              .checklist {
                background: #ecfdf5;
                border-left: 4px solid #10b981;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .checklist h3 {
                color: #065f46;
                margin-top: 0;
              }
              .checklist-item {
                display: flex;
                align-items: center;
                margin: 12px 0;
                color: #047857;
              }
              .checklist-item::before {
                content: "✓";
                background: #10b981;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                font-weight: bold;
              }
              .button {
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: 600;
                transition: background 0.3s;
              }
              .button:hover {
                background: #2563eb;
              }
              .emergency-contact {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .footer {
                background: #f9fafb;
                text-align: center;
                color: #6b7280;
                font-size: 13px;
                padding: 30px;
                border-top: 1px solid #e5e7eb;
              }
              .footer a {
                color: #3b82f6;
                text-decoration: none;
              }
              .social-links {
                margin: 20px 0;
              }
              .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #6b7280;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <div class="container">
                <!-- Header -->
                <div class="header">
                  <h1>🏈 Registration Confirmed!</h1>
                  <p>Welcome to All Pro Sports NC</p>
                  <p style="font-size: 14px; margin-top: 5px;">Season ${mockPlayer.seasonYear}</p>
                </div>
                
                <!-- Content -->
                <div class="content">
                  <p style="font-size: 18px; color: #1f2937;">
                    Congratulations <strong>${mockPlayer.firstName}</strong>! 🎉
                  </p>
                  
                  <p>
                    Your registration has been successfully processed. You're now officially part of the 
                    <strong>${mockPlayer.teamName}</strong> for the ${mockPlayer.seasonYear} season!
                  </p>

                  <!-- Player Card -->
                  <div class="player-card">
                    <div class="player-info">
                      <div class="player-details">
                        <h2>${mockPlayer.firstName} ${mockPlayer.lastName}</h2>
                        <p style="margin: 0; color: #6b7280; font-size: 16px;">
                          ${mockPlayer.position} • ${mockPlayer.teamName}
                        </p>
                      </div>
                      <div class="jersey-badge">
                        ${mockPlayer.jerseyNumber}
                      </div>
                    </div>
                    
                    <div class="info-grid">
                      <div class="info-item">
                        <div class="info-label">Plan</div>
                        <div class="info-value">${mockPlayer.planName}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">Amount Paid</div>
                        <div class="info-value">$${mockPlayer.planAmount.toFixed(2)}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">Registration Date</div>
                        <div class="info-value">${mockPlayer.registrationDate}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">Player ID</div>
                        <div class="info-value">${mockPlayer.id.substring(0, 12)}...</div>
                      </div>
                    </div>
                  </div>

                  <!-- QR Code Section -->
                  <div class="qr-section">
                    <h3>📱 Your Player QR Code</h3>
                    <p style="color: #6b7280; margin: 10px 0;">
                      Use this QR code for quick check-in at games and events
                    </p>
                    
                    <div class="qr-code-container">
                      <img src="cid:qrcode@allprosportsnc.com" alt="Player QR Code" style="width: 250px; height: 250px;" />
                    </div>
                    
                    <div class="qr-instructions">
                      <strong>📲 How to use your QR code:</strong>
                      <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Save this image to your phone</li>
                        <li>Show it at check-in for games and practices</li>
                        <li>Staff will scan it for instant verification</li>
                        <li>Keep it handy for all league events</li>
                      </ul>
                    </div>
                  </div>

                  <!-- What's Included -->
                  <div class="info-box">
                    <h3>✅ What's Included in Your Registration</h3>
                    <ul>
                      <li><strong>League Participation:</strong> Full season access to all games</li>
                      <li><strong>Team Jersey:</strong> Official ${mockPlayer.teamName} uniform</li>
                      <li><strong>Player Profile:</strong> Digital profile with stats tracking</li>
                      <li><strong>QR Code Access:</strong> Quick check-in at all events</li>
                      <li><strong>SMS Notifications:</strong> Game schedules and updates</li>
                      <li><strong>Meal Plan:</strong> Post-game nutrition (if selected)</li>
                      <li><strong>Insurance Coverage:</strong> League liability insurance</li>
                    </ul>
                  </div>

                  <!-- Next Steps Checklist -->
                  <div class="checklist">
                    <h3>📋 Next Steps</h3>
                    <div class="checklist-item">Save your QR code to your phone</div>
                    <div class="checklist-item">Complete medical waiver form (link below)</div>
                    <div class="checklist-item">Attend team orientation on [Date TBD]</div>
                    <div class="checklist-item">Pick up your jersey at first practice</div>
                    <div class="checklist-item">Join team group chat for updates</div>
                  </div>

                  <!-- Emergency Contact -->
                  <div class="emergency-contact">
                    <strong>🚨 Emergency Contact on File:</strong><br>
                    ${mockPlayer.emergencyContact.name} (${mockPlayer.emergencyContact.relationship})<br>
                    ${mockPlayer.emergencyContact.phone}
                  </div>

                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${baseUrl}/admin?tab=user-profiles&id=${mockPlayer.id}" class="button">
                      View My Profile
                    </a>
                    <a href="${baseUrl}/waiver" class="button" style="background: #10b981; margin-left: 10px;">
                      Complete Waiver
                    </a>
                  </div>

                  <!-- Important Information -->
                  <div class="info-box" style="background: #fef2f2; border-left-color: #ef4444;">
                    <h3 style="color: #991b1b;">⚠️ Important Reminders</h3>
                    <ul>
                      <li>First practice: [Date will be announced via SMS]</li>
                      <li>Bring water bottle and athletic shoes to all practices</li>
                      <li>Medical waiver must be completed before first game</li>
                      <li>Check-in 15 minutes before game time</li>
                      <li>Parents/guardians must stay during youth practices</li>
                    </ul>
                  </div>

                  <!-- Contact Info -->
                  <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1e40af; margin-top: 0;">📞 Need Help?</h3>
                    <p style="margin: 5px 0;">
                      <strong>Email:</strong> <a href="mailto:info@allprosportsnc.com" style="color: #3b82f6;">info@allprosportsnc.com</a>
                    </p>
                    <p style="margin: 5px 0;">
                      <strong>Phone:</strong> (919) 555-0100
                    </p>
                    <p style="margin: 5px 0;">
                      <strong>Office Hours:</strong> Mon-Fri 9AM-6PM EST
                    </p>
                  </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                  <p style="margin: 0 0 15px 0;"><strong>All Pro Sports NC</strong></p>
                  <p style="margin: 0 0 10px 0;">Professional Youth Sports League</p>
                  
                  <div class="social-links">
                    <a href="https://facebook.com/allprosportsnc">Facebook</a> •
                    <a href="https://instagram.com/allprosportsnc">Instagram</a> •
                    <a href="https://twitter.com/allprosportsnc">Twitter</a>
                  </div>
                  
                  <p style="margin: 20px 0 10px 0; font-size: 12px;">
                    <a href="${baseUrl}">Visit Website</a> | 
                    <a href="${baseUrl}/contact">Contact Us</a> | 
                    <a href="${baseUrl}/privacy">Privacy Policy</a>
                  </p>
                  
                  <p style="margin: 10px 0; color: #9ca3af; font-size: 11px;">
                    This is an automated confirmation email. Please do not reply.<br>
                    If you did not register for this league, please contact us immediately.
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
🏈 REGISTRATION CONFIRMED - ALL PRO SPORTS NC

Welcome ${mockPlayer.firstName} ${mockPlayer.lastName}!

Your registration has been successfully processed for the ${mockPlayer.seasonYear} season.

PLAYER DETAILS:
- Name: ${mockPlayer.firstName} ${mockPlayer.lastName}
- Jersey Number: ${mockPlayer.jerseyNumber}
- Position: ${mockPlayer.position}
- Team: ${mockPlayer.teamName}
- Plan: ${mockPlayer.planName}
- Amount Paid: $${mockPlayer.planAmount.toFixed(2)}
- Registration Date: ${mockPlayer.registrationDate}
- Player ID: ${mockPlayer.id}

EMERGENCY CONTACT:
${mockPlayer.emergencyContact.name} (${mockPlayer.emergencyContact.relationship})
${mockPlayer.emergencyContact.phone}

WHAT'S INCLUDED:
✓ League Participation - Full season access
✓ Team Jersey - Official uniform
✓ Player Profile - Digital stats tracking
✓ QR Code Access - Quick check-in
✓ SMS Notifications - Schedules and updates
✓ Meal Plan - Post-game nutrition (if selected)
✓ Insurance Coverage - League liability

NEXT STEPS:
1. Save your QR code (attached to email)
2. Complete medical waiver form
3. Attend team orientation
4. Pick up jersey at first practice
5. Join team group chat

IMPORTANT REMINDERS:
- First practice date will be announced via SMS
- Bring water bottle and athletic shoes
- Medical waiver required before first game
- Check-in 15 minutes before game time

NEED HELP?
Email: info@allprosportsnc.com
Phone: (919) 555-0100
Hours: Mon-Fri 9AM-6PM EST

View your profile: ${baseUrl}/admin?tab=user-profiles&id=${mockPlayer.id}

All Pro Sports NC
Professional Youth Sports League
        `
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Registration email sent successfully!');
      console.log('');
      console.log('📬 Email Details:');
      console.log('   To:', mockPlayer.email);
      console.log('   Subject: 🏈 Registration Confirmed -', `${mockPlayer.firstName} ${mockPlayer.lastName} #${mockPlayer.jerseyNumber}`);
      console.log('   Includes: QR Code, Player Card, Next Steps');
      console.log('');
      console.log('📱 QR Code Information:');
      console.log('   Player ID:', mockPlayer.id);
      console.log('   Team:', mockPlayer.teamName);
      console.log('   Jersey:', mockPlayer.jerseyNumber);
      console.log('   Size: 250x250px');
      console.log('');
      console.log('✨ Check your inbox at brianstittsr@gmail.com!');
    } else {
      console.error('❌ Failed to send email');
      console.error('Error:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Make sure dev server is running: npm run dev');
    console.log('2. Check email environment variables are set');
    console.log('3. Install qrcode package: npm install qrcode');
  }
}

// Run the script
sendRegistrationEmail();
