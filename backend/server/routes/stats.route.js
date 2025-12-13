// File: backend/server/routes/stats.route.js
import express from 'express';
import { statsController } from '../controllers/stats.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Tất cả routes đều yêu cầu Admin hoặc Staff
router.use(protect);
router.use(authorize('ADMIN', 'STAFF'));

// GET /api/stats/dashboard - Thống kê tổng quan
router.get('/dashboard', statsController.getDashboardStats);

// GET /api/stats/recent-orders - Đơn hàng gần đây
router.get('/recent-orders', statsController.getRecentOrders);

// GET /api/stats/low-stock - Sản phẩm sắp hết
router.get('/low-stock', statsController.getLowStockItems);

export default router;
