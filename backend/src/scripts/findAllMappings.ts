import mongoose from 'mongoose';

async function findAllMappings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
    console.log('✅ MongoDB connected');

    // 모든 컬렉션 확인
    const collections = await mongoose.connection.db!.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // textbook_passage_mappings 컬렉션 직접 확인
    const mappingsCollection = mongoose.connection.db!.collection('textbook_passage_mappings');
    const mappings = await mappingsCollection.find({}).toArray();
    console.log('Direct query mappings:', mappings);

    // textbooks 컬렉션도 확인
    const textbooksCollection = mongoose.connection.db!.collection('textbooks');
    const textbooks = await textbooksCollection.find({}).toArray();
    console.log('Textbooks:', textbooks.map(t => ({ _id: t._id, title: t.title })));

  } catch (error) {
    console.error('❌ Find failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

findAllMappings();