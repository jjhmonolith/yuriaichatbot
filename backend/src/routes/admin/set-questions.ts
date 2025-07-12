import { Router } from 'express';
import { QuestionController } from '../../controllers/QuestionController';

const router = Router({ mergeParams: true });

// 특정 지문세트의 문제 라우트
router.get('/', QuestionController.getQuestions);
router.post('/', QuestionController.createQuestion);
router.put('/reorder', QuestionController.reorderQuestions);

export default router;