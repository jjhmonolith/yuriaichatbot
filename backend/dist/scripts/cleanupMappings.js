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
function cleanupMappings() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
            console.log('✅ MongoDB connected');
            // 모든 매핑 조회
            const mappingsCollection = mongoose_1.default.connection.db.collection('textbook_passage_mappings');
            const allMappings = yield mappingsCollection.find({}).toArray();
            console.log('All mappings:', allMappings);
            // QR 코드가 없는 매핑 삭제
            const result = yield mappingsCollection.deleteMany({
                $or: [
                    { qrCode: { $exists: false } },
                    { qrCode: null },
                    { qrCode: '' }
                ]
            });
            console.log(`✅ Deleted ${result.deletedCount} mappings without QR codes`);
            // 남은 매핑 확인
            const remainingMappings = yield mappingsCollection.find({}).toArray();
            console.log('Remaining mappings:', remainingMappings);
        }
        catch (error) {
            console.error('❌ Cleanup failed:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
cleanupMappings();
