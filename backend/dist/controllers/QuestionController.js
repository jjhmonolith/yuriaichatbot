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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const AIService_1 = require("../services/AIService");
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
                console.log('UPDATE QUESTION - ID:', id, 'Update data:', req.body);
                // ObjectId 유효성 검사
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    console.log('Invalid ObjectId:', id);
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid question ID format'
                    });
                }
                // questionNumber, setId는 수정하지 않음
                const _a = req.body, { questionNumber, setId } = _a, updateData = __rest(_a, ["questionNumber", "setId"]);
                // 데이터 정리 및 유효성 검사
                if (updateData.options && Array.isArray(updateData.options)) {
                    // 선택지에서 너무 긴 텍스트나 마크다운 제거
                    const cleanedOptions = updateData.options
                        .map((option) => {
                        if (typeof option !== 'string')
                            return '';
                        // 마크다운 헤더나 너무 긴 텍스트 제거
                        if (option.includes('###') || option.includes('**') || option.length > 200) {
                            return '';
                        }
                        return option.trim();
                    })
                        .filter((option) => option.length > 0 && option.length <= 200);
                    console.log('Cleaned options:', cleanedOptions);
                    // 최소 2개의 유효한 선택지가 있어야 함
                    if (cleanedOptions.length < 2) {
                        return res.status(400).json({
                            success: false,
                            message: '최소 2개의 유효한 선택지가 필요합니다.'
                        });
                    }
                    updateData.options = cleanedOptions;
                    // correctAnswer가 정리된 options에 포함되어 있는지 확인
                    if (updateData.correctAnswer && !cleanedOptions.includes(updateData.correctAnswer)) {
                        return res.status(400).json({
                            success: false,
                            message: '정답이 선택지에 포함되어 있지 않습니다.'
                        });
                    }
                }
                let question;
                try {
                    console.log('Attempting MongoDB update for question ID:', id);
                    question = yield models_1.Question.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('setId', 'title setNumber');
                    console.log('MongoDB update result:', question ? 'SUCCESS' : 'NOT_FOUND');
                }
                catch (dbError) {
                    console.error('MongoDB error during update:', dbError);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error during update',
                        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
                    });
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
    // CSV 파일 일괄 업로드
    static bulkUploadQuestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { setId } = req.params;
                const { questions: csvQuestions } = req.body;
                if (!Array.isArray(csvQuestions) || csvQuestions.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: '업로드할 문제가 없습니다.'
                    });
                }
                let passageSet;
                try {
                    // 지문세트 존재 확인
                    passageSet = yield models_1.PassageSet.findById(setId);
                    if (!passageSet) {
                        return res.status(404).json({
                            success: false,
                            message: '지문세트를 찾을 수 없습니다.'
                        });
                    }
                    // 현재 문제 개수 확인하여 문제 번호 시작점 결정
                    const lastQuestion = yield models_1.Question.findOne({ setId })
                        .sort({ questionNumber: -1 });
                    let startQuestionNumber = lastQuestion ? lastQuestion.questionNumber + 1 : 1;
                    // 문제 해설 생성용 시스템 프롬프트 가져오기
                    const promptDoc = yield models_1.SystemPrompt.findOne({
                        key: 'question_explanation',
                        isActive: true
                    });
                    const createdQuestions = [];
                    const aiGenerationErrors = [];
                    for (let i = 0; i < csvQuestions.length; i++) {
                        const csvQuestion = csvQuestions[i];
                        // 선택지 배열 생성 (빈 값 제거)
                        const options = [
                            csvQuestion.option1,
                            csvQuestion.option2,
                            csvQuestion.option3,
                            csvQuestion.option4,
                            csvQuestion.option5
                        ].filter(opt => opt && opt.trim()).map(opt => opt.trim());
                        if (options.length < 2) {
                            return res.status(400).json({
                                success: false,
                                message: `문제 ${i + 1}: 최소 2개의 선택지가 필요합니다.`
                            });
                        }
                        // 정답은 첫 번째 선택지로 기본 설정 (CSV에서 정답 지정 기능 추가 가능)
                        const correctAnswer = options[0];
                        let explanation = ((_a = csvQuestion.explanation) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                        // 해설이 비어있으면 AI로 생성
                        if (!explanation) {
                            try {
                                explanation = yield QuestionController.generateAIExplanation(passageSet, csvQuestion.questionText, options, correctAnswer, promptDoc === null || promptDoc === void 0 ? void 0 : promptDoc.content);
                            }
                            catch (aiError) {
                                console.error(`AI 해설 생성 실패 (문제 ${i + 1}):`, aiError);
                                aiGenerationErrors.push(`문제 ${i + 1}: AI 해설 생성 실패`);
                                explanation = '해설을 생성할 수 없습니다. 수동으로 입력해주세요.';
                            }
                        }
                        const questionData = {
                            setId,
                            questionNumber: startQuestionNumber + i,
                            questionText: csvQuestion.questionText.trim(),
                            options,
                            correctAnswer,
                            explanation
                        };
                        const question = new models_1.Question(questionData);
                        yield question.save();
                        const populatedQuestion = yield models_1.Question.findById(question._id)
                            .populate('setId', 'title');
                        createdQuestions.push(populatedQuestion);
                    }
                    let message = `${createdQuestions.length}개의 문제가 성공적으로 생성되었습니다.`;
                    if (aiGenerationErrors.length > 0) {
                        message += ` (AI 해설 생성 실패: ${aiGenerationErrors.length}건)`;
                    }
                    res.status(201).json({
                        success: true,
                        data: createdQuestions,
                        message,
                        aiGenerationErrors: aiGenerationErrors.length > 0 ? aiGenerationErrors : undefined
                    });
                }
                catch (dbError) {
                    console.error('MongoDB error during bulk upload:', dbError);
                    return res.status(500).json({
                        success: false,
                        message: '데이터베이스 오류가 발생했습니다.',
                        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
                    });
                }
            }
            catch (error) {
                console.error('Bulk upload error:', error);
                res.status(500).json({
                    success: false,
                    message: '일괄 업로드에 실패했습니다.',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // AI 해설 생성 헬퍼 메서드
    static generateAIExplanation(passageSet, questionText, options, correctAnswer, systemPrompt) {
        return __awaiter(this, void 0, void 0, function* () {
            let prompt = systemPrompt;
            // 기본 프롬프트 사용
            if (!prompt) {
                prompt = `주어진 지문과 문제를 바탕으로 상세한 해설을 **마크다운 형식**으로 작성해주세요.

# 지문 정보
**제목**: {passage_title}

# 지문 내용
{passage_content}

# 문제 정보
**문제**: {question_text}

**선택지**:
{options_list}

**정답**: {correct_answer}

# 해설 작성 지침
다음과 같은 마크다운 구조로 해설을 작성해주세요:

## 🎯 정답 및 핵심 포인트
- **정답**: {correct_answer}
- **핵심**: 이 문제의 핵심 개념이나 해결 포인트

## 📝 단계별 해설
### 1단계: 문제 분석
- 문제에서 요구하는 것이 무엇인지 파악

### 2단계: 지문 분석  
- 지문에서 핵심 정보 찾기

### 3단계: 선택지 검토
- 각 선택지별 분석 및 정답 도출 과정

## ❌ 오답 분석
각 오답 선택지가 틀린 이유를 간단히 설명

답변은 고등학생이 이해하기 쉽도록 친근한 어조로 작성해주세요.`;
            }
            // 선택지 목록 생성
            const optionsList = options.map((option, index) => `${index + 1}. ${option}`).join('\n');
            // 프롬프트 치환
            const finalPrompt = prompt
                .replace('{passage_title}', passageSet.title || '지문')
                .replace('{passage_content}', passageSet.passage || '')
                .replace('{question_text}', questionText)
                .replace('{options_list}', optionsList)
                .replace('{correct_answer}', correctAnswer);
            try {
                const response = yield AIService_1.AIService.generateResponse(finalPrompt, passageSet);
                return response;
            }
            catch (error) {
                console.error('AI service error:', error);
                throw new Error('AI 해설 생성에 실패했습니다.');
            }
        });
    }
}
exports.QuestionController = QuestionController;
