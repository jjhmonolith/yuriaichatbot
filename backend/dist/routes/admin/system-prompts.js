"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SystemPromptController_1 = require("../../controllers/SystemPromptController");
const router = (0, express_1.Router)();
// 시스템 프롬프트 관리 라우트
router.get('/', SystemPromptController_1.SystemPromptController.getAllPrompts);
router.get('/key/:key', SystemPromptController_1.SystemPromptController.getPromptByKey);
router.post('/', SystemPromptController_1.SystemPromptController.createPrompt);
router.put('/:id', SystemPromptController_1.SystemPromptController.updatePrompt);
router.delete('/:id', SystemPromptController_1.SystemPromptController.deletePrompt);
router.post('/initialize', SystemPromptController_1.SystemPromptController.initializeDefaultPrompts);
router.post('/initialize/:key', SystemPromptController_1.SystemPromptController.initializePrompt);
// 버전 관리 라우트
router.get('/versions/:key', SystemPromptController_1.SystemPromptController.getPromptVersions);
router.post('/revert/:key', SystemPromptController_1.SystemPromptController.revertToVersion);
exports.default = router;
