import { Router } from 'express';
import { QuestionController } from '../../controllers/QuestionController';

const router = Router({ mergeParams: true });

// 특정 지문세트의 문제 라우트
router.get('/', QuestionController.getQuestions);
router.post('/', QuestionController.createQuestion);
router.post('/bulk-upload', QuestionController.bulkUploadQuestions);
router.put('/reorder', QuestionController.reorderQuestions);

// 백그라운드 작업 관련 라우트
router.get('/explanation-status', QuestionController.getSetExplanationStatus);
router.get('/queue-status', QuestionController.getQueueStatus);

export default router;