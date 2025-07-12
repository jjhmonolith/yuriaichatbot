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
exports.QRService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const uuid_1 = require("uuid");
class QRService {
    // QR 코드 문자열 생성 (지문세트 독립적)
    static generateQRCode() {
        const timestamp = Date.now().toString(36);
        const uuid = (0, uuid_1.v4)().split('-')[0]; // 첫 8자리만 사용
        const randomId = Math.random().toString(36).substring(2, 6); // 4자리 랜덤
        return `ps-${randomId}-${uuid}-${timestamp}`;
    }
    // 교재-지문 매핑용 QR 코드 생성
    static generateMappingQRCode(textbookId, order) {
        const timestamp = Date.now().toString(36);
        const uuid = (0, uuid_1.v4)().split('-')[0]; // 첫 8자리만 사용
        const randomId = Math.random().toString(36).substring(2, 6); // 4자리 랜덤
        // 교재ID 뒤 6자리 + 순서 + 랜덤ID + UUID + 타임스탬프
        const textbookIdShort = textbookId.slice(-6);
        return `mp-${textbookIdShort}-${order.toString().padStart(3, '0')}-${randomId}-${uuid}-${timestamp}`;
    }
    // QR 코드 URL 생성
    static generateQRCodeUrl(qrCode) {
        // 환경변수로 도메인 관리 (도메인 변경 시 환경변수만 수정)
        const baseUrl = process.env.QR_BASE_URL || process.env.FRONTEND_URL || 'https://yuriaichatbot-frontend.vercel.app';
        return `${baseUrl}/chat/${qrCode}`;
    }
    // QR 코드 이미지 생성 (Base64)
    static generateQRCodeImage(qrCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = this.generateQRCodeUrl(qrCode);
                const qrCodeImage = yield qrcode_1.default.toDataURL(url, {
                    errorCorrectionLevel: 'M',
                    margin: 1,
                    width: 256,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                return qrCodeImage;
            }
            catch (error) {
                throw new Error(`Failed to generate QR code image: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // QR 코드 이미지 생성 (Buffer)
    static generateQRCodeBuffer(qrCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = this.generateQRCodeUrl(qrCode);
                const qrCodeBuffer = yield qrcode_1.default.toBuffer(url, {
                    errorCorrectionLevel: 'M',
                    margin: 1,
                    width: 256,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                return qrCodeBuffer;
            }
            catch (error) {
                throw new Error(`Failed to generate QR code buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // QR 코드 SVG 생성
    static generateQRCodeSVG(qrCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = this.generateQRCodeUrl(qrCode);
                const qrCodeSVG = yield qrcode_1.default.toString(url, {
                    type: 'svg',
                    errorCorrectionLevel: 'M',
                    margin: 1,
                    width: 256,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                return qrCodeSVG;
            }
            catch (error) {
                throw new Error(`Failed to generate QR code SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // QR 코드 유효성 검사
    static validateQRCode(qrCode) {
        // 지문세트 독립 형식: ps-randomId-uuid-timestamp
        const passageSetPattern = /^ps-[a-z0-9]{4}-[a-f0-9]{8}-[a-z0-9]+$/;
        // 매핑 형식: mp-textbookId-order-randomId-uuid-timestamp
        const mappingPattern = /^mp-[a-z0-9]{6}-[0-9]{3}-[a-z0-9]{4}-[a-f0-9]{8}-[a-z0-9]+$/;
        return passageSetPattern.test(qrCode) || mappingPattern.test(qrCode);
    }
    // QR 코드 타입 확인
    static getQRCodeType(qrCode) {
        if (qrCode.startsWith('ps-')) {
            return 'passageSet';
        }
        else if (qrCode.startsWith('mp-')) {
            return 'mapping';
        }
        return 'invalid';
    }
    // QR 코드에서 정보 추출
    static parseQRCode(qrCode) {
        if (!this.validateQRCode(qrCode)) {
            return null;
        }
        const parts = qrCode.split('-');
        return {
            textbookId: parts[0],
            setNumber: parseInt(parts[1], 10),
            uuid: parts[2],
            timestamp: parts[3]
        };
    }
}
exports.QRService = QRService;
