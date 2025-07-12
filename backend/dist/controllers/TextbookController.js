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
exports.TextbookController = void 0;
const models_1 = require("../models");
// 임시 메모리 저장소 (MongoDB 없이 테스트용)
let memoryTextbooks = [];
let nextId = 1;
class TextbookController {
    // 교재 목록 조회
    static getTextbooks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // MongoDB 연결 시도, 실패하면 메모리 데이터 사용
                let textbooks;
                let total;
                try {
                    const page = parseInt(req.query.page) || 1;
                    const limit = parseInt(req.query.limit) || 20;
                    const skip = (page - 1) * limit;
                    const { search, subject, level } = req.query;
                    // 검색 필터 구성
                    const filter = {};
                    if (search) {
                        filter.$or = [
                            { title: { $regex: search, $options: 'i' } },
                            { description: { $regex: search, $options: 'i' } }
                        ];
                    }
                    if (subject)
                        filter.subject = subject;
                    if (level)
                        filter.level = level;
                    textbooks = yield models_1.Textbook.find(filter)
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit);
                    total = yield models_1.Textbook.countDocuments(filter);
                }
                catch (dbError) {
                    // MongoDB 연결 실패 시 메모리 데이터 사용
                    console.log('Using memory storage (MongoDB not available)');
                    textbooks = memoryTextbooks;
                    total = memoryTextbooks.length;
                }
                res.json({
                    success: true,
                    data: {
                        textbooks,
                        pagination: {
                            current: 1,
                            total: 1,
                            count: textbooks.length,
                            totalItems: total
                        }
                    }
                });
            }
            catch (error) {
                console.error('Get textbooks error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch textbooks',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 교재 상세 조회
    static getTextbook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const textbook = yield models_1.Textbook.findById(id);
                if (!textbook) {
                    return res.status(404).json({
                        success: false,
                        message: 'Textbook not found'
                    });
                }
                res.json({
                    success: true,
                    data: textbook
                });
            }
            catch (error) {
                console.error('Get textbook error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch textbook',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 교재 생성
    static createTextbook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let textbook;
                try {
                    // MongoDB 시도
                    textbook = new models_1.Textbook(req.body);
                    yield textbook.save();
                }
                catch (dbError) {
                    // MongoDB 실패 시 메모리에 저장
                    console.log('Using memory storage for create (MongoDB not available)');
                    textbook = Object.assign(Object.assign({ _id: nextId++ }, req.body), { createdAt: new Date(), updatedAt: new Date() });
                    memoryTextbooks.push(textbook);
                }
                res.status(201).json({
                    success: true,
                    data: textbook,
                    message: 'Textbook created successfully'
                });
            }
            catch (error) {
                console.error('Create textbook error:', error);
                res.status(400).json({
                    success: false,
                    message: 'Failed to create textbook',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 교재 수정
    static updateTextbook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const textbook = yield models_1.Textbook.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
                if (!textbook) {
                    return res.status(404).json({
                        success: false,
                        message: 'Textbook not found'
                    });
                }
                res.json({
                    success: true,
                    data: textbook,
                    message: 'Textbook updated successfully'
                });
            }
            catch (error) {
                console.error('Update textbook error:', error);
                res.status(400).json({
                    success: false,
                    message: 'Failed to update textbook',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 교재 삭제
    static deleteTextbook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const textbook = yield models_1.Textbook.findByIdAndDelete(id);
                if (!textbook) {
                    return res.status(404).json({
                        success: false,
                        message: 'Textbook not found'
                    });
                }
                res.json({
                    success: true,
                    message: 'Textbook deleted successfully'
                });
            }
            catch (error) {
                console.error('Delete textbook error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete textbook',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
}
exports.TextbookController = TextbookController;
