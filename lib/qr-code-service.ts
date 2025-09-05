import QRCode from 'qrcode';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from './firestore-schema';

export interface QRCodeData {
  id?: string;
  type: 'player' | 'team' | 'league';
  entityId: string;
  entityName: string;
  qrCode: string;
  qrCodeUrl: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class QRCodeService {
  private baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://draftkings-league.com';

  /**
   * Generate QR code for a player
   */
  async generatePlayerQR(playerId: string, playerName: string): Promise<string> {
    const url = `${this.baseUrl}/player/${playerId}`;
    return await QRCode.toDataURL(url);
  }

  /**
   * Generate QR code for a team
   */
  async generateTeamQR(teamId: string, teamName: string): Promise<string> {
    const url = `${this.baseUrl}/team/${teamId}`;
    return await QRCode.toDataURL(url);
  }

  /**
   * Generate QR code for the entire league
   */
  async generateLeagueQR(): Promise<string> {
    const url = `${this.baseUrl}/league`;
    return await QRCode.toDataURL(url);
  }

  /**
   * Save QR code data to Firestore
   */
  async saveQRCode(qrData: Omit<QRCodeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docData = {
      ...qrData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'qr-codes'), docData);
    return docRef.id;
  }

  /**
   * Update existing QR code
   */
  async updateQRCode(qrId: string, updates: Partial<QRCodeData>): Promise<void> {
    const docRef = doc(db, 'qr-codes', qrId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  /**
   * Generate and save team QR code
   */
  async createTeamQRCode(teamId: string, teamName: string): Promise<QRCodeData> {
    const qrCode = await this.generateTeamQR(teamId, teamName);
    const qrCodeUrl = `${this.baseUrl}/team/${teamId}`;

    const qrData: Omit<QRCodeData, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'team',
      entityId: teamId,
      entityName: teamName,
      qrCode,
      qrCodeUrl,
      isActive: true
    };

    const qrId = await this.saveQRCode(qrData);
    
    return {
      id: qrId,
      ...qrData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  }

  /**
   * Generate and save league QR code
   */
  async createLeagueQRCode(): Promise<QRCodeData> {
    const qrCode = await this.generateLeagueQR();
    const qrCodeUrl = `${this.baseUrl}/league`;

    const qrData: Omit<QRCodeData, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'league',
      entityId: 'main-league',
      entityName: 'All Pro Sports',
      qrCode,
      qrCodeUrl,
      isActive: true
    };

    const qrId = await this.saveQRCode(qrData);
    
    return {
      id: qrId,
      ...qrData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  }

  /**
   * Get all QR codes by type
   */
  async getQRCodesByType(type: 'player' | 'team' | 'league'): Promise<QRCodeData[]> {
    const q = query(collection(db, 'qr-codes'), where('type', '==', type));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as QRCodeData));
  }

  /**
   * Get QR code for specific entity
   */
  async getQRCodeForEntity(type: string, entityId: string): Promise<QRCodeData | null> {
    const q = query(
      collection(db, 'qr-codes'), 
      where('type', '==', type),
      where('entityId', '==', entityId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as QRCodeData;
  }

  /**
   * Batch create team QR codes
   */
  async createTeamQRCodes(teams: { id: string; name: string }[]): Promise<QRCodeData[]> {
    const qrCodes: QRCodeData[] = [];
    
    for (const team of teams) {
      try {
        const qrData = await this.createTeamQRCode(team.id, team.name);
        qrCodes.push(qrData);
      } catch (error) {
        console.error(`Failed to create QR code for team ${team.name}:`, error);
      }
    }
    
    return qrCodes;
  }

  /**
   * Regenerate QR code (useful if URL structure changes)
   */
  async regenerateQRCode(qrId: string, qrData: QRCodeData): Promise<void> {
    let newQrCode: string;
    let newUrl: string;

    switch (qrData.type) {
      case 'player':
        newUrl = `${this.baseUrl}/player/${qrData.entityId}`;
        newQrCode = await QRCode.toDataURL(newUrl);
        break;
      case 'team':
        newUrl = `${this.baseUrl}/team/${qrData.entityId}`;
        newQrCode = await QRCode.toDataURL(newUrl);
        break;
      case 'league':
        newUrl = `${this.baseUrl}/league`;
        newQrCode = await QRCode.toDataURL(newUrl);
        break;
      default:
        throw new Error(`Unknown QR code type: ${qrData.type}`);
    }

    await this.updateQRCode(qrId, {
      qrCode: newQrCode,
      qrCodeUrl: newUrl
    });
  }
}

export default new QRCodeService();
