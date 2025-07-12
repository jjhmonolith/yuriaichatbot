import mongoose from 'mongoose';
import { TextbookPassageMapping } from '../models';

async function checkMappings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
    console.log('✅ MongoDB connected');

    const allMappings = await TextbookPassageMapping.find({});
    console.log('All mappings:', JSON.stringify(allMappings, null, 2));

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkMappings();