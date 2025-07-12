import mongoose from 'mongoose';
import { TextbookPassageMapping } from '../models';
import { QRService } from '../services/QRService';

async function updateExistingMapping() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
    console.log('✅ MongoDB connected');

    const mappingId = '687212ee0f38bc89ffe9ee2c';
    
    // 기존 매핑 찾기
    const mapping = await TextbookPassageMapping.findById(mappingId);
    
    if (!mapping) {
      console.log('❌ Mapping not found');
      return;
    }

    console.log('Found mapping:', {
      id: mapping._id,
      textbookId: mapping.textbookId,
      passageSetId: mapping.passageSetId,
      order: mapping.order,
      qrCode: mapping.qrCode
    });

    // QR 코드가 없으면 생성
    if (!mapping.qrCode) {
      const qrCode = QRService.generateMappingQRCode(mapping.textbookId.toString(), mapping.order);
      const qrCodeUrl = QRService.generateQRCodeUrl(qrCode);

      mapping.qrCode = qrCode;
      mapping.qrCodeUrl = qrCodeUrl;
      
      await mapping.save();
      
      console.log('✅ Updated mapping with QR:', {
        qrCode: mapping.qrCode,
        qrCodeUrl: mapping.qrCodeUrl
      });
    } else {
      console.log('ℹ️ Mapping already has QR code');
    }

  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateExistingMapping();