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
function createTestMapping() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
            console.log('✅ MongoDB connected');
            const textbookId = '687206bd7553467023b5c338';
            const passageSetId = '687206dc7553467023b5c348';
            const order = 1;
            // QR 코드 생성
            const qrCode = QRService_1.QRService.generateMappingQRCode(textbookId, order);
            const qrCodeUrl = QRService_1.QRService.generateQRCodeUrl(qrCode);
            // 매핑 생성
            const mapping = new models_1.TextbookPassageMapping({
                textbookId,
                passageSetId,
                order,
                qrCode,
                qrCodeUrl
            });
            yield mapping.save();
            console.log('✅ Created mapping:', {
                id: mapping._id,
                qrCode: mapping.qrCode,
                qrCodeUrl: mapping.qrCodeUrl
            });
        }
        catch (error) {
            console.error('❌ Creation failed:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
createTestMapping();
