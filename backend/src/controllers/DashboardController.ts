import { Request, Response } from 'express';
import { Textbook, PassageSet, Question } from '../models';

export class DashboardController {
  // 대시보드 통계 조회
  static async getStats(req: Request, res: Response) {
    try {
      // 교재 수 조회
      const textbookCount = await Textbook.countDocuments();
      
      // 지문세트 수 조회
      const passageSetCount = await PassageSet.countDocuments();
      
      // 문제 수 조회
      const questionCount = await Question.countDocuments();
      
      // 이번 달 생성된 항목들 조회 (변화량 계산용)
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const textbookThisMonth = await Textbook.countDocuments({
        createdAt: { $gte: currentMonth }
      });
      
      const passageSetThisMonth = await PassageSet.countDocuments({
        createdAt: { $gte: currentMonth }
      });
      
      const questionThisMonth = await Question.countDocuments({
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
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 최근 활동 조회
  static async getRecentActivity(req: Request, res: Response) {
    try {
      const activities: any[] = [];
      
      // 최근 생성된 교재 (최대 3개)
      const recentTextbooks = await Textbook.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title createdAt');
      
      // 최근 생성/수정된 지문세트 (최대 3개)
      const recentPassageSets = await PassageSet.find()
        .sort({ updatedAt: -1 })
        .limit(3)
        .select('title createdAt updatedAt');
      
      // 최근 생성된 문제 (최대 3개)
      const recentQuestions = await Question.find()
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
        activities.push({
          type: 'question',
          action: 'created',
          title: question.questionText.substring(0, 30) + (question.questionText.length > 30 ? '...' : ''),
          timestamp: question.createdAt,
          icon: 'HelpCircle',
          description: `"${(question.setId as any)?.title || '알 수 없는 지문세트'}"에 새 문제 추가됨`
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
    } catch (error) {
      console.error('Get recent activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activity',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}