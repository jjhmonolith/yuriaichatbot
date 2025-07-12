import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export class QRService {
  // QR 코드 문자열 생성 (지문세트 독립적)
  static generateQRCode(): string {
    const timestamp = Date.now().toString(36);
    const uuid = uuidv4().split('-')[0]; // 첫 8자리만 사용
    const randomId = Math.random().toString(36).substring(2, 6); // 4자리 랜덤
    return `ps-${randomId}-${uuid}-${timestamp}`;
  }

  // 교재-지문 매핑용 QR 코드 생성
  static generateMappingQRCode(textbookId: string, order: number): string {
    const timestamp = Date.now().toString(36);
    const uuid = uuidv4().split('-')[0]; // 첫 8자리만 사용
    const randomId = Math.random().toString(36).substring(2, 6); // 4자리 랜덤
    // 교재ID 뒤 6자리 + 순서 + 랜덤ID + UUID + 타임스탬프
    const textbookIdShort = textbookId.slice(-6);
    return `mp-${textbookIdShort}-${order.toString().padStart(3, '0')}-${randomId}-${uuid}-${timestamp}`;
  }

  // QR 코드 URL 생성
  static generateQRCodeUrl(qrCode: string): string {
    const baseUrl = process.env.QR_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/chat/${qrCode}`;
  }

  // QR 코드 이미지 생성 (Base64)
  static async generateQRCodeImage(qrCode: string): Promise<string> {
    try {
      const url = this.generateQRCodeUrl(qrCode);
      const qrCodeImage = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeImage;
    } catch (error) {
      throw new Error(`Failed to generate QR code image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // QR 코드 이미지 생성 (Buffer)
  static async generateQRCodeBuffer(qrCode: string): Promise<Buffer> {
    try {
      const url = this.generateQRCodeUrl(qrCode);
      const qrCodeBuffer = await QRCode.toBuffer(url, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeBuffer;
    } catch (error) {
      throw new Error(`Failed to generate QR code buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // QR 코드 SVG 생성
  static async generateQRCodeSVG(qrCode: string): Promise<string> {
    try {
      const url = this.generateQRCodeUrl(qrCode);
      const qrCodeSVG = await QRCode.toString(url, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeSVG;
    } catch (error) {
      throw new Error(`Failed to generate QR code SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // QR 코드 유효성 검사
  static validateQRCode(qrCode: string): boolean {
    // 지문세트 독립 형식: ps-randomId-uuid-timestamp
    const passageSetPattern = /^ps-[a-z0-9]{4}-[a-f0-9]{8}-[a-z0-9]+$/;
    // 매핑 형식: mp-textbookId-order-randomId-uuid-timestamp
    const mappingPattern = /^mp-[a-z0-9]{6}-[0-9]{3}-[a-z0-9]{4}-[a-f0-9]{8}-[a-z0-9]+$/;
    return passageSetPattern.test(qrCode) || mappingPattern.test(qrCode);
  }

  // QR 코드 타입 확인
  static getQRCodeType(qrCode: string): 'passageSet' | 'mapping' | 'invalid' {
    if (qrCode.startsWith('ps-')) {
      return 'passageSet';
    } else if (qrCode.startsWith('mp-')) {
      return 'mapping';
    }
    return 'invalid';
  }

  // QR 코드에서 정보 추출
  static parseQRCode(qrCode: string): { textbookId: string; setNumber: number; uuid: string; timestamp: string } | null {
    if (!this.validateQRCode(qrCode)) {
      return null;
    }

    const parts = qrCode.split('-');
    return {
      textbookId: parts[0],
      setNumber: parseInt(parts[1], 10),
      uuid: parts[2],
      timestamp: parts[3]
    };
  }
}