"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const QuestionController_1 = require("../../controllers/QuestionController");
const router = (0, express_1.Router)();
// 문제 라우트
router.get('/', QuestionController_1.QuestionController.searchQuestions); // 전체 목록 (기본)
router.get('/:id', QuestionController_1.QuestionController.getQuestion);
router.put('/:id', QuestionController_1.QuestionController.updateQuestion);
router.delete('/:id', QuestionController_1.QuestionController.deleteQuestion);
exports.default = router;
