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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionController = void 0;
const models_1 = require("../models");
// 임시 메모리 저장소
let memoryQuestions = [];
let nextQuestionId = 1;
class QuestionController {
    // 전체 문제 검색/목록 조회
    static searchQuestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let questions;
                let total;
                try {
                    const page = parseInt(req.query.page) || 1;
                    const limit = parseInt(req.query.limit) || 20;
                    const skip = (page - 1) * limit;
                    const { search } = req.query;
                    // 검색 필터 구성
                    const filter = {};
                    if (search) {
                        filter.$or = [
                            { questionText: { $regex: search, $options: 'i' } },
                            { explanation: { $regex: search, $options: 'i' } }
                        ];
                    }
                    questions = yield models_1.Question.find(filter)
                        .populate('setId', 'title setNumber')
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit);
                    total = yield models_1.Question.countDocuments(filter);
                }
                catch (dbError) {
                    // MongoDB 실패 시 메모리 데이터 사용
                    console.log('Using memory storage for questions (MongoDB not available)');
                    questions = memoryQuestions;
                    total = memoryQuestions.length;
                }
                res.json({
                    success: true,
                    data: {
                        questions,
                        pagination: {
                            current: 1,
                            total: 1,
                            count: questions.length,
                            totalItems: total
                        }
                    }
                });
            }
            catch (error) {
                console.error('Search questions error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to search questions',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 특정 지문세트의 문제 목록 조회
    static getQuestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { setId } = req.params;
                let questions;
                try {
                    questions = yield models_1.Question.find({ setId })
                        .populate('setId', 'title setNumber')
                        .sort({ questionNumber: 1 });
                }
                catch (dbError) {
                    // MongoDB 실패 시 메모리 데이터 사용
                    console.log('Using memory storage for get questions (MongoDB not available)');
                    console.log('Total questions in memory:', memoryQuestions.length);
                    console.log('Looking for setId:', setId);
                    console.log('Questions in memory:', memoryQuestions.map(q => ({ id: q._id, setId: q.setId })));
                    questions = memoryQuestions.filter(q => {
                        var _a;
                        const questionSetId = ((_a = q.setId) === null || _a === void 0 ? void 0 : _a._id) || q.setId;
                        const matches = questionSetId.toString() === setId;
                        console.log(`Question ${q._id}: setId=${questionSetId}, matches=${matches}`);
                        return matches;
                    });
                }
                res.json({
                    success: true,
                    data: questions
                });
            }
            catch (error) {
                console.error('Get questions error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch questions',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 문제 상세 조회
    static getQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const question = yield models_1.Question.findById(id)
                    .populate('setId', 'title setNumber');
                if (!question) {
                    return res.status(404).json({
                        success: false,
                        message: 'Question not found'
                    });
                }
                res.json({
                    success: true,
                    data: question
                });
            }
            catch (error) {
                console.error('Get question error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch question',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 문제 생성
    static createQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { setId } = req.params;
                let passageSet;
                let questionNumber = 1;
                let question;
                try {
                    // 지문세트 존재 확인
                    passageSet = yield models_1.PassageSet.findById(setId);
                    if (!passageSet) {
                        return res.status(404).json({
                            success: false,
                            message: 'Passage set not found'
                        });
                    }
                    // 다음 문제 번호 계산
                    const lastQuestion = yield models_1.Question.findOne({ setId })
                        .sort({ questionNumber: -1 });
                    questionNumber = lastQuestion ? lastQuestion.questionNumber + 1 : 1;
                    const questionData = Object.assign(Object.assign({}, req.body), { setId,
                        questionNumber });
                    question = new models_1.Question(questionData);
                    yield question.save();
                    // 생성된 문제를 populate해서 반환
                    const populatedQuestion = yield models_1.Question.findById(question._id)
                        .populate('setId', 'title setNumber');
                    question = populatedQuestion;
                }
                catch (dbError) {
                    // MongoDB 실패 시 메모리에 저장
                    console.log('Using memory storage for create question (MongoDB not available)');
                    const existingQuestions = memoryQuestions.filter(q => {
                        var _a;
                        const questionSetId = ((_a = q.setId) === null || _a === void 0 ? void 0 : _a._id) || q.setId;
                        return questionSetId.toString() === setId;
                    });
                    questionNumber = existingQuestions.length > 0 ? Math.max(...existingQuestions.map(q => q.questionNumber)) + 1 : 1;
                    question = Object.assign(Object.assign({ _id: nextQuestionId++ }, req.body), { setId: { _id: setId, title: '테스트 지문세트' }, questionNumber, createdAt: new Date(), updatedAt: new Date() });
                    memoryQuestions.push(question);
                }
                res.status(201).json({
                    success: true,
                    data: question,
                    message: 'Question created successfully'
                });
            }
            catch (error) {
                console.error('Create question error:', error);
                res.status(400).json({
                    success: false,
                    message: 'Failed to create question',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 문제 수정
    static updateQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // questionNumber, setId는 수정하지 않음
                const _a = req.body, { questionNumber, setId } = _a, updateData = __rest(_a, ["questionNumber", "setId"]);
                let question;
                try {
                    question = yield models_1.Question.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('setId', 'title setNumber');
                }
                catch (dbError) {
                    // MongoDB 실패 시 메모리 데이터에서 수정
                    console.log('Using memory storage for update question (MongoDB not available)');
                    const index = memoryQuestions.findIndex(q => q._id.toString() === id);
                    if (index === -1) {
                        return res.status(404).json({
                            success: false,
                            message: 'Question not found'
                        });
                    }
                    memoryQuestions[index] = Object.assign(Object.assign(Object.assign({}, memoryQuestions[index]), updateData), { updatedAt: new Date() });
                    question = memoryQuestions[index];
                }
                if (!question) {
                    return res.status(404).json({
                        success: false,
                        message: 'Question not found'
                    });
                }
                res.json({
                    success: true,
                    data: question,
                    message: 'Question updated successfully'
                });
            }
            catch (error) {
                console.error('Update question error:', error);
                res.status(400).json({
                    success: false,
                    message: 'Failed to update question',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 문제 삭제
    static deleteQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                let question;
                try {
                    question = yield models_1.Question.findByIdAndDelete(id);
                }
                catch (dbError) {
                    // MongoDB 실패 시 메모리 데이터에서 삭제
                    console.log('Using memory storage for delete question (MongoDB not available)');
                    const index = memoryQuestions.findIndex(q => q._id.toString() === id);
                    if (index === -1) {
                        return res.status(404).json({
                            success: false,
                            message: 'Question not found'
                        });
                    }
                    question = memoryQuestions[index];
                    memoryQuestions.splice(index, 1);
                }
                if (!question) {
                    return res.status(404).json({
                        success: false,
                        message: 'Question not found'
                    });
                }
                res.json({
                    success: true,
                    message: 'Question deleted successfully'
                });
            }
            catch (error) {
                console.error('Delete question error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete question',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 문제 순서 재정렬
    static reorderQuestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { setId } = req.params;
                const { questionIds } = req.body; // 새 순서의 문제 ID 배열
                if (!Array.isArray(questionIds)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Question IDs must be an array'
                    });
                }
                // 병렬로 문제 순서 업데이트
                const updatePromises = questionIds.map((questionId, index) => models_1.Question.findByIdAndUpdate(questionId, { questionNumber: index + 1 }, { new: true }));
                yield Promise.all(updatePromises);
                // 업데이트된 문제 목록 반환
                const questions = yield models_1.Question.find({ setId })
                    .populate('setId', 'title setNumber')
                    .sort({ questionNumber: 1 });
                res.json({
                    success: true,
                    data: questions,
                    message: 'Questions reordered successfully'
                });
            }
            catch (error) {
                console.error('Reorder questions error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to reorder questions',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
}
exports.QuestionController = QuestionController;
