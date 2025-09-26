import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { profileId, firstName, lastName, phone, email } = await request.json();
    
    // Import QR code generator
    const { QRCodeGenerator } = await import('../../../../lib/qr-generator');
    
    // Generate QR codes
    const [profileQR, contactQR] = await Promise.all([
      QRCodeGenerator.generateUserProfileQR(profileId),
      QRCodeGenerator.generateContactQR(firstName, lastName, phone, email)
    ]);
    
    return NextResponse.json({
      success: true,
      qrCodes: {
        profile: profileQR,
        contact: contactQR
      }
    });
    
  } catch (error) {
    console.error('QR code test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
