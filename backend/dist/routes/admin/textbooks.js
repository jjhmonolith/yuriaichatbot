"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TextbookController_1 = require("../../controllers/TextbookController");
const router = (0, express_1.Router)();
// 교재 라우트
router.get('/', TextbookController_1.TextbookController.getTextbooks);
router.get('/:id', TextbookController_1.TextbookController.getTextbook);
router.post('/', TextbookController_1.TextbookController.createTextbook);
router.put('/:id', TextbookController_1.TextbookController.updateTextbook);
router.delete('/:id', TextbookController_1.TextbookController.deleteTextbook);
exports.default = router;
