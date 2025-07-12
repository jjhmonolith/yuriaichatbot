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
const models_1 = require("../models");
const QRService_1 = require("../services/QRService");
function migrateExistingMappings() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // MongoDB 연결
            yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
            console.log('✅ MongoDB connected');
            // QR 코드가 없는 매핑들 찾기
            const mappingsWithoutQR = yield models_1.TextbookPassageMapping.find({
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
                const qrCode = QRService_1.QRService.generateMappingQRCode(mapping.textbookId.toString(), mapping.order);
                const qrCodeUrl = QRService_1.QRService.generateQRCodeUrl(qrCode);
                // 매핑 업데이트
                yield models_1.TextbookPassageMapping.findByIdAndUpdate(mapping._id, {
                    qrCode,
                    qrCodeUrl
                });
                console.log(`✅ Updated mapping ${mapping._id} with QR: ${qrCode}`);
            }
            console.log('🎉 Migration completed successfully!');
        }
        catch (error) {
            console.error('❌ Migration failed:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
// 스크립트 실행
if (require.main === module) {
    migrateExistingMappings();
}
exports.default = migrateExistingMappings;
