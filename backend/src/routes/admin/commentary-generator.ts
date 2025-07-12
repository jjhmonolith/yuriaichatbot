import { Router } from 'express';
import { CommentaryGeneratorController } from '../../controllers/CommentaryGeneratorController';

const router = Router();

// 해설 자동 생성
router.post('/generate', CommentaryGeneratorController.generateCommentary);

export default router;