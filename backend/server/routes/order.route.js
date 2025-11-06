// server/routes/order.route.js
import express from 'express';
import { orderController } from '../controllers/order.controller.js';
import validate from '../middleware/validate.js';
import { orderValidation } from '../validations/index.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// === CUSTOMER ROUTES (Cần đăng nhập) ===
// 'protect' sẽ đảm bảo req.user tồn tại
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

// === ADMIN ROUTES (Cần đăng nhập + quyền Admin) ===
router.get(
  '/admin/all',
  protect,
  isAdmin,
  orderController.getAllOrdersAdmin
);

router.get(
  '/admin/:id',
  protect,
  isAdmin,
  validate(orderValidation.getOrderSchema),
  orderController.getOrderByIdAdmin
);

router.patch(
  '/admin/:id',
  protect,
  isAdmin,
  validate(orderValidation.updateOrderAdminSchema),
  orderController.updateOrderAdmin
);

export default router;