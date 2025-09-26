import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    const { profileId } = params;

    if (!profileId) {
      return NextResponse.json({
        success: false,
        error: 'Profile ID is required'
      }, { status: 400 });
    }

    // Dynamic import to avoid build issues
    const { db } = await import('../../../../../lib/firebase').catch(() => ({ db: null }));

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database connection unavailable'
      }, { status: 503 });
    }

    const { doc, getDoc } = await import('firebase/firestore');

    try {
      // Try to find the profile in both players and coaches collections
      let profileDoc = await getDoc(doc(db, 'players', profileId));
      
      if (!profileDoc.exists()) {
        profileDoc = await getDoc(doc(db, 'coaches', profileId));
      }

      if (!profileDoc.exists()) {
        return NextResponse.json({
          success: false,
          error: 'Profile not found'
        }, { status: 404 });
      }

      const profileData = profileDoc.data();
      const pdfUrl = profileData.registrationPdfUrl;

      if (!pdfUrl) {
        return NextResponse.json({
          success: false,
          error: 'PDF not available for this profile'
        }, { status: 404 });
      }

      // If it's a base64 data URL, convert it to a buffer
      if (pdfUrl.startsWith('data:application/pdf;base64,')) {
        const base64Data = pdfUrl.replace('data:application/pdf;base64,', '');
        const pdfBuffer = Buffer.from(base64Data, 'base64');

        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="registration-${profileData.firstName}-${profileData.lastName}.pdf"`,
            'Content-Length': pdfBuffer.length.toString()
          }
        });
      } else {
        // If it's a URL, redirect to it
        return NextResponse.redirect(pdfUrl);
      }

    } catch (firebaseError) {
      console.error('Firebase query error:', firebaseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve profile data'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('PDF retrieval error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
