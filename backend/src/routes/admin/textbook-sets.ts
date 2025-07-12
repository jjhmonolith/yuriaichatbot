import { Router } from 'express';
import { PassageSetController } from '../../controllers/PassageSetController';

const router = Router({ mergeParams: true });

// 특정 교재의 지문세트 라우트 (LEGACY)
router.get('/', PassageSetController.getPassageSetsByTextbook);
router.post('/', PassageSetController.createPassageSet);

export default router;