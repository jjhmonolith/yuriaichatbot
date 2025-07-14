"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PassageSetController_1 = require("../../controllers/PassageSetController");
const router = (0, express_1.Router)();
// LEGACY 지문세트 라우트 (하위 호환성)
router.get('/', PassageSetController_1.PassageSetController.getAllPassageSets); // 전체 목록
router.get('/search', PassageSetController_1.PassageSetController.getAllPassageSets); // 전체 검색
router.get('/:id', PassageSetController_1.PassageSetController.getPassageSet);
router.put('/:id', PassageSetController_1.PassageSetController.updatePassageSet);
router.delete('/:id', PassageSetController_1.PassageSetController.deletePassageSet);
router.post('/:id/regenerate-qr', PassageSetController_1.PassageSetController.regenerateQRCode);
router.get('/:id/qr-image', PassageSetController_1.PassageSetController.getQRCodeImage);
exports.default = router;
