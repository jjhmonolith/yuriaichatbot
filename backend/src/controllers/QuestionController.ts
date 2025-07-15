import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Question, PassageSet, SystemPrompt } from '../models';
import { AIService } from '../services/AIService';
import { BackgroundJobService } from '../services/BackgroundJobService';

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
      console.log('UPDATE QUESTION - ID:', id, 'Update data:', req.body);
      
      // ObjectId 유효성 검사
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId:', id);
        return res.status(400).json({
          success: false,
          message: 'Invalid question ID format'
        });
      }
      
      // questionNumber, setId는 수정하지 않음
      const { questionNumber, setId, ...updateData } = req.body;
      
      // 데이터 정리 및 유효성 검사
      if (updateData.options && Array.isArray(updateData.options)) {
        // 선택지에서 너무 긴 텍스트나 마크다운 제거
        const cleanedOptions = updateData.options
          .map((option: string) => {
            if (typeof option !== 'string') return '';
            // 마크다운 헤더나 너무 긴 텍스트 제거
            if (option.includes('###') || option.includes('**') || option.length > 200) {
              return '';
            }
            return option.trim();
          })
          .filter((option: string) => option.length > 0 && option.length <= 200);
        
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
        question = await Question.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).populate('setId', 'title setNumber');
        console.log('MongoDB update result:', question ? 'SUCCESS' : 'NOT_FOUND');
      } catch (dbError) {
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
      let setId: any;
      let questionDeleted = false;

      try {
        // 삭제할 문제 정보 먼저 가져오기
        question = await Question.findById(id);
        if (!question) {
          return res.status(404).json({
            success: false,
            message: 'Question not found'
          });
        }

        setId = question.setId;

        // 문제 삭제
        const deleteResult = await Question.findByIdAndDelete(id);
        questionDeleted = !!deleteResult;

        if (!questionDeleted) {
          return res.status(404).json({
            success: false,
            message: 'Question not found or already deleted'
          });
        }

        // 같은 setId의 모든 문제들 가져와서 번호 재정렬
        const remainingQuestions = await Question.find({ setId })
          .sort({ questionNumber: 1 });

        // 번호 재정렬 (1부터 순차적으로) - 에러가 나도 삭제는 성공으로 처리
        try {
          const updatePromises = remainingQuestions.map((q, index) => 
            Question.findByIdAndUpdate(
              q._id,
              { questionNumber: index + 1 },
              { new: true }
            )
          );

          await Promise.all(updatePromises);
          
          res.json({
            success: true,
            message: 'Question deleted and numbers reordered successfully'
          });
        } catch (reorderError) {
          // 번호 재정렬에 실패해도 삭제는 성공으로 처리
          console.error('Question reorder error (deletion successful):', reorderError);
          res.json({
            success: true,
            message: 'Question deleted successfully (reorder partially failed)',
            warning: 'Question numbers may need manual adjustment'
          });
        }

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
        setId = question.setId;
        memoryQuestions.splice(index, 1);
        questionDeleted = true;

        // 메모리에서도 번호 재정렬
        try {
          const sameSetQuestions = memoryQuestions.filter(q => {
            const questionSetId = q.setId?._id || q.setId;
            return questionSetId.toString() === setId.toString();
          });
          
          sameSetQuestions.sort((a, b) => a.questionNumber - b.questionNumber);
          sameSetQuestions.forEach((q, index) => {
            q.questionNumber = index + 1;
          });
        } catch (memoryReorderError) {
          console.error('Memory reorder error:', memoryReorderError);
        }

        res.json({
          success: true,
          message: 'Question deleted successfully (memory storage)'
        });
      }

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

  // CSV 파일 일괄 업로드
  static async bulkUploadQuestions(req: Request, res: Response) {
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
        passageSet = await PassageSet.findById(setId);
        if (!passageSet) {
          return res.status(404).json({
            success: false,
            message: '지문세트를 찾을 수 없습니다.'
          });
        }

        // 현재 문제 개수 확인하여 문제 번호 시작점 결정
        const lastQuestion = await Question.findOne({ setId })
          .sort({ questionNumber: -1 });
        let startQuestionNumber = lastQuestion ? lastQuestion.questionNumber + 1 : 1;

        // 문제 해설 생성용 시스템 프롬프트 가져오기
        const promptDoc = await SystemPrompt.findOne({ 
          key: 'question_explanation', 
          isActive: true 
        });

        const createdQuestions = [];
        const backgroundJobs = [];

        for (let i = 0; i < csvQuestions.length; i++) {
          const csvQuestion = csvQuestions[i];
          console.log(`Processing question ${i + 1}:`, csvQuestion); // 디버깅 로그
          
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

          // CSV에서 전달받은 정답 사용
          const correctAnswer = csvQuestion.correctAnswer;
          console.log(`Question ${i + 1} - Options:`, options, 'Correct Answer:', correctAnswer); // 디버깅 로그
          let explanation = csvQuestion.explanation?.trim() || '';
          let explanationStatus = 'completed';

          // 해설이 비어있으면 더미 해설 사용하고 백그라운드 작업 큐에 추가
          if (!explanation) {
            explanation = '🤖 AI 해설을 생성중입니다...\n\n잠시만 기다려주세요. 곧 상세한 해설이 업데이트됩니다.';
            explanationStatus = 'pending';
            console.log(`더미 해설 사용 - 문제 ${i + 1}, 백그라운드 작업 예약`);
          } else {
            console.log(`기존 해설 사용 - 문제 ${i + 1}`);
          }

          const questionData = {
            setId,
            questionNumber: startQuestionNumber + i,
            questionText: csvQuestion.questionText.trim(),
            options,
            correctAnswer,
            explanation,
            explanationStatus
          };

          console.log(`Creating question ${i + 1} with data:`, questionData); // 디버깅 로그

          const question = new Question(questionData);
          await question.save();
          
          const populatedQuestion = await Question.findById(question._id)
            .populate('setId', 'title');
          
          createdQuestions.push(populatedQuestion);

          // 해설이 비어있었던 경우 백그라운드 작업 큐에 추가
          if (explanationStatus === 'pending') {
            backgroundJobs.push({
              questionId: (question._id as any).toString(),
              passageContent: passageSet.passage || '',
              passageComment: passageSet.passageComment || '',
              questionText: csvQuestion.questionText,
              options,
              correctAnswer
            });
          }
        }

        // 백그라운드 작업 큐에 해설 생성 작업 추가
        backgroundJobs.forEach(job => {
          BackgroundJobService.addExplanationJob(job);
        });

        let message = `${createdQuestions.length}개의 문제가 성공적으로 생성되었습니다.`;
        if (backgroundJobs.length > 0) {
          message += ` (${backgroundJobs.length}개 문제의 AI 해설을 백그라운드에서 생성중입니다.)`;
        }

        res.status(201).json({
          success: true,
          data: createdQuestions,
          message,
          backgroundJobs: backgroundJobs.length,
          queueStatus: BackgroundJobService.getQueueStatus()
        });

      } catch (dbError) {
        console.error('MongoDB error during bulk upload:', dbError);
        return res.status(500).json({
          success: false,
          message: '데이터베이스 오류가 발생했습니다.',
          error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        });
      }

    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({
        success: false,
        message: '일괄 업로드에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 백그라운드 작업 큐 상태 조회
  static async getQueueStatus(req: Request, res: Response) {
    try {
      const queueStatus = BackgroundJobService.getQueueStatus();
      res.json({
        success: true,
        data: queueStatus
      });
    } catch (error) {
      console.error('Get queue status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get queue status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 특정 문제의 해설 생성 상태 조회
  static async getExplanationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const status = await BackgroundJobService.getExplanationStatus(id);
      
      if (!status) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get explanation status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get explanation status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 지문세트의 모든 문제 해설 상태 조회
  static async getSetExplanationStatus(req: Request, res: Response) {
    try {
      const { setId } = req.params;
      
      const questions = await Question.find({ setId }, 
        'questionNumber explanationStatus explanationGeneratedAt explanationError'
      ).sort({ questionNumber: 1 });

      const statusSummary = {
        total: questions.length,
        completed: questions.filter(q => q.explanationStatus === 'completed').length,
        generating: questions.filter(q => q.explanationStatus === 'generating').length,
        pending: questions.filter(q => q.explanationStatus === 'pending').length,
        failed: questions.filter(q => q.explanationStatus === 'failed').length
      };

      res.json({
        success: true,
        data: {
          summary: statusSummary,
          questions: questions.map(q => ({
            id: q._id,
            questionNumber: q.questionNumber,
            status: q.explanationStatus,
            generatedAt: q.explanationGeneratedAt,
            error: q.explanationError
          }))
        }
      });
    } catch (error) {
      console.error('Get set explanation status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get set explanation status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

}