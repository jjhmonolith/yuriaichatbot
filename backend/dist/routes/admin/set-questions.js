"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const QuestionController_1 = require("../../controllers/QuestionController");
const router = (0, express_1.Router)({ mergeParams: true });
// 특정 지문세트의 문제 라우트
router.get('/', QuestionController_1.QuestionController.getQuestions);
router.post('/', QuestionController_1.QuestionController.createQuestion);
router.put('/reorder', QuestionController_1.QuestionController.reorderQuestions);
exports.default = router;
