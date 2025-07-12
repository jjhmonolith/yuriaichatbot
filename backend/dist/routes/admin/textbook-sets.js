"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PassageSetController_1 = require("../../controllers/PassageSetController");
const router = (0, express_1.Router)({ mergeParams: true });
// 특정 교재의 지문세트 라우트 (LEGACY)
router.get('/', PassageSetController_1.PassageSetController.getPassageSetsByTextbook);
router.post('/', PassageSetController_1.PassageSetController.createPassageSet);
exports.default = router;
