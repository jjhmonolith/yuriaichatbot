import { Request, Response } from 'express';
import { PassageSet, TextbookPassageMapping } from '../models';
import { QRService } from '../services/QRService';

export class PassageSetController {
  // 모든 지문세트 목록 조회
  static async getAllPassageSets(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const { search } = req.query;
      
      // 검색 필터 구성
      const filter: any = {};
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { passage: { $regex: search, $options: 'i' } }
        ];
      }

      const passageSets = await PassageSet.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await PassageSet.countDocuments(filter);

      // 각 지문세트가 사용되는 교재 수 추가
      const passageSetsWithStats = await Promise.all(
        passageSets.map(async (set) => {
          const textbookCount = await TextbookPassageMapping.countDocuments({
            passageSetId: set._id
          });
          return {
            ...set.toObject(),
            textbookCount
          };
        })
      );

      res.json({
        success: true,
        data: {
          passageSets: passageSetsWithStats,
          pagination: {
            current: page,
            total: Math.ceil(total / limit),
            count: passageSets.length,
            totalItems: total
          }
        }
      });
    } catch (error) {
      console.error('Get all passage sets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch passage sets',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 지문세트 상세 조회
  static async getPassageSet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const passageSet = await PassageSet.findById(id);
      
      if (!passageSet) {
        return res.status(404).json({
          success: false,
          message: 'Passage set not found'
        });
      }

      // 이 지문세트를 사용하는 교재들 조회
      const mappings = await TextbookPassageMapping.find({ passageSetId: id })
        .populate('textbookId', 'title subject level');

      const textbooks = mappings.map(mapping => ({
        ...(mapping.textbookId as any).toObject(),
        order: mapping.order,
        mappingId: mapping._id
      }));

      res.json({
        success: true,
        data: {
          ...passageSet.toObject(),
          textbooks
        }
      });
    } catch (error) {
      console.error('Get passage set error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch passage set',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 지문세트 생성
  static async createPassageSet(req: Request, res: Response) {
    try {
      // QR 코드 생성 (교재와 독립적)
      const qrCode = QRService.generateQRCode();
      const qrCodeUrl = QRService.generateQRCodeUrl(qrCode);

      const passageSetData = {
        ...req.body,
        qrCode,
        qrCodeUrl
      };

      const passageSet = new PassageSet(passageSetData);
      await passageSet.save();

      res.status(201).json({
        success: true,
        data: passageSet,
        message: 'Passage set created successfully'
      });
    } catch (error) {
      console.error('Create passage set error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to create passage set',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 지문세트 수정
  static async updatePassageSet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const passageSet = await PassageSet.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!passageSet) {
        return res.status(404).json({
          success: false,
          message: 'Passage set not found'
        });
      }

      res.json({
        success: true,
        data: passageSet,
        message: 'Passage set updated successfully'
      });
    } catch (error) {
      console.error('Update passage set error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update passage set',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 지문세트 삭제
  static async deletePassageSet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // 지문세트를 사용하는 교재가 있는지 확인
      const mappingCount = await TextbookPassageMapping.countDocuments({ passageSetId: id });
      
      if (mappingCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete passage set. It is used in ${mappingCount} textbook(s). Please remove it from all textbooks first.`
        });
      }

      const passageSet = await PassageSet.findByIdAndDelete(id);

      if (!passageSet) {
        return res.status(404).json({
          success: false,
          message: 'Passage set not found'
        });
      }

      res.json({
        success: true,
        message: 'Passage set deleted successfully'
      });
    } catch (error) {
      console.error('Delete passage set error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete passage set',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // QR 코드로 지문세트 조회 (학생용)
  static async getPassageSetByQRCode(req: Request, res: Response) {
    try {
      const { qrCode } = req.params;
      
      if (!QRService.validateQRCode(qrCode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code format'
        });
      }

      const passageSet = await PassageSet.findOne({ qrCode });
      
      if (!passageSet) {
        return res.status(404).json({
          success: false,
          message: 'Passage set not found'
        });
      }

      res.json({
        success: true,
        data: passageSet
      });
    } catch (error) {
      console.error('Get passage set by QR error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch passage set',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // QR 코드 재생성
  static async regenerateQRCode(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const passageSet = await PassageSet.findById(id);
      
      if (!passageSet) {
        return res.status(404).json({
          success: false,
          message: 'Passage set not found'
        });
      }

      const newQrCode = QRService.generateQRCode();
      const newQrCodeUrl = QRService.generateQRCodeUrl(newQrCode);

      const updatedPassageSet = await PassageSet.findByIdAndUpdate(
        id,
        { 
          qrCode: newQrCode,
          qrCodeUrl: newQrCodeUrl
        },
        { new: true }
      );

      res.json({
        success: true,
        data: updatedPassageSet,
        message: 'QR code regenerated successfully'
      });
    } catch (error) {
      console.error('Regenerate QR code error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to regenerate QR code',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // QR 코드 이미지 다운로드
  static async getQRCodeImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const passageSet = await PassageSet.findById(id);
      
      if (!passageSet) {
        return res.status(404).json({
          success: false,
          message: 'Passage set not found'
        });
      }

      const qrCodeBuffer = await QRService.generateQRCodeBuffer(passageSet.qrCode);
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="qr-${passageSet.title.replace(/[^a-zA-Z0-9]/g, '-')}.png"`);
      res.send(qrCodeBuffer);
    } catch (error) {
      console.error('Get QR code image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate QR code image',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // LEGACY: 교재별 지문세트 조회 (하위 호환성)
  static async getPassageSetsByTextbook(req: Request, res: Response) {
    try {
      const { textbookId } = req.params;
      
      const mappings = await TextbookPassageMapping.find({ textbookId })
        .populate('passageSetId')
        .sort({ order: 1 });
      
      const passageSets = mappings.map(mapping => ({
        ...(mapping.passageSetId as any).toObject(),
        order: mapping.order,
        mappingId: mapping._id
      }));

      res.json({
        success: true,
        data: {
          sets: passageSets,
          pagination: {
            current: 1,
            total: 1,
            count: passageSets.length,
            totalItems: passageSets.length
          }
        }
      });
    } catch (error) {
      console.error('Get passage sets by textbook error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch passage sets',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}