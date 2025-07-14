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
const router = (0, express_1.Router)();
// QR 코드로 지문세트 및 문제 조회 (학생용)
router.get('/:qrCode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { qrCode } = req.params;
        // 지문세트 조회
        const passageSet = yield models_1.PassageSet.findOne({ qrCode });
        if (!passageSet) {
            return res.status(404).json({
                success: false,
                message: 'Passage set not found'
            });
        }
        // 해당 지문세트와 연결된 교재 목록 조회 (매핑 테이블 통해)
        const mappings = yield models_1.TextbookPassageMapping.find({
            passageSetId: passageSet._id
        })
            .populate('textbookId', 'title subject level')
            .sort({ order: 1 });
        // 해당 지문세트의 문제들 조회
        const questions = yield models_1.Question.find({ setId: passageSet._id })
            .sort({ questionNumber: 1 })
            .select('-createdAt -updatedAt');
        // 사용된 교재 목록 구성
        const textbooks = mappings.map(mapping => ({
            _id: mapping.textbookId._id,
            title: mapping.textbookId.title,
            subject: mapping.textbookId.subject,
            level: mapping.textbookId.level,
            order: mapping.order
        }));
        // 통합된 데이터 반환
        res.json({
            success: true,
            data: {
                qrCode: passageSet.qrCode,
                textbooks: textbooks, // 복수의 교재 정보
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
        // 지문세트 조회
        const passageSet = yield models_1.PassageSet.findOne({ qrCode });
        if (!passageSet) {
            return res.status(404).json({
                success: false,
                message: 'Passage set not found'
            });
        }
        // 해당 지문세트와 연결된 교재 목록 조회
        const mappings = yield models_1.TextbookPassageMapping.find({
            passageSetId: passageSet._id
        })
            .populate('textbookId', 'title subject level')
            .sort({ order: 1 });
        // 해당 지문세트의 문제들 조회
        const questions = yield models_1.Question.find({ setId: passageSet._id })
            .sort({ questionNumber: 1 })
            .select('-createdAt -updatedAt');
        // 사용된 교재 목록 구성
        const textbooks = mappings.map(mapping => ({
            _id: mapping.textbookId._id,
            title: mapping.textbookId.title,
            subject: mapping.textbookId.subject,
            level: mapping.textbookId.level,
            order: mapping.order
        }));
        // 지문 데이터 구성
        const passageData = {
            qrCode: passageSet.qrCode,
            textbooks: textbooks, // 복수의 교재 정보
            set: {
                _id: passageSet._id,
                title: passageSet.title,
                passage: passageSet.passage,
                passageComment: passageSet.passageComment
            },
            questions: questions
        };
        // AI 응답 생성
        const aiResponse = yield AIService_1.AIService.generateResponse(message, passageData, (context === null || context === void 0 ? void 0 : context.previousMessages) || []);
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
