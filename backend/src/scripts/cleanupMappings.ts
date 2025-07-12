import mongoose from 'mongoose';

async function cleanupMappings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
    console.log('✅ MongoDB connected');

    // 모든 매핑 조회
    const mappingsCollection = mongoose.connection.db!.collection('textbook_passage_mappings');
    const allMappings = await mappingsCollection.find({}).toArray();
    
    console.log('All mappings:', allMappings);

    // QR 코드가 없는 매핑 삭제
    const result = await mappingsCollection.deleteMany({
      $or: [
        { qrCode: { $exists: false } },
        { qrCode: null },
        { qrCode: '' }
      ]
    });

    console.log(`✅ Deleted ${result.deletedCount} mappings without QR codes`);

    // 남은 매핑 확인
    const remainingMappings = await mappingsCollection.find({}).toArray();
    console.log('Remaining mappings:', remainingMappings);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

cleanupMappings();