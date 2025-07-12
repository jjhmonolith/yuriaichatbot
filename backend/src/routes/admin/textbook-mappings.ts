import { Router } from 'express';
import { TextbookPassageMappingController } from '../../controllers/TextbookPassageMappingController';

const router = Router({ mergeParams: true });

// 교재-지문세트 매핑 관리 라우트
router.get('/', TextbookPassageMappingController.getTextbookPassageSets);
router.post('/:passageSetId', TextbookPassageMappingController.addPassageSetToTextbook);
router.delete('/:passageSetId', TextbookPassageMappingController.removePassageSetFromTextbook);
router.put('/reorder', TextbookPassageMappingController.updatePassageSetOrder);
router.get('/:mappingId/qr-image', TextbookPassageMappingController.getMappingQRCodeImage);

export default router;