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
function fixMappingIssue() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
            console.log('✅ MongoDB connected');
            // 다른 컬렉션에서 잘못된 매핑 찾기
            const collections = yield mongoose_1.default.connection.db.listCollections().toArray();
            console.log('Available collections:', collections.map(c => c.name));
            // PassageSet 컬렉션에서 textbookId가 있는지 확인 (구형 데이터)
            const passageSetsCollection = mongoose_1.default.connection.db.collection('passagesets');
            const passageSetWithTextbook = yield passageSetsCollection.findOne({
                textbookId: { $exists: true }
            });
            if (passageSetWithTextbook) {
                console.log('Found old structure passage set:', passageSetWithTextbook);
                // 구형 구조에서 textbookId 제거
                yield passageSetsCollection.updateMany({ textbookId: { $exists: true } }, { $unset: { textbookId: "", setNumber: "" } });
                console.log('✅ Removed textbookId from passage sets');
            }
            // 올바른 매핑만 확인
            const mappingsCollection = mongoose_1.default.connection.db.collection('textbook_passage_mappings');
            const allMappings = yield mappingsCollection.find({}).toArray();
            console.log('Current mappings:', allMappings);
        }
        catch (error) {
            console.error('❌ Fix failed:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
fixMappingIssue();
