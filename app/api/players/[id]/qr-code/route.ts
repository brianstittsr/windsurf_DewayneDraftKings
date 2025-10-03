import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

// GET /api/players/[id]/qr-code - Get or generate QR code for player
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: playerId } = params;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const { db } = await import('../../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 503 });
    }

    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    
    // Get player document
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);
    
    if (!playerSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Player not found'
      }, { status: 404 });
    }

    const playerData = playerSnap.data();
    
    // Check if QR code already exists
    if (playerData.qrCode) {
      return NextResponse.json({
        success: true,
        qrCode: playerData.qrCode,
        qrCodeUrl: playerData.qrCodeUrl
      });
    }

    // Generate new QR code
    const qrCodeUrl = `${baseUrl}/player/${playerId}`;
    
    const qrData = JSON.stringify({
      playerId,
      name: `${playerData.firstName} ${playerData.lastName}`,
      team: playerData.teamId || 'Unassigned',
      jersey: playerData.jerseyNumber || 'TBD',
      verified: true,
      url: qrCodeUrl
    });

    // Generate QR code as base64 data URL
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    // Update player document with QR code
    await updateDoc(playerRef, {
      qrCode: qrCodeImage,
      qrCodeUrl: qrCodeUrl,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeImage,
      qrCodeUrl: qrCodeUrl
    });

  } catch (error: any) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate QR code',
      details: error.message
    }, { status: 500 });
  }
}

// POST /api/players/[id]/qr-code - Regenerate QR code
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: playerId } = params;
    const { customUrl } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const { db } = await import('../../../../../lib/firebase').catch(() => ({ db: null }));
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 503 });
    }

    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    
    // Get player document
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);
    
    if (!playerSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Player not found'
      }, { status: 404 });
    }

    const playerData = playerSnap.data();
    
    // Use custom URL if provided, otherwise use default
    const qrCodeUrl = customUrl || `${baseUrl}/player/${playerId}`;
    
    const qrData = JSON.stringify({
      playerId,
      name: `${playerData.firstName} ${playerData.lastName}`,
      team: playerData.teamId || 'Unassigned',
      jersey: playerData.jerseyNumber || 'TBD',
      verified: true,
      url: qrCodeUrl,
      regenerated: new Date().toISOString()
    });

    // Generate new QR code
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    // Update player document
    await updateDoc(playerRef, {
      qrCode: qrCodeImage,
      qrCodeUrl: qrCodeUrl,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeImage,
      qrCodeUrl: qrCodeUrl,
      message: 'QR code regenerated successfully'
    });

  } catch (error: any) {
    console.error('Error regenerating QR code:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to regenerate QR code',
      details: error.message
    }, { status: 500 });
  }
}
