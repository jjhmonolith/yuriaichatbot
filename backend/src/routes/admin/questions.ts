import { Router } from 'express';
import { QuestionController } from '../../controllers/QuestionController';

const router = Router();

// 문제 라우트
router.get('/', QuestionController.searchQuestions); // 전체 목록 (기본)
router.get('/:id', QuestionController.getQuestion);
router.put('/:id', QuestionController.updateQuestion);
router.delete('/:id', QuestionController.deleteQuestion);

export default router;