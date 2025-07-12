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
exports.DashboardController = void 0;
const models_1 = require("../models");
class DashboardController {
    // 대시보드 통계 조회
    static getStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 교재 수 조회
                const textbookCount = yield models_1.Textbook.countDocuments();
                // 지문세트 수 조회
                const passageSetCount = yield models_1.PassageSet.countDocuments();
                // 문제 수 조회
                const questionCount = yield models_1.Question.countDocuments();
                // 이번 달 생성된 항목들 조회 (변화량 계산용)
                const currentMonth = new Date();
                currentMonth.setDate(1);
                currentMonth.setHours(0, 0, 0, 0);
                const textbookThisMonth = yield models_1.Textbook.countDocuments({
                    createdAt: { $gte: currentMonth }
                });
                const passageSetThisMonth = yield models_1.PassageSet.countDocuments({
                    createdAt: { $gte: currentMonth }
                });
                const questionThisMonth = yield models_1.Question.countDocuments({
                    createdAt: { $gte: currentMonth }
                });
                // 통계 데이터 구성
                const stats = [
                    {
                        name: '총 교재',
                        value: textbookCount.toString(),
                        change: `+${textbookThisMonth}`,
                        changeType: 'positive'
                    },
                    {
                        name: '지문세트',
                        value: passageSetCount.toString(),
                        change: `+${passageSetThisMonth}`,
                        changeType: 'positive'
                    },
                    {
                        name: '등록된 문제',
                        value: questionCount.toLocaleString(),
                        change: `+${questionThisMonth}`,
                        changeType: 'positive'
                    },
                    {
                        name: '이번 달 질문',
                        value: '0', // 채팅 로그 기능이 없어서 임시로 0
                        change: '+0',
                        changeType: 'neutral'
                    }
                ];
                res.json({
                    success: true,
                    data: { stats }
                });
            }
            catch (error) {
                console.error('Get dashboard stats error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch dashboard statistics',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // 최근 활동 조회
    static getRecentActivity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const activities = [];
                // 최근 생성된 교재 (최대 3개)
                const recentTextbooks = yield models_1.Textbook.find()
                    .sort({ createdAt: -1 })
                    .limit(3)
                    .select('title createdAt');
                // 최근 생성/수정된 지문세트 (최대 3개)
                const recentPassageSets = yield models_1.PassageSet.find()
                    .sort({ updatedAt: -1 })
                    .limit(3)
                    .select('title createdAt updatedAt');
                // 최근 생성된 문제 (최대 3개)
                const recentQuestions = yield models_1.Question.find()
                    .sort({ createdAt: -1 })
                    .limit(3)
                    .populate('setId', 'title')
                    .select('questionText createdAt setId');
                // 교재 활동 추가
                recentTextbooks.forEach(textbook => {
                    activities.push({
                        type: 'textbook',
                        action: 'created',
                        title: textbook.title,
                        timestamp: textbook.createdAt,
                        icon: 'BookOpen',
                        description: `새 교재 "${textbook.title}" 추가됨`
                    });
                });
                // 지문세트 활동 추가
                recentPassageSets.forEach(passageSet => {
                    const isUpdated = passageSet.updatedAt.getTime() !== passageSet.createdAt.getTime();
                    activities.push({
                        type: 'passageSet',
                        action: isUpdated ? 'updated' : 'created',
                        title: passageSet.title,
                        timestamp: passageSet.updatedAt,
                        icon: 'FileText',
                        description: `지문세트 "${passageSet.title}" ${isUpdated ? '수정됨' : '생성됨'}`
                    });
                });
                // 문제 활동 추가
                recentQuestions.forEach(question => {
                    var _a;
                    activities.push({
                        type: 'question',
                        action: 'created',
                        title: question.questionText.substring(0, 30) + (question.questionText.length > 30 ? '...' : ''),
                        timestamp: question.createdAt,
                        icon: 'HelpCircle',
                        description: `"${((_a = question.setId) === null || _a === void 0 ? void 0 : _a.title) || '알 수 없는 지문세트'}"에 새 문제 추가됨`
                    });
                });
                // 시간순 정렬 (최신순)
                activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                // 최대 10개 활동만 반환
                const limitedActivities = activities.slice(0, 10);
                res.json({
                    success: true,
                    data: { activities: limitedActivities }
                });
            }
            catch (error) {
                console.error('Get recent activity error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch recent activity',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
}
exports.DashboardController = DashboardController;
