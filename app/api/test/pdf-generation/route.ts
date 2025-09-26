import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Import PDF generator
    const { RegistrationPDFGenerator } = await import('../../../../lib/pdf-generator');
    const { Timestamp } = await import('firebase/firestore');
    
    // Create registration data for PDF
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
    
    // Generate PDF
    const pdfGenerator = new RegistrationPDFGenerator();
    const pdfBuffer = await pdfGenerator.generateRegistrationPDF(registrationData, {
      includeWaiver: true,
      includeLogo: true,
      headerColor: '#0066cc'
    });
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="test-registration-${data.firstName}-${data.lastName}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });
    
  } catch (error) {
    console.error('PDF generation test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
