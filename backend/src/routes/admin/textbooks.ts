import { Router } from 'express';
import { TextbookController } from '../../controllers/TextbookController';

const router = Router();

// 교재 라우트
router.get('/', TextbookController.getTextbooks);
router.get('/:id', TextbookController.getTextbook);
router.post('/', TextbookController.createTextbook);
router.put('/:id', TextbookController.updateTextbook);
router.delete('/:id', TextbookController.deleteTextbook);

export default router;