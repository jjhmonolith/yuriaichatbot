import { Router } from 'express';
import { DashboardController } from '../../controllers/DashboardController';

const router = Router();

// 대시보드 통계 및 활동 라우트
router.get('/stats', DashboardController.getStats);
router.get('/recent-activity', DashboardController.getRecentActivity);

export default router;