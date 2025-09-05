import { NextRequest, NextResponse } from 'next/server';
import QRCodeService from '@/lib/qr-code-service';

export async function POST(request: NextRequest) {
  try {
    const { type, entityId, entityName } = await request.json();

    if (!type || !entityId || !entityName) {
      return NextResponse.json(
        { error: 'Missing required fields: type, entityId, entityName' },
        { status: 400 }
      );
    }

    let qrData;

    switch (type) {
      case 'team':
        qrData = await QRCodeService.createTeamQRCode(entityId, entityName);
        break;
      case 'league':
        qrData = await QRCodeService.createLeagueQRCode();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid QR code type. Must be "team" or "league"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${type} QR code generated successfully`,
      qrData
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
