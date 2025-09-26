import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    const { profileId } = params;
    
    // Dynamic import to avoid build issues
    const { db } = await import('../../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Firebase connection unavailable'
      }, { status: 503 });
    }
    
    const { doc, getDoc } = await import('firebase/firestore');
    
    // Try to find the profile in both collections
    let profileDoc = await getDoc(doc(db, 'players', profileId));
    let collection = 'players';
    
    if (!profileDoc.exists()) {
      profileDoc = await getDoc(doc(db, 'coaches', profileId));
      collection = 'coaches';
    }
    
    if (!profileDoc.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Profile not found',
        profileId,
        searchedCollections: ['players', 'coaches']
      });
    }
    
    const profileData = profileDoc.data();
    
    // Check what data is stored
    const result = {
      success: true,
      profileId,
      collection,
      profile: {
        exists: true,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        createdAt: profileData.createdAt?.toDate?.()?.toISOString() || null
      },
      qrCodes: {
        profileQR: !!profileData.qrCodeUrl,
        contactQR: !!profileData.contactQRCode,
        qrCodeData: !!profileData.qrCodeData
      },
      pdf: {
        pdfUrl: !!profileData.registrationPdfUrl,
        pdfGenerated: !!profileData.registrationPdfGenerated
      },
      email: {
        completionEmailSent: !!profileData.completionEmailSent,
        completionEmailSentAt: profileData.completionEmailSentAt?.toDate?.()?.toISOString() || null
      },
      rawData: {
        hasQrCodeUrl: !!profileData.qrCodeUrl,
        hasContactQRCode: !!profileData.contactQRCode,
        hasRegistrationPdfUrl: !!profileData.registrationPdfUrl,
        completionEmailSent: profileData.completionEmailSent,
        registrationPdfGenerated: profileData.registrationPdfGenerated
      }
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Firebase storage test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
