import mongoose from 'mongoose';
import { TextbookPassageMapping } from '../models';
import { QRService } from '../services/QRService';

async function createTestMapping() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
    console.log('✅ MongoDB connected');

    const textbookId = '687206bd7553467023b5c338';
    const passageSetId = '687206dc7553467023b5c348';
    const order = 1;

    // QR 코드 생성
    const qrCode = QRService.generateMappingQRCode(textbookId, order);
    const qrCodeUrl = QRService.generateQRCodeUrl(qrCode);

    // 매핑 생성
    const mapping = new TextbookPassageMapping({
      textbookId,
      passageSetId,
      order,
      qrCode,
      qrCodeUrl
    });

    await mapping.save();

    console.log('✅ Created mapping:', {
      id: mapping._id,
      qrCode: mapping.qrCode,
      qrCodeUrl: mapping.qrCodeUrl
    });

  } catch (error) {
    console.error('❌ Creation failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestMapping();