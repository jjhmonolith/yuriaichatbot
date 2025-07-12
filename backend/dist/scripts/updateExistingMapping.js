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
function updateExistingMapping() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutech-chatbot');
            console.log('✅ MongoDB connected');
            const mappingId = '687212ee0f38bc89ffe9ee2c';
            // 기존 매핑 찾기
            const mapping = yield models_1.TextbookPassageMapping.findById(mappingId);
            if (!mapping) {
                console.log('❌ Mapping not found');
                return;
            }
            console.log('Found mapping:', {
                id: mapping._id,
                textbookId: mapping.textbookId,
                passageSetId: mapping.passageSetId,
                order: mapping.order,
                qrCode: mapping.qrCode
            });
            // QR 코드가 없으면 생성
            if (!mapping.qrCode) {
                const qrCode = QRService_1.QRService.generateMappingQRCode(mapping.textbookId.toString(), mapping.order);
                const qrCodeUrl = QRService_1.QRService.generateQRCodeUrl(qrCode);
                mapping.qrCode = qrCode;
                mapping.qrCodeUrl = qrCodeUrl;
                yield mapping.save();
                console.log('✅ Updated mapping with QR:', {
                    qrCode: mapping.qrCode,
                    qrCodeUrl: mapping.qrCodeUrl
                });
            }
            else {
                console.log('ℹ️ Mapping already has QR code');
            }
        }
        catch (error) {
            console.error('❌ Update failed:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
updateExistingMapping();
