import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter based on environment variables
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: options.from || process.env.SMTP_FROM || '"All Pro Sports NC" <noreply@allprosportsnc.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Welcome to All Pro Sports NC!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">Welcome to All Pro Sports NC!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with All Pro Sports NC. We're excited to have you join our community!</p>
        <p>Your registration has been received and we'll be in touch with more details about upcoming events and activities.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The All Pro Sports NC Team</p>
        <hr style="border: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          All Pro Sports NC<br>
          North Carolina<br>
          Email: info@allprosportsnc.com
        </p>
      </div>
    `;

    await this.sendEmail({
      to,
      subject,
      html,
    });
  }

  async sendPaymentConfirmation(to: string, name: string, amount: number, planName: string): Promise<void> {
    const subject = 'Payment Confirmation - All Pro Sports NC';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">Payment Confirmation</h2>
        <p>Hi ${name},</p>
        <p>Thank you for your payment! We've successfully processed your registration payment.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details:</h3>
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Status:</strong> Paid</p>
        </div>
        <p>You're all set! We'll send you more information about your registration soon.</p>
        <p>Best regards,<br>The All Pro Sports NC Team</p>
        <hr style="border: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          All Pro Sports NC<br>
          North Carolina<br>
          Email: info@allprosportsnc.com
        </p>
      </div>
    `;

    await this.sendEmail({
      to,
      subject,
      html,
    });
  }

  async sendTestEmail(to: string): Promise<void> {
    const subject = 'Test from All Pro Sports';
    const text = 'Email is now sending from All Pro Sports NC website!';
    
    await this.sendEmail({
      to,
      subject,
      text,
    });
  }

  // Verify email configuration
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
