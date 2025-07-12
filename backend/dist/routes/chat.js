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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const AIService_1 = require("../services/AIService");
const QRService_1 = require("../services/QRService");
const router = (0, express_1.Router)();
// QR 코드로 지문세트 및 문제 조회 (학생용)
router.get('/:qrCode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { qrCode } = req.params;
        // QR 코드 타입 확인
        const qrType = QRService_1.QRService.getQRCodeType(qrCode);
        if (qrType === 'invalid') {
            return res.status(400).json({
                success: false,
                message: 'Invalid QR code format'
            });
        }
        let passageSet = null;
        let textbooks = [];
        let specificTextbook = null;
        if (qrType === 'mapping') {
            // 매핑 QR 코드: 특정 교재-지문 매핑 조회
            const mapping = yield models_1.TextbookPassageMapping.findOne({ qrCode })
                .populate('textbookId', 'title subject level')
                .populate('passageSetId');
            if (!mapping) {
                return res.status(404).json({
                    success: false,
                    message: 'Textbook-passage mapping not found'
                });
            }
            passageSet = mapping.passageSetId;
            specificTextbook = mapping.textbookId;
            textbooks = [specificTextbook]; // 특정 교재만
        }
        else if (qrType === 'passageSet') {
            // 지문세트 QR 코드: 독립 지문세트 조회
            passageSet = yield models_1.PassageSet.findOne({ qrCode });
            if (!passageSet) {
                return res.status(404).json({
                    success: false,
                    message: 'Passage set not found'
                });
            }
            // 해당 지문세트와 연결된 모든 교재 목록 조회
            const mappings = yield models_1.TextbookPassageMapping.find({
                passageSetId: passageSet._id
            })
                .populate('textbookId', 'title subject level')
                .sort({ order: 1 });
            textbooks = mappings.map(mapping => ({
                _id: mapping.textbookId._id,
                title: mapping.textbookId.title,
                subject: mapping.textbookId.subject,
                level: mapping.textbookId.level,
                order: mapping.order
            }));
        }
        // 해당 지문세트의 문제들 조회
        const questions = yield models_1.Question.find({ setId: passageSet._id })
            .sort({ questionNumber: 1 })
            .select('-createdAt -updatedAt');
        // 통합된 데이터 반환
        res.json({
            success: true,
            data: {
                qrCode: qrCode,
                qrType: qrType,
                textbooks: textbooks,
                specificTextbook: specificTextbook, // 매핑 QR인 경우 특정 교재
                set: {
                    _id: passageSet._id,
                    title: passageSet.title,
                    passage: passageSet.passage,
                    passageComment: passageSet.passageComment
                },
                questions: questions
            }
        });
    }
    catch (error) {
        console.error('Get passage set with questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch passage set data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// AI 채팅 메시지
router.post('/:qrCode/message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { qrCode } = req.params;
        const { message, context } = req.body;
        // QR 코드 타입 확인
        const qrType = QRService_1.QRService.getQRCodeType(qrCode);
        let passageSet = null;
        let chatTextbooks = [];
        if (qrType === 'mapping') {
            // 매핑 QR 코드: 특정 교재-지문 매핑 조회
            const mapping = yield models_1.TextbookPassageMapping.findOne({ qrCode })
                .populate('textbookId', 'title subject level')
                .populate('passageSetId');
            if (!mapping) {
                return res.status(404).json({
                    success: false,
                    message: 'Textbook-passage mapping not found'
                });
            }
            passageSet = mapping.passageSetId;
            chatTextbooks = [mapping.textbookId]; // 특정 교재만
        }
        else if (qrType === 'passageSet') {
            // 지문세트 QR 코드: 독립 지문세트 조회
            passageSet = yield models_1.PassageSet.findOne({ qrCode });
            if (!passageSet) {
                return res.status(404).json({
                    success: false,
                    message: 'Passage set not found'
                });
            }
            // 해당 지문세트와 연결된 모든 교재 목록 조회
            const mappings = yield models_1.TextbookPassageMapping.find({
                passageSetId: passageSet._id
            })
                .populate('textbookId', 'title subject level')
                .sort({ order: 1 });
            chatTextbooks = mappings.map(mapping => ({
                _id: mapping.textbookId._id,
                title: mapping.textbookId.title,
                subject: mapping.textbookId.subject,
                level: mapping.textbookId.level,
                order: mapping.order
            }));
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Invalid QR code format'
            });
        }
        // 해당 지문세트의 문제들 조회
        const questions = yield models_1.Question.find({ setId: passageSet._id })
            .sort({ questionNumber: 1 })
            .select('-createdAt -updatedAt');
        // 지문 데이터 구성
        const passageData = {
            qrCode: passageSet.qrCode,
            textbooks: chatTextbooks, // 복수의 교재 정보
            set: {
                _id: passageSet._id,
                title: passageSet.title,
                passage: passageSet.passage,
                passageComment: passageSet.passageComment
            },
            questions: questions
        };
        // AI 응답 생성
        console.log('Chat request received:', {
            qrCode,
            message: message.substring(0, 50) + '...',
            hasOpenAI: !!process.env.OPENAI_API_KEY
        });
        const aiResponse = yield AIService_1.AIService.generateResponse(message, passageData, (context === null || context === void 0 ? void 0 : context.previousMessages) || []);
        console.log('AI Response generated:', aiResponse.substring(0, 100) + '...');
        const response = {
            success: true,
            data: {
                response: aiResponse,
                timestamp: Date.now()
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process chat message',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
exports.default = router;
