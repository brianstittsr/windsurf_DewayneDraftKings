import nodemailer from 'nodemailer';
import { RegistrationData } from './firestore-schema';
import { generateRegistrationPDF } from './pdf-generator';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | Uint8Array;
  contentType: string;
}

export class EmailPDFService {
  private transporter: nodemailer.Transporter;

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransporter(config);
  }

  async sendRegistrationConfirmation(
    registrationData: RegistrationData,
    recipientEmail: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Generate PDF
      const pdfBuffer = await generateRegistrationPDF(registrationData, {
        includeWaiver: true,
        includeLogo: true,
        headerColor: '#1f2937'
      });

      // Prepare email content
      const emailContent = this.generateEmailContent(registrationData);
      
      // Create attachment
      const attachment: EmailAttachment = {
        filename: `AllProSports_Registration_${registrationData.firstName}_${registrationData.lastName}.pdf`,
        content: Buffer.from(pdfBuffer),
        contentType: 'application/pdf'
      };

      // Send email
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@allprosports.com',
        to: recipientEmail,
        subject: 'All Pro Sports Registration Confirmation',
        html: emailContent.html,
        text: emailContent.text,
        attachments: [attachment]
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateEmailContent(data: RegistrationData): { html: string; text: string } {
    const playerName = `${data.firstName} ${data.lastName}`;
    const role = data.role === 'player' ? 'Player' : 'Coach';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #3b82f6; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .highlight { color: #059669; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏈 Welcome to All Pro Sports!</h1>
            <p>Registration Confirmation</p>
          </div>
          
          <div class="content">
            <h2>Hello ${playerName}!</h2>
            
            <p>Congratulations! Your registration as a <strong>${role}</strong> has been successfully processed. We're excited to have you join the All Pro Sports community!</p>
            
            <div class="info-box">
              <h3>📋 Registration Details</h3>
              <ul>
                <li><strong>Name:</strong> ${playerName}</li>
                <li><strong>Email:</strong> ${data.email}</li>
                <li><strong>Phone:</strong> ${data.phone}</li>
                <li><strong>Role:</strong> ${role}</li>
                ${data.jerseySize ? `<li><strong>Jersey Size:</strong> ${data.jerseySize}</li>` : ''}
                ${data.position ? `<li><strong>Position:</strong> ${data.position}</li>` : ''}
                ${data.selectedPlan ? `<li><strong>Selected Plan:</strong> ${data.selectedPlan.title}</li>` : ''}
              </ul>
            </div>
            
            ${data.emergencyContactName ? `
            <div class="info-box">
              <h3>🚨 Emergency Contact</h3>
              <p><strong>${data.emergencyContactName}</strong><br>
              ${data.emergencyContactPhone}</p>
            </div>
            ` : ''}
            
            <div class="info-box">
              <h3>📄 Important Documents</h3>
              <p>Please find your complete registration information attached as a PDF. This document contains all the details you provided during registration${data.waiverAccepted ? ', including your signed waiver and release of liability' : ''}.</p>
              <p class="highlight">Please keep this document for your records.</p>
            </div>
            
            <div class="info-box">
              <h3>🎯 What's Next?</h3>
              <ul>
                <li>You'll receive league schedules and team assignments soon</li>
                <li>Check your email regularly for important updates</li>
                <li>Join our community and connect with other players</li>
                <li>Prepare for an amazing season ahead!</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Welcome to the team!<br>
            <strong>The All Pro Sports Team</strong></p>
          </div>
          
          <div class="footer">
            <p>📧 <strong>Email:</strong> support@allprosports.com | 📞 <strong>Phone:</strong> (123) 456-7890</p>
            <p>All Pro Sports - Building Champions On and Off the Field</p>
            <p><small>This email was sent automatically. Please do not reply to this email.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to All Pro Sports!

Hello ${playerName}!

Congratulations! Your registration as a ${role} has been successfully processed. We're excited to have you join the All Pro Sports community!

Registration Details:
- Name: ${playerName}
- Email: ${data.email}
- Phone: ${data.phone}
- Role: ${role}
${data.jerseySize ? `- Jersey Size: ${data.jerseySize}` : ''}
${data.position ? `- Position: ${data.position}` : ''}
${data.selectedPlan ? `- Selected Plan: ${data.selectedPlan.title}` : ''}

${data.emergencyContactName ? `
Emergency Contact:
${data.emergencyContactName}
${data.emergencyContactPhone}
` : ''}

Important Documents:
Please find your complete registration information attached as a PDF. This document contains all the details you provided during registration${data.waiverAccepted ? ', including your signed waiver and release of liability' : ''}.

Please keep this document for your records.

What's Next?
- You'll receive league schedules and team assignments soon
- Check your email regularly for important updates
- Join our community and connect with other players
- Prepare for an amazing season ahead!

If you have any questions or need assistance, please don't hesitate to contact our support team.

Welcome to the team!
The All Pro Sports Team

Contact Information:
Email: support@allprosports.com
Phone: (123) 456-7890

All Pro Sports - Building Champions On and Off the Field
    `;

    return { html, text };
  }
}

// Utility function to send registration email
export async function sendRegistrationEmail(
  registrationData: RegistrationData,
  recipientEmail: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const emailConfig: EmailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  };

  const emailService = new EmailPDFService(emailConfig);
  return emailService.sendRegistrationConfirmation(registrationData, recipientEmail);
}
