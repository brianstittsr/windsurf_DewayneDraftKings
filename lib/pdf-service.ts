// PDF Generation Service for Registration Forms
import { jsPDF } from 'jspdf';

interface RegistrationData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  
  // Role-Specific Information
  role: 'player' | 'coach';
  jerseySize?: string;
  position?: string;
  experience?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  // Medical Information
  medicalConditions?: string;
  medications?: string;
  allergies?: string;
  
  // Preferences & Agreements
  preferredCommunication?: string;
  marketingConsent?: boolean;
  waiverAccepted?: boolean;
  termsAccepted?: boolean;
  
  // Plan Information
  selectedPlan?: {
    title: string;
    price: number;
    serviceFee?: number;
    totalPrice: number;
    category: string;
  };
  
  // Registration Details
  registrationDate: Date;
  playerId: string;
}

export class PDFService {
  static generateRegistrationPDF(data: RegistrationData): string {
    const doc = new jsPDF();
    let yPosition = 20;
    const lineHeight = 8;
    const sectionSpacing = 15;

    // Helper function to add text with automatic line breaks
    const addText = (text: string, x: number = 20, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, x, yPosition);
      yPosition += lines.length * lineHeight;
    };

    const addSection = (title: string) => {
      yPosition += sectionSpacing;
      addText(title, 20, 14, true);
      yPosition += 5;
    };

    // Header
    doc.setFillColor(40, 167, 69); // Bootstrap success color
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    addText('ALL PRO SPORTS NC', 20, 18, true);
    yPosition = 35;
    doc.setTextColor(0, 0, 0);
    addText('REGISTRATION FORM', 20, 16, true);
    yPosition += 10;

    // Registration Details
    addSection('REGISTRATION INFORMATION');
    addText(`Registration ID: ${data.playerId}`);
    addText(`Registration Date: ${data.registrationDate.toLocaleDateString()}`);
    addText(`Registration Time: ${data.registrationDate.toLocaleTimeString()}`);

    // Personal Information
    addSection('PERSONAL INFORMATION');
    addText(`Name: ${data.firstName} ${data.lastName}`);
    addText(`Email: ${data.email}`);
    addText(`Phone: ${data.phone}`);
    if (data.dateOfBirth) {
      addText(`Date of Birth: ${data.dateOfBirth}`);
    }
    addText(`Role: ${data.role.charAt(0).toUpperCase() + data.role.slice(1)}`);

    // Role-Specific Information
    if (data.position || data.experience || data.jerseySize) {
      addSection('ROLE-SPECIFIC DETAILS');
      if (data.position) addText(`Position: ${data.position}`);
      if (data.experience) addText(`Experience: ${data.experience}`);
      if (data.jerseySize) addText(`Jersey Size: ${data.jerseySize}`);
    }

    // Emergency Contact
    if (data.emergencyContactName) {
      addSection('EMERGENCY CONTACT');
      addText(`Name: ${data.emergencyContactName}`);
      if (data.emergencyContactPhone) addText(`Phone: ${data.emergencyContactPhone}`);
      if (data.emergencyContactRelation) addText(`Relation: ${data.emergencyContactRelation}`);
    }

    // Medical Information
    if (data.medicalConditions || data.medications || data.allergies) {
      addSection('MEDICAL INFORMATION');
      if (data.medicalConditions) addText(`Medical Conditions: ${data.medicalConditions}`);
      if (data.medications) addText(`Medications: ${data.medications}`);
      if (data.allergies) addText(`Allergies: ${data.allergies}`);
    }

    // Plan Information
    if (data.selectedPlan) {
      addSection('SELECTED PLAN');
      addText(`Plan: ${data.selectedPlan.title}`);
      addText(`Category: ${data.selectedPlan.category}`);
      addText(`Base Price: $${data.selectedPlan.price.toFixed(2)}`);
      if (data.selectedPlan.serviceFee && data.selectedPlan.serviceFee > 0) {
        addText(`Service Fee: $${data.selectedPlan.serviceFee.toFixed(2)}`);
      }
      addText(`Total Price: $${data.selectedPlan.totalPrice.toFixed(2)}`, 20, 10, true);
    }

    // Preferences
    addSection('PREFERENCES & COMMUNICATION');
    if (data.preferredCommunication) addText(`Preferred Communication: ${data.preferredCommunication}`);
    addText(`Marketing Consent: ${data.marketingConsent ? 'Yes' : 'No'}`);

    // Agreements
    addSection('AGREEMENTS & WAIVERS');
    addText(`Waiver Accepted: ${data.waiverAccepted ? 'Yes' : 'No'}`, 20, 10, true);
    addText(`Terms & Conditions Accepted: ${data.termsAccepted ? 'Yes' : 'No'}`, 20, 10, true);

    // Add new page if needed for waiver text
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Waiver Text
    addSection('LIABILITY WAIVER');
    const waiverText = `I understand that participation in All Pro Sports NC activities involves inherent risks of injury. I voluntarily assume all risks associated with participation and agree to hold harmless All Pro Sports NC, its employees, volunteers, and agents from any claims, damages, or injuries that may occur during participation. I acknowledge that I have read and understood this waiver and agree to its terms.

By signing this registration form, I confirm that all information provided is accurate and complete. I understand that false information may result in disqualification from participation.

This registration serves as my electronic signature and agreement to all terms and conditions.`;

    doc.setFontSize(9);
    const waiverLines = doc.splitTextToSize(waiverText, 170);
    doc.text(waiverLines, 20, yPosition);
    yPosition += waiverLines.length * 6;

    // Footer
    yPosition += 20;
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFillColor(248, 249, 250); // Light gray
    doc.rect(0, yPosition, 210, 25, 'F');
    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text('All Pro Sports NC - Professional Youth Sports Development', 20, yPosition);
    doc.text('Contact: info@allprosportsnc.com | Visit: All Pro Sports Complex', 20, yPosition + 8);

    // Return PDF as base64 string
    return doc.output('datauristring');
  }

  static async uploadPDFToStorage(pdfData: string, fileName: string): Promise<string> {
    try {
      // For now, we'll store the PDF as base64 in Firebase
      // In a production environment, you might want to use Firebase Storage or AWS S3
      return pdfData;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw new Error('Failed to upload PDF');
    }
  }

  static generateFileName(data: RegistrationData): string {
    const date = data.registrationDate.toISOString().split('T')[0];
    const name = `${data.firstName}_${data.lastName}`.replace(/[^a-zA-Z0-9]/g, '_');
    return `registration_${name}_${data.playerId}_${date}.pdf`;
  }
}
