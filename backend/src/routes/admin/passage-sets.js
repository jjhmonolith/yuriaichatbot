"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PassageSetController_1 = require("../../controllers/PassageSetController");
const router = (0, express_1.Router)();
// 독립적인 지문세트 관리 라우트
router.get('/', PassageSetController_1.PassageSetController.getAllPassageSets);
router.post('/', PassageSetController_1.PassageSetController.createPassageSet);
router.get('/:id', PassageSetController_1.PassageSetController.getPassageSet);
router.put('/:id', PassageSetController_1.PassageSetController.updatePassageSet);
router.delete('/:id', PassageSetController_1.PassageSetController.deletePassageSet);
router.post('/:id/regenerate-qr', PassageSetController_1.PassageSetController.regenerateQRCode);
router.get('/:id/qr-image', PassageSetController_1.PassageSetController.getQRCodeImage);
exports.default = router;
