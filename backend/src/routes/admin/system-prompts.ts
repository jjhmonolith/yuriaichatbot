import { Router } from 'express';
import { SystemPromptController } from '../../controllers/SystemPromptController';

const router = Router();

// 시스템 프롬프트 관리 라우트
router.get('/', SystemPromptController.getAllPrompts);
router.get('/key/:key', SystemPromptController.getPromptByKey);
router.post('/', SystemPromptController.createPrompt);
router.put('/:id', SystemPromptController.updatePrompt);
router.delete('/:id', SystemPromptController.deletePrompt);
router.post('/initialize', SystemPromptController.initializeDefaultPrompts);
router.post('/initialize/:key', SystemPromptController.initializePrompt);

export default router;