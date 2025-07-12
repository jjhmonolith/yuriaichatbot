import mongoose from 'mongoose';
import { TextbookPassageMapping } from '../models';
import { QRService } from '../services/QRService';

async function migrateExistingMappings() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
    console.log('✅ MongoDB connected');

    // QR 코드가 없는 매핑들 찾기
    const mappingsWithoutQR = await TextbookPassageMapping.find({
      $or: [
        { qrCode: { $exists: false } },
        { qrCode: null },
        { qrCode: '' },
        { qrCodeUrl: { $exists: false } },
        { qrCodeUrl: null },
        { qrCodeUrl: '' }
      ]
    });

    console.log(`Found ${mappingsWithoutQR.length} mappings without QR codes`);

    for (const mapping of mappingsWithoutQR) {
      // 새로운 QR 코드 생성
      const qrCode = QRService.generateMappingQRCode(mapping.textbookId.toString(), mapping.order);
      const qrCodeUrl = QRService.generateQRCodeUrl(qrCode);

      // 매핑 업데이트
      await TextbookPassageMapping.findByIdAndUpdate(mapping._id, {
        qrCode,
        qrCodeUrl
      });

      console.log(`✅ Updated mapping ${mapping._id} with QR: ${qrCode}`);
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateExistingMappings();
}

export default migrateExistingMappings;