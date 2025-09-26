import { EmailService } from './email-service';
import { QRCodeGenerator } from './qr-generator';
import { RegistrationPDFGenerator } from './pdf-generator';
import { db } from './firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

export interface RegistrationCompletionData {
  playerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'player' | 'coach';
  selectedPlan?: any;
  registrationData?: any;
}

export class RegistrationCompletionService {
  private emailService: EmailService;
  private pdfGenerator: RegistrationPDFGenerator;

  constructor() {
    this.emailService = new EmailService();
    this.pdfGenerator = new RegistrationPDFGenerator();
  }

  async completeRegistration(data: RegistrationCompletionData): Promise<{
    success: boolean;
    qrCodes?: { profile: string; contact: string };
    pdfUrl?: string;
    error?: string;
  }> {
    try {
      console.log('Starting registration completion for:', data.playerId);

      // 1. Generate QR Codes
      const qrCodes = await this.generateQRCodes(data);
      console.log('QR codes generated successfully');

      // 2. Generate PDF
      const pdfBuffer = await this.generateRegistrationPDF(data);
      console.log('PDF generated successfully');

      // 3. Store QR codes and PDF in user profile
      await this.updateUserProfile(data.playerId, data.role, qrCodes, pdfBuffer);
      console.log('User profile updated with QR codes and PDF');

      // 4. Send confirmation email with QR codes
      await this.sendConfirmationEmail(data, qrCodes);
      console.log('Confirmation email sent successfully');

      return {
        success: true,
        qrCodes,
        pdfUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/user-profiles/${data.playerId}/pdf`
      };

    } catch (error) {
      console.error('Registration completion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async generateQRCodes(data: RegistrationCompletionData): Promise<{
    profile: string;
    contact: string;
  }> {
    const [profileQR, contactQR] = await Promise.all([
      QRCodeGenerator.generateUserProfileQR(data.playerId),
      QRCodeGenerator.generateContactQR(
        data.firstName,
        data.lastName,
        data.phone,
        data.email
      )
    ]);

    return {
      profile: profileQR,
      contact: contactQR
    };
  }

  private async generateRegistrationPDF(data: RegistrationCompletionData): Promise<Uint8Array> {
    const registrationData = {
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      dateOfBirth: data.registrationData?.dateOfBirth || '',
      position: data.registrationData?.position || '',
      jerseySize: data.registrationData?.jerseySize || '',
      emergencyContactName: data.registrationData?.emergencyContactName || '',
      emergencyContactPhone: data.registrationData?.emergencyContactPhone || '',
      selectedPlan: data.selectedPlan,
      waiverAccepted: true,
      submittedAt: Timestamp.now()
    };

    return await this.pdfGenerator.generateRegistrationPDF(registrationData, {
      includeWaiver: true,
      includeLogo: true,
      headerColor: '#0066cc'
    });
  }

  private async updateUserProfile(
    playerId: string,
    role: 'player' | 'coach',
    qrCodes: { profile: string; contact: string },
    pdfBuffer: Uint8Array
  ): Promise<void> {
    try {
      const collectionName = role === 'coach' ? 'coaches' : 'players';
      const userRef = doc(db, collectionName, playerId);

      // Convert PDF buffer to base64 for storage
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

      await updateDoc(userRef, {
        qrCodeUrl: qrCodes.profile,
        qrCodeData: qrCodes.profile,
        contactQRCode: qrCodes.contact,
        registrationPdfUrl: `data:application/pdf;base64,${pdfBase64}`,
        registrationPdfGenerated: true,
        completionEmailSent: false, // Will be updated after email is sent
        updatedAt: Timestamp.now()
      });

    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile with QR codes and PDF');
    }
  }

  private async sendConfirmationEmail(
    data: RegistrationCompletionData,
    qrCodes: { profile: string; contact: string }
  ): Promise<void> {
    try {
      const subject = `Welcome to All Pro Sports NC - Registration Confirmed!`;
      
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
            .header { background: linear-gradient(135deg, #0066cc, #004499); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .qr-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .qr-code { max-width: 200px; height: auto; margin: 10px; }
            .plan-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
            .btn { display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏈 Welcome to All Pro Sports NC!</h1>
              <p>Registration Confirmed</p>
            </div>
            
            <div class="content">
              <h2>Hello ${data.firstName} ${data.lastName}!</h2>
              
              <p>Congratulations! Your registration has been successfully completed and your payment has been processed.</p>
              
              ${data.selectedPlan ? `
                <div class="plan-info">
                  <h3>📋 Your Registration Details</h3>
                  <p><strong>Plan:</strong> ${data.selectedPlan.title}</p>
                  <p><strong>Amount Paid:</strong> $${data.selectedPlan.total?.toFixed(2) || data.selectedPlan.price?.toFixed(2)}</p>
                  <p><strong>Role:</strong> ${data.role.charAt(0).toUpperCase() + data.role.slice(1)}</p>
                </div>
              ` : ''}
              
              <div class="qr-section">
                <h3>📱 Your QR Codes</h3>
                <p>Use these QR codes for quick access to your information:</p>
                
                <div style="display: inline-block; margin: 10px;">
                  <h4>Profile QR Code</h4>
                  <img src="${qrCodes.profile}" alt="Profile QR Code" class="qr-code">
                  <p><small>Scan to view your profile</small></p>
                </div>
                
                <div style="display: inline-block; margin: 10px;">
                  <h4>Contact QR Code</h4>
                  <img src="${qrCodes.contact}" alt="Contact QR Code" class="qr-code">
                  <p><small>Scan to save your contact info</small></p>
                </div>
              </div>
              
              <h3>📄 Important Documents</h3>
              <p>Your registration forms and waiver have been generated and are available in your profile. You can access them anytime through your account.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile/${data.playerId}" class="btn">View Your Profile</a>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile/${data.playerId}/pdf" class="btn">Download Registration PDF</a>
              </div>
              
              <h3>🎯 What's Next?</h3>
              <ul>
                <li>Check your email for additional information about upcoming events</li>
                <li>Join our team communications (details will be sent separately)</li>
                <li>Attend the orientation session (date and time will be announced)</li>
                <li>Bring your registration confirmation to the first practice</li>
              </ul>
              
              <h3>📞 Need Help?</h3>
              <p>If you have any questions or need assistance, please don't hesitate to contact us:</p>
              <ul>
                <li>Email: info@allprosportsnc.com</li>
                <li>Phone: (919) 123-4567</li>
                <li>Website: www.allprosportsnc.com</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>Thank you for joining All Pro Sports NC!</p>
              <p><small>This is an automated message. Please do not reply to this email.</small></p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.emailService.sendEmail({
        to: data.email,
        subject,
        html
      });

      // Update user profile to mark email as sent
      const collectionName = data.role === 'coach' ? 'coaches' : 'players';
      const userRef = doc(db, collectionName, data.playerId);
      await updateDoc(userRef, {
        completionEmailSent: true,
        completionEmailSentAt: Timestamp.now()
      });

    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw new Error('Failed to send confirmation email');
    }
  }
}

// Utility function for easy use
export async function completeUserRegistration(data: RegistrationCompletionData) {
  const service = new RegistrationCompletionService();
  return await service.completeRegistration(data);
}
