import { Request, Response } from 'express';
import { Question, PassageSet } from '../models';

// 임시 메모리 저장소
let memoryQuestions: any[] = [];
let nextQuestionId = 1;

export class QuestionController {
  // 전체 문제 검색/목록 조회
  static async searchQuestions(req: Request, res: Response) {
    try {
      let questions;
      let total;
      
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const { search } = req.query;
        
        // 검색 필터 구성
        const filter: any = {};
        if (search) {
          filter.$or = [
            { questionText: { $regex: search, $options: 'i' } },
            { explanation: { $regex: search, $options: 'i' } }
          ];
        }

        questions = await Question.find(filter)
          .populate('setId', 'title setNumber')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        total = await Question.countDocuments(filter);
      } catch (dbError) {
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
    } catch (error) {
      console.error('Search questions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search questions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 특정 지문세트의 문제 목록 조회
  static async getQuestions(req: Request, res: Response) {
    try {
      const { setId } = req.params;
      let questions;
      
      try {
        questions = await Question.find({ setId })
          .populate('setId', 'title setNumber')
          .sort({ questionNumber: 1 });
      } catch (dbError) {
        // MongoDB 실패 시 메모리 데이터 사용
        console.log('Using memory storage for get questions (MongoDB not available)');
        console.log('Total questions in memory:', memoryQuestions.length);
        console.log('Looking for setId:', setId);
        console.log('Questions in memory:', memoryQuestions.map(q => ({ id: q._id, setId: q.setId })));
        
        questions = memoryQuestions.filter(q => {
          const questionSetId = q.setId?._id || q.setId;
          const matches = questionSetId.toString() === setId;
          console.log(`Question ${q._id}: setId=${questionSetId}, matches=${matches}`);
          return matches;
        });
      }

      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      console.error('Get questions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch questions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 문제 상세 조회
  static async getQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const question = await Question.findById(id)
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
    } catch (error) {
      console.error('Get question error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch question',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 문제 생성
  static async createQuestion(req: Request, res: Response) {
    try {
      const { setId } = req.params;
      let passageSet;
      let questionNumber = 1;
      let question;
      
      try {
        // 지문세트 존재 확인
        passageSet = await PassageSet.findById(setId);
        if (!passageSet) {
          return res.status(404).json({
            success: false,
            message: 'Passage set not found'
          });
        }

        // 다음 문제 번호 계산
        const lastQuestion = await Question.findOne({ setId })
          .sort({ questionNumber: -1 });
        questionNumber = lastQuestion ? lastQuestion.questionNumber + 1 : 1;

        const questionData = {
          ...req.body,
          setId,
          questionNumber
        };

        question = new Question(questionData);
        await question.save();

        // 생성된 문제를 populate해서 반환
        const populatedQuestion = await Question.findById(question._id)
          .populate('setId', 'title setNumber');
        question = populatedQuestion;
      } catch (dbError) {
        // MongoDB 실패 시 메모리에 저장
        console.log('Using memory storage for create question (MongoDB not available)');
        const existingQuestions = memoryQuestions.filter(q => {
          const questionSetId = q.setId?._id || q.setId;
          return questionSetId.toString() === setId;
        });
        questionNumber = existingQuestions.length > 0 ? Math.max(...existingQuestions.map(q => q.questionNumber)) + 1 : 1;
        
        question = {
          _id: nextQuestionId++,
          ...req.body,
          setId: { _id: setId, title: '테스트 지문세트' },
          questionNumber,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        memoryQuestions.push(question);
      }

      res.status(201).json({
        success: true,
        data: question,
        message: 'Question created successfully'
      });
    } catch (error) {
      console.error('Create question error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to create question',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 문제 수정
  static async updateQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // questionNumber, setId는 수정하지 않음
      const { questionNumber, setId, ...updateData } = req.body;
      let question;
      
      try {
        question = await Question.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).populate('setId', 'title setNumber');
      } catch (dbError) {
        // MongoDB 실패 시 메모리 데이터에서 수정
        console.log('Using memory storage for update question (MongoDB not available)');
        const index = memoryQuestions.findIndex(q => q._id.toString() === id);
        
        if (index === -1) {
          return res.status(404).json({
            success: false,
            message: 'Question not found'
          });
        }

        memoryQuestions[index] = {
          ...memoryQuestions[index],
          ...updateData,
          updatedAt: new Date()
        };
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
    } catch (error) {
      console.error('Update question error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update question',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 문제 삭제
  static async deleteQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      let question;

      try {
        question = await Question.findByIdAndDelete(id);
      } catch (dbError) {
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
    } catch (error) {
      console.error('Delete question error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete question',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 문제 순서 재정렬
  static async reorderQuestions(req: Request, res: Response) {
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
      const updatePromises = questionIds.map((questionId, index) => 
        Question.findByIdAndUpdate(
          questionId,
          { questionNumber: index + 1 },
          { new: true }
        )
      );

      await Promise.all(updatePromises);

      // 업데이트된 문제 목록 반환
      const questions = await Question.find({ setId })
        .populate('setId', 'title setNumber')
        .sort({ questionNumber: 1 });

      res.json({
        success: true,
        data: questions,
        message: 'Questions reordered successfully'
      });
    } catch (error) {
      console.error('Reorder questions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder questions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}