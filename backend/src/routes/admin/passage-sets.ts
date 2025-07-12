import { Router } from 'express';
import { PassageSetController } from '../../controllers/PassageSetController';

const router = Router();

// 독립적인 지문세트 관리 라우트
router.get('/', PassageSetController.getAllPassageSets);
router.post('/', PassageSetController.createPassageSet);
router.get('/:id', PassageSetController.getPassageSet);
router.put('/:id', PassageSetController.updatePassageSet);
router.delete('/:id', PassageSetController.deletePassageSet);
router.post('/:id/regenerate-qr', PassageSetController.regenerateQRCode);
router.get('/:id/qr-image', PassageSetController.getQRCodeImage);

export default router;