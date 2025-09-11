import { NextRequest, NextResponse } from 'next/server';
import { generateProfileQRCode, generateContactQRCode } from '@/lib/qr-generator';
import { COLLECTIONS } from '@/lib/firestore-schema';

export async function POST(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const { profileId } = params;
    const body = await request.json();
    const { qrType = 'profile' } = body;

    // Get user profile
    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, profileId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileData = profileSnap.data();
    let qrCodeDataUrl: string;

    // Generate QR code based on type
    switch (qrType) {
      case 'profile':
        qrCodeDataUrl = await generateProfileQRCode(profileId);
        break;
      case 'contact':
        qrCodeDataUrl = await generateContactQRCode(
          profileData.firstName,
          profileData.lastName,
          profileData.phone,
          profileData.email
        );
        break;
      default:
        return NextResponse.json({ error: 'Invalid QR code type' }, { status: 400 });
    }

    // Update profile with QR code data
    const qrCodeData = {
      [`qrCode${qrType.charAt(0).toUpperCase() + qrType.slice(1)}`]: qrCodeDataUrl,
      updatedAt: serverTimestamp()
    };

    await updateDoc(profileRef, qrCodeData);

    return NextResponse.json({
      success: true,
      qrCodeDataUrl,
      qrType
    });

  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'QR code generation failed'
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    const { db } = await import('@/lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { doc, getDoc } = await import('firebase/firestore');
    const { profileId } = params;

    // Get user profile
    const profileRef = doc(db, COLLECTIONS.USER_PROFILES, profileId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileData = profileSnap.data();

    return NextResponse.json({
      success: true,
      qrCodes: {
        profile: profileData.qrCodeProfile || null,
        contact: profileData.qrCodeContact || null
      }
    });

  } catch (error) {
    console.error('QR code retrieval error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'QR code retrieval failed'
    }, { status: 500 });
  }
}
