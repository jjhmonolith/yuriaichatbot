import { Router } from 'express';
import { PassageSetController } from '../../controllers/PassageSetController';

const router = Router();

// LEGACY 지문세트 라우트 (하위 호환성)
router.get('/', PassageSetController.getAllPassageSets); // 전체 목록
router.get('/search', PassageSetController.getAllPassageSets); // 전체 검색
router.get('/:id', PassageSetController.getPassageSet);
router.put('/:id', PassageSetController.updatePassageSet);
router.delete('/:id', PassageSetController.deletePassageSet);
router.post('/:id/regenerate-qr', PassageSetController.regenerateQRCode);
router.get('/:id/qr-image', PassageSetController.getQRCodeImage);

export default router;