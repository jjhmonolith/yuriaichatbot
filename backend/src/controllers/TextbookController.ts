import { Request, Response } from 'express';
import { Textbook } from '../models';

// 임시 메모리 저장소 (MongoDB 없이 테스트용)
let memoryTextbooks: any[] = [];
let nextId = 1;

export class TextbookController {
  // 교재 목록 조회
  static async getTextbooks(req: Request, res: Response) {
    try {
      // MongoDB 연결 시도, 실패하면 메모리 데이터 사용
      let textbooks;
      let total;
      
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const { search, subject, level } = req.query;
        
        // 검색 필터 구성
        const filter: any = {};
        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }
        if (subject) filter.subject = subject;
        if (level) filter.level = level;

        textbooks = await Textbook.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        total = await Textbook.countDocuments(filter);
      } catch (dbError) {
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
    } catch (error) {
      console.error('Get textbooks error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch textbooks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 교재 상세 조회
  static async getTextbook(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const textbook = await Textbook.findById(id);
      
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
    } catch (error) {
      console.error('Get textbook error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch textbook',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 교재 생성
  static async createTextbook(req: Request, res: Response) {
    try {
      let textbook;
      
      try {
        // MongoDB 시도
        textbook = new Textbook(req.body);
        await textbook.save();
      } catch (dbError) {
        // MongoDB 실패 시 메모리에 저장
        console.log('Using memory storage for create (MongoDB not available)');
        textbook = {
          _id: nextId++,
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        memoryTextbooks.push(textbook);
      }

      res.status(201).json({
        success: true,
        data: textbook,
        message: 'Textbook created successfully'
      });
    } catch (error) {
      console.error('Create textbook error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to create textbook',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 교재 수정
  static async updateTextbook(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const textbook = await Textbook.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

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
    } catch (error) {
      console.error('Update textbook error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update textbook',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 교재 삭제
  static async deleteTextbook(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const textbook = await Textbook.findByIdAndDelete(id);

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
    } catch (error) {
      console.error('Delete textbook error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete textbook',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}