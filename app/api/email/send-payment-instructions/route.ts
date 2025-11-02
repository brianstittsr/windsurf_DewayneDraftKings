import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { to, customerName, amount, paymentReference, cashtag } = await request.json();

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border: 1px solid #ddd;
    }
    .payment-box {
      background: white;
      border: 2px solid #28a745;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .payment-detail {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .payment-detail:last-child {
      border-bottom: none;
    }
    .amount {
      font-size: 32px;
      font-weight: bold;
      color: #28a745;
      text-align: center;
      margin: 20px 0;
    }
    .cashtag {
      font-size: 24px;
      font-weight: bold;
      color: #00d632;
      text-align: center;
      background: #f0f0f0;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
    }
    .reference {
      font-size: 18px;
      font-weight: bold;
      color: #667eea;
      text-align: center;
      background: #f0f0f0;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      margin: 15px 0;
    }
    .steps {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .step {
      display: flex;
      align-items: flex-start;
      margin: 15px 0;
    }
    .step-number {
      background: #28a745;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 15px;
      flex-shrink: 0;
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏈 All Pro Sports NC</h1>
    <h2>Payment Instructions</h2>
  </div>
  
  <div class="content">
    <p>Hi ${customerName},</p>
    
    <p>Thank you for registering with All Pro Sports NC! Your registration is saved and pending payment confirmation.</p>
    
    <div class="payment-box">
      <h3 style="margin-top: 0; color: #28a745;">💰 Payment Details</h3>
      
      <div class="amount">$${amount.toFixed(2)}</div>
      
      <div class="payment-detail">
        <strong>Send to:</strong>
        <span>Cash App</span>
      </div>
      
      <div class="cashtag">${cashtag}</div>
      
      <div class="payment-detail" style="margin-top: 15px;">
        <strong>Reference Number:</strong>
      </div>
      <div class="reference">${paymentReference}</div>
    </div>
    
    <div class="warning">
      <strong>⚠️ Important:</strong> Please include the reference number <strong>${paymentReference}</strong> in the note/memo field when sending your payment. This helps us match your payment to your registration.
    </div>
    
    <div class="steps">
      <h3 style="margin-top: 0;">📱 How to Pay with Cash App</h3>
      
      <div class="step">
        <div class="step-number">1</div>
        <div>
          <strong>Open Cash App</strong><br>
          Launch the Cash App application on your mobile device
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">2</div>
        <div>
          <strong>Tap "Send" or "$"</strong><br>
          Choose the send money option
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">3</div>
        <div>
          <strong>Enter ${cashtag}</strong><br>
          Search for this Cash App username
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">4</div>
        <div>
          <strong>Enter Amount: $${amount.toFixed(2)}</strong><br>
          Make sure to send the exact amount shown
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">5</div>
        <div>
          <strong>Add Note: ${paymentReference}</strong><br>
          Copy and paste the reference number in the note/memo field
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">6</div>
        <div>
          <strong>Complete Payment</strong><br>
          Review and confirm your payment
        </div>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href="https://cash.app/${cashtag.replace('$', '')}" class="button">Open Cash App</a>
    </div>
    
    <div class="warning">
      <strong>⏰ Payment Deadline:</strong> Please complete your payment within 24 hours to secure your registration spot. You will receive a confirmation email once we verify your payment.
    </div>
    
    <p><strong>Questions?</strong> Contact us at:</p>
    <ul>
      <li>Email: dewayne.thomas2011@gmail.com</li>
      <li>We're here to help!</li>
    </ul>
  </div>
  
  <div class="footer">
    <p>All Pro Sports NC<br>
    Building Champions On and Off the Field</p>
    <p style="font-size: 12px; color: #999;">
      This is an automated message. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
    `;

    const emailText = `
All Pro Sports NC - Payment Instructions

Hi ${customerName},

Thank you for registering with All Pro Sports NC! Your registration is saved and pending payment confirmation.

PAYMENT DETAILS:
Amount: $${amount.toFixed(2)}
Send to: ${cashtag}
Reference Number: ${paymentReference}

HOW TO PAY WITH CASH APP:
1. Open Cash App on your mobile device
2. Tap "Send" or "$"
3. Enter ${cashtag}
4. Enter Amount: $${amount.toFixed(2)}
5. Add Note: ${paymentReference}
6. Complete Payment

IMPORTANT: Please include the reference number ${paymentReference} in the note/memo field when sending your payment.

Payment Deadline: Please complete your payment within 24 hours to secure your registration spot.

Questions? Contact us at dewayne.thomas2011@gmail.com

All Pro Sports NC
Building Champions On and Off the Field
    `;

    // Send email to customer and CC to admins
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@allprosportsnc.com',
      to: to,
      cc: 'dewayne.thomas2011@gmail.com, bstitt@mjoandco.com',
      subject: `Payment Instructions - All Pro Sports NC Registration ($${amount.toFixed(2)})`,
      text: emailText,
      html: emailHtml,
    });

    console.log('Payment instructions email sent to:', to);
    console.log('CC sent to: dewayne.thomas2011@gmail.com, bstitt@mjoandco.com');

    return NextResponse.json({
      success: true,
      message: 'Payment instructions email sent successfully'
    });

  } catch (error) {
    console.error('Error sending payment instructions email:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
