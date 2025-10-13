import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export class QRCodeGenerator {
  static async generateQRCode(
    data: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const defaultOptions = {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const
    };

    const qrOptions = { ...defaultOptions, ...options };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, qrOptions);
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static async generateUserProfileQR(
    profileId: string,
    baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  ): Promise<string> {
    const profileUrl = `${baseUrl}/profile/${profileId}`;
    
    return this.generateQRCode(profileUrl, {
      width: 300,
      margin: 3,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
  }

  static async generateContactQR(
    firstName: string,
    lastName: string,
    phone: string,
    email?: string
  ): Promise<string> {
    // Generate vCard format for contact information
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${firstName} ${lastName}`,
      `N:${lastName};${firstName};;;`,
      `TEL:${phone}`,
      email ? `EMAIL:${email}` : '',
      'ORG:All Pro Sports',
      'END:VCARD'
    ].filter(line => line !== '').join('\n');

    return this.generateQRCode(vCard, {
      width: 300,
      margin: 3,
      errorCorrectionLevel: 'H'
    });
  }

  static async generateEventQR(
    eventData: {
      title: string;
      date: string;
      location?: string;
      description?: string;
    }
  ): Promise<string> {
    const eventInfo = JSON.stringify(eventData);
    
    return this.generateQRCode(eventInfo, {
      width: 256,
      margin: 2,
      errorCorrectionLevel: 'M'
    });
  }

  static async generateJerseyQR(
    playerId: string,
    jerseyNumber: number,
    teamName: string,
    baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  ): Promise<string> {
    const jerseyUrl = `${baseUrl}/jersey/${playerId}/${jerseyNumber}`;

    // Create a more compact QR code for jerseys
    return this.generateQRCode(jerseyUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // High error correction for jerseys
    });
  }

  static async generateJerseyQRWithData(
    playerId: string,
    jerseyNumber: number,
    teamName: string,
    playerName: string,
    baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  ): Promise<{ qrCode: string; url: string; data: any }> {
    const qrCode = await this.generateJerseyQR(playerId, jerseyNumber, teamName, baseUrl);
    const url = `${baseUrl}/jersey/${playerId}/${jerseyNumber}`;

    const data = {
      type: 'jersey',
      playerId,
      jerseyNumber,
      teamName,
      playerName,
      generatedAt: new Date().toISOString()
    };

    return { qrCode, url, data };
  }
}

// Utility functions
export async function generateProfileQRCode(
  profileId: string,
  baseUrl?: string
): Promise<string> {
  return QRCodeGenerator.generateUserProfileQR(profileId, baseUrl);
}

export async function generateContactQRCode(
  firstName: string,
  lastName: string,
  phone: string,
  email?: string
): Promise<string> {
  return QRCodeGenerator.generateContactQR(firstName, lastName, phone, email);
}

export async function generateJerseyQRCode(
  playerId: string,
  jerseyNumber: number,
  teamName: string,
  baseUrl?: string
): Promise<string> {
  return QRCodeGenerator.generateJerseyQR(playerId, jerseyNumber, teamName, baseUrl);
}
