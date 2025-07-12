import mongoose from 'mongoose';

async function fixMappingIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
    console.log('✅ MongoDB connected');

    // 다른 컬렉션에서 잘못된 매핑 찾기
    const collections = await mongoose.connection.db!.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // PassageSet 컬렉션에서 textbookId가 있는지 확인 (구형 데이터)
    const passageSetsCollection = mongoose.connection.db!.collection('passagesets');
    const passageSetWithTextbook = await passageSetsCollection.findOne({
      textbookId: { $exists: true }
    });
    
    if (passageSetWithTextbook) {
      console.log('Found old structure passage set:', passageSetWithTextbook);
      
      // 구형 구조에서 textbookId 제거
      await passageSetsCollection.updateMany(
        { textbookId: { $exists: true } },
        { $unset: { textbookId: "", setNumber: "" } }
      );
      console.log('✅ Removed textbookId from passage sets');
    }

    // 올바른 매핑만 확인
    const mappingsCollection = mongoose.connection.db!.collection('textbook_passage_mappings');
    const allMappings = await mappingsCollection.find({}).toArray();
    console.log('Current mappings:', allMappings);

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixMappingIssue();