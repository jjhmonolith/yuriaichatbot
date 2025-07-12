"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DashboardController_1 = require("../../controllers/DashboardController");
const router = (0, express_1.Router)();
// 대시보드 통계 및 활동 라우트
router.get('/stats', DashboardController_1.DashboardController.getStats);
router.get('/recent-activity', DashboardController_1.DashboardController.getRecentActivity);
exports.default = router;
