"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
function findAllMappings() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
            console.log('✅ MongoDB connected');
            // 모든 컬렉션 확인
            const collections = yield mongoose_1.default.connection.db.listCollections().toArray();
            console.log('Collections:', collections.map(c => c.name));
            // textbook_passage_mappings 컬렉션 직접 확인
            const mappingsCollection = mongoose_1.default.connection.db.collection('textbook_passage_mappings');
            const mappings = yield mappingsCollection.find({}).toArray();
            console.log('Direct query mappings:', mappings);
            // textbooks 컬렉션도 확인
            const textbooksCollection = mongoose_1.default.connection.db.collection('textbooks');
            const textbooks = yield textbooksCollection.find({}).toArray();
            console.log('Textbooks:', textbooks.map(t => ({ _id: t._id, title: t.title })));
        }
        catch (error) {
            console.error('❌ Find failed:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
findAllMappings();
