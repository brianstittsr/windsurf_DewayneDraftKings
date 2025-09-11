import { jsPDF } from 'jspdf';
import { RegistrationData } from './firestore-schema';

export interface PDFGenerationOptions {
  includeWaiver?: boolean;
  includeLogo?: boolean;
  headerColor?: string;
}

export class RegistrationPDFGenerator {
  private doc: jsPDF;
  private yPosition: number = 20;
  private pageHeight: number = 280;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
  }

  generateRegistrationPDF(
    registrationData: RegistrationData,
    options: PDFGenerationOptions = {}
  ): Promise<Uint8Array> {
    return new Promise((resolve) => {
      this.doc = new jsPDF();
      this.yPosition = 20;

      // Header
      this.addHeader(options);
      
      // Registration Information
      this.addPersonalInformation(registrationData);
      this.addRoleSpecificInformation(registrationData);
      this.addEmergencyContact(registrationData);
      
      if (registrationData.selectedPlan) {
        this.addPlanInformation(registrationData.selectedPlan);
      }
      
      if (options.includeWaiver && registrationData.waiverAccepted) {
        this.addWaiverInformation(registrationData);
      }
      
      // Footer
      this.addFooter();
      
      // Convert to Uint8Array
      const pdfOutput = this.doc.output('arraybuffer');
      resolve(new Uint8Array(pdfOutput));
    });
  }

  private addHeader(options: PDFGenerationOptions) {
    const headerColor = options.headerColor || '#1f2937';
    
    // Set header background
    this.doc.setFillColor(headerColor);
    this.doc.rect(0, 0, 210, 30, 'F');
    
    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('All Pro Sports Registration', this.margin, 15);
    
    // Subtitle
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Registration Confirmation Document', this.margin, 22);
    
    // Reset text color and position
    this.doc.setTextColor(0, 0, 0);
    this.yPosition = 40;
  }

  private addPersonalInformation(data: RegistrationData) {
    this.addSectionTitle('Personal Information');
    
    const personalInfo = [
      ['Name:', `${data.firstName} ${data.lastName}`],
      ['Email:', data.email],
      ['Phone:', data.phone],
      ['Date of Birth:', data.dateOfBirth],
      ['Role:', data.role === 'player' ? 'Player' : 'Coach'],
      ['Jersey Size:', data.jerseySize]
    ];
    
    this.addInfoTable(personalInfo);
  }

  private addRoleSpecificInformation(data: RegistrationData) {
    if (data.role === 'player') {
      this.addSectionTitle('Player Information');
      
      const playerInfo = [
        ['Position:', data.position || 'Not specified'],
        ['Player Status:', data.playerTag || 'Not specified']
      ];
      
      this.addInfoTable(playerInfo);
    } else if (data.role === 'coach') {
      this.addSectionTitle('Coach Information');
      
      const coachInfo = [
        ['Experience:', data.experience || 'Not specified'],
        ['Coaching Level:', data.coachingLevel || 'Not specified'],
        ['Certifications:', data.certifications || 'None listed'],
        ['Specialties:', data.specialties || 'None listed'],
        ['Max Teams:', data.maxTeams?.toString() || 'Not specified']
      ];
      
      this.addInfoTable(coachInfo);
    }
  }

  private addEmergencyContact(data: RegistrationData) {
    if (data.emergencyContactName || data.emergencyContactPhone) {
      this.addSectionTitle('Emergency Contact');
      
      const emergencyInfo = [
        ['Name:', data.emergencyContactName || 'Not provided'],
        ['Phone:', data.emergencyContactPhone || 'Not provided']
      ];
      
      this.addInfoTable(emergencyInfo);
    }
  }

  private addPlanInformation(plan: any) {
    this.addSectionTitle('Selected Plan');
    
    const planInfo = [
      ['Plan Name:', plan.title || 'Not specified'],
      ['Plan Type:', plan.itemType || 'Not specified'],
      ['Price:', plan.pricing?.finalAmount ? `$${plan.pricing.finalAmount.toFixed(2)}` : plan.price ? `$${plan.price.toFixed(2)}` : 'Not specified']
    ];
    
    if (plan.appliedCoupon) {
      planInfo.push(['Coupon Applied:', plan.appliedCoupon.code]);
      planInfo.push(['Discount:', `$${plan.pricing?.discount?.toFixed(2) || '0.00'}`]);
    }
    
    this.addInfoTable(planInfo);
  }

  private addWaiverInformation(data: RegistrationData) {
    this.addSectionTitle('Waiver & Release of Liability');
    
    const waiverInfo = [
      ['Waiver Accepted:', data.waiverAccepted ? 'Yes' : 'No'],
      ['Parent/Guardian Name:', data.parentGuardianName || 'Not provided'],
      ['Digital Signature:', data.parentGuardianSignature || 'Not provided'],
      ['Signature Date:', data.waiverSignatureDate || 'Not provided']
    ];
    
    this.addInfoTable(waiverInfo);
    
    // Add waiver text summary
    this.checkPageBreak(30);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('By signing this document, the participant acknowledges understanding and acceptance', this.margin, this.yPosition);
    this.yPosition += 5;
    this.doc.text('of all risks associated with participation in All Pro Sports activities.', this.margin, this.yPosition);
    this.yPosition += 10;
  }

  private addSectionTitle(title: string) {
    this.checkPageBreak(15);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55); // Gray-800
    this.doc.text(title, this.margin, this.yPosition);
    
    // Add underline
    this.doc.setDrawColor(59, 130, 246); // Blue-500
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.yPosition + 2, this.margin + this.doc.getTextWidth(title), this.yPosition + 2);
    
    this.yPosition += 10;
    this.doc.setTextColor(0, 0, 0);
  }

  private addInfoTable(data: string[][]) {
    this.doc.setFontSize(10);
    
    data.forEach(([label, value]) => {
      this.checkPageBreak(8);
      
      // Label
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, this.margin, this.yPosition);
      
      // Value
      this.doc.setFont('helvetica', 'normal');
      const labelWidth = this.doc.getTextWidth(label);
      this.doc.text(value, this.margin + labelWidth + 5, this.yPosition);
      
      this.yPosition += 6;
    });
    
    this.yPosition += 5; // Extra spacing after table
  }

  private addFooter() {
    const footerY = this.pageHeight + 10;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500
    
    // Left side - generation info
    const generatedText = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    this.doc.text(generatedText, this.margin, footerY);
    
    // Right side - page number
    const pageText = `Page ${this.doc.getCurrentPageInfo().pageNumber}`;
    const pageWidth = this.doc.internal.pageSize.getWidth();
    this.doc.text(pageText, pageWidth - this.margin - this.doc.getTextWidth(pageText), footerY);
    
    // Center - contact info
    const contactText = 'All Pro Sports | support@allprosports.com | (123) 456-7890';
    const contactWidth = this.doc.getTextWidth(contactText);
    this.doc.text(contactText, (pageWidth - contactWidth) / 2, footerY);
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.yPosition + requiredSpace > this.pageHeight) {
      this.doc.addPage();
      this.yPosition = 20;
    }
  }
}

// Utility function to generate PDF from registration data
export async function generateRegistrationPDF(
  registrationData: RegistrationData,
  options?: PDFGenerationOptions
): Promise<Uint8Array> {
  const generator = new RegistrationPDFGenerator();
  return generator.generateRegistrationPDF(registrationData, options);
}
