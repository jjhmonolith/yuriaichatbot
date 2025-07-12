import { Router } from 'express';
import { CommentaryGeneratorController } from '../../controllers/CommentaryGeneratorController';

const router = Router();

// 지문 해설 자동 생성
router.post('/generate', CommentaryGeneratorController.generateCommentary);

// 문제 해설 자동 생성
router.post('/generate-question', CommentaryGeneratorController.generateQuestionExplanation);

export default router;