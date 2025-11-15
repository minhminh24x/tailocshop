// File: backend/server/routes/order.route.js
import express from 'express';
import { orderController } from '../controllers/order.controller.js';
import validate from '../middleware/validate.js';
import { orderValidation } from '../validations/index.js'; // Giữ nguyên

// [SỬA 1] Import 'protect' VÀ 'authorize'
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// === CUSTOMER ROUTES (Giữ nguyên) ===
router.post(
  '/',
  protect,
  validate(orderValidation.createOrderSchema),
  orderController.createOrder
);

router.get('/my-orders', protect, orderController.getMyOrders);

router.get(
  '/my-orders/:id',
  protect,
  validate(orderValidation.getOrderSchema),
  orderController.getMyOrderById
);

// === ADMIN & STAFF ROUTES ===

// [SỬA 2] Đổi '/admin/all' thành '/admin' cho nhất quán
router.get(
  '/admin',
  protect,
  authorize('ADMIN', 'STAFF'), // [SỬA 3] Dùng authorize
  orderController.getAllOrdersAdmin
);

// [SỬA 4] Gộp các route '/admin/:id' lại
router
  .route('/admin/:id')
  .get(
    protect,
    authorize('ADMIN', 'STAFF'), // Dùng authorize
    validate(orderValidation.getOrderSchema),
    orderController.getOrderByIdAdmin
  )
  .patch( // (Bạn dùng patch, tôi giữ nguyên)
    protect,
    authorize('ADMIN', 'STAFF'), // Dùng authorize
    validate(orderValidation.updateOrderAdminSchema),
    orderController.updateOrderAdmin
  );

// (Các route .get và .patch riêng lẻ đã được gộp ở trên)

export default router;