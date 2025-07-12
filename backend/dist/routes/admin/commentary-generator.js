"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CommentaryGeneratorController_1 = require("../../controllers/CommentaryGeneratorController");
const router = (0, express_1.Router)();
// 지문 해설 자동 생성
router.post('/generate', CommentaryGeneratorController_1.CommentaryGeneratorController.generateCommentary);
// 문제 해설 자동 생성
router.post('/generate-question', CommentaryGeneratorController_1.CommentaryGeneratorController.generateQuestionExplanation);
exports.default = router;
