"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TextbookPassageMappingController_1 = require("../../controllers/TextbookPassageMappingController");
const router = (0, express_1.Router)({ mergeParams: true });
// 교재-지문세트 매핑 관리 라우트
router.get('/', TextbookPassageMappingController_1.TextbookPassageMappingController.getTextbookPassageSets);
router.post('/:passageSetId', TextbookPassageMappingController_1.TextbookPassageMappingController.addPassageSetToTextbook);
router.delete('/:passageSetId', TextbookPassageMappingController_1.TextbookPassageMappingController.removePassageSetFromTextbook);
router.put('/reorder', TextbookPassageMappingController_1.TextbookPassageMappingController.updatePassageSetOrder);
router.get('/:mappingId/qr-image', TextbookPassageMappingController_1.TextbookPassageMappingController.getMappingQRCodeImage);
exports.default = router;
