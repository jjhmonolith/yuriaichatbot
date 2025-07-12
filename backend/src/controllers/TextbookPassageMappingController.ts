import { Request, Response } from 'express';
import { TextbookPassageMapping, Textbook, PassageSet } from '../models';
import { QRService } from '../services/QRService';

export class TextbookPassageMappingController {
  // 교재의 지문세트 목록 조회
  static async getTextbookPassageSets(req: Request, res: Response) {
    try {
      const { textbookId } = req.params;
      
      const mappings = await TextbookPassageMapping.find({ textbookId })
        .populate('passageSetId')
        .sort({ order: 1 });
      
      const passageSets = mappings.map(mapping => ({
        ...(mapping.passageSetId as any).toObject(),
        order: mapping.order,
        mappingId: mapping._id,
        mappingQrCode: mapping.qrCode,
        mappingQrCodeUrl: mapping.qrCodeUrl
      }));

      res.json({
        success: true,
        data: {
          passageSets,
          pagination: {
            current: 1,
            total: 1,
            count: passageSets.length,
            totalItems: passageSets.length
          }
        }
      });
    } catch (error) {
      console.error('Get textbook passage sets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch textbook passage sets',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 교재에 지문세트 추가
  static async addPassageSetToTextbook(req: Request, res: Response) {
    try {
      const { textbookId, passageSetId } = req.params;
      
      // 교재와 지문세트 존재 확인
      const textbook = await Textbook.findById(textbookId);
      const passageSet = await PassageSet.findById(passageSetId);
      
      if (!textbook) {
        return res.status(404).json({
          success: false,
          message: 'Textbook not found'
        });
      }
      
      if (!passageSet) {
        return res.status(404).json({
          success: false,
          message: 'Passage set not found'
        });
      }

      // 이미 매핑이 존재하는지 확인
      const existingMapping = await TextbookPassageMapping.findOne({
        textbookId,
        passageSetId
      });

      if (existingMapping) {
        return res.status(400).json({
          success: false,
          message: 'Passage set already added to this textbook'
        });
      }

      // 다음 순서 번호 계산
      const lastMapping = await TextbookPassageMapping.findOne({ textbookId })
        .sort({ order: -1 });
      const nextOrder = lastMapping ? lastMapping.order + 1 : 1;

      // QR 코드 생성
      const qrCode = QRService.generateMappingQRCode(textbookId, nextOrder);
      const qrCodeUrl = QRService.generateQRCodeUrl(qrCode);

      // 매핑 생성
      const mapping = new TextbookPassageMapping({
        textbookId,
        passageSetId,
        order: nextOrder,
        qrCode,
        qrCodeUrl
      });

      await mapping.save();

      // 응답용 데이터 구성
      const populatedMapping = await TextbookPassageMapping.findById(mapping._id)
        .populate('passageSetId');

      res.status(201).json({
        success: true,
        data: populatedMapping,
        message: 'Passage set added to textbook successfully'
      });
    } catch (error) {
      console.error('Add passage set to textbook error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to add passage set to textbook',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 교재에서 지문세트 제거
  static async removePassageSetFromTextbook(req: Request, res: Response) {
    try {
      const { textbookId, passageSetId } = req.params;
      
      const mapping = await TextbookPassageMapping.findOneAndDelete({
        textbookId,
        passageSetId
      });

      if (!mapping) {
        return res.status(404).json({
          success: false,
          message: 'Mapping not found'
        });
      }

      // 순서 재정렬
      await TextbookPassageMappingController.reorderPassageSets(textbookId);

      res.json({
        success: true,
        message: 'Passage set removed from textbook successfully'
      });
    } catch (error) {
      console.error('Remove passage set from textbook error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove passage set from textbook',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 지문세트 순서 변경
  static async updatePassageSetOrder(req: Request, res: Response) {
    try {
      const { textbookId } = req.params;
      const { passageSetIds } = req.body; // 새 순서의 지문세트 ID 배열

      if (!Array.isArray(passageSetIds)) {
        return res.status(400).json({
          success: false,
          message: 'Passage set IDs must be an array'
        });
      }

      // 순서 업데이트
      const updatePromises = passageSetIds.map((passageSetId, index) =>
        TextbookPassageMapping.findOneAndUpdate(
          { textbookId, passageSetId },
          { order: index + 1 },
          { new: true }
        )
      );

      await Promise.all(updatePromises);

      // 업데이트된 목록 반환
      const mappings = await TextbookPassageMapping.find({ textbookId })
        .populate('passageSetId')
        .sort({ order: 1 });

      res.json({
        success: true,
        data: mappings,
        message: 'Passage set order updated successfully'
      });
    } catch (error) {
      console.error('Update passage set order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update passage set order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 순서 재정렬 헬퍼 함수
  private static async reorderPassageSets(textbookId: string) {
    const mappings = await TextbookPassageMapping.find({ textbookId })
      .sort({ order: 1 });

    const updatePromises = mappings.map((mapping, index) =>
      TextbookPassageMapping.findByIdAndUpdate(
        mapping._id,
        { order: index + 1 }
      )
    );

    await Promise.all(updatePromises);
  }

  // 지문세트를 사용하는 교재 목록 조회
  static async getPassageSetTextbooks(req: Request, res: Response) {
    try {
      const { passageSetId } = req.params;
      
      const mappings = await TextbookPassageMapping.find({ passageSetId })
        .populate('textbookId')
        .sort({ createdAt: -1 });
      
      const textbooks = mappings.map(mapping => ({
        ...(mapping.textbookId as any).toObject(),
        order: mapping.order,
        mappingId: mapping._id
      }));

      res.json({
        success: true,
        data: textbooks
      });
    } catch (error) {
      console.error('Get passage set textbooks error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch passage set textbooks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 매핑 QR 코드 이미지 생성
  static async getMappingQRCodeImage(req: Request, res: Response) {
    try {
      const { textbookId, mappingId } = req.params;
      
      const mapping = await TextbookPassageMapping.findOne({ 
        _id: mappingId, 
        textbookId 
      });
      
      if (!mapping) {
        return res.status(404).json({
          success: false,
          message: 'Mapping not found'
        });
      }

      const qrBuffer = await QRService.generateQRCodeBuffer(mapping.qrCode);
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="qr-${mapping.qrCode}.png"`);
      res.send(qrBuffer);
    } catch (error) {
      console.error('Generate mapping QR code error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate QR code image',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}