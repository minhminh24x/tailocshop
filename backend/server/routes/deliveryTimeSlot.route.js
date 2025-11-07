// server/routes/deliveryTimeSlot.route.js
import express from 'express';
import { deliveryTimeSlotController } from '../controllers/deliveryTimeSlot.controller.js';
import validate from '../middleware/validate.js';
import { deliveryTimeSlotValidation } from '../validations/index.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// === PUBLIC ROUTE ===
// Dành cho khách hàng khi đặt hàng
router.get('/active', deliveryTimeSlotController.getActiveSlots);
router.get('/public', deliveryTimeSlotController.getPublicDeliveryTimeSlots);
// === CÁC ROUTE CỦA ADMIN ===
router
  .route('/')
  .post(
    protect,
    authorize('ADMIN'),
    validate(authValidation.deliveryTimeSlotValidation.createTimeSlot),
    deliveryTimeSlotController.createDeliveryTimeSlot
  )
  .get(
    protect,
    authorize('ADMIN'),
    deliveryTimeSlotController.getAllDeliveryTimeSlots // Đây là route của Admin
  );
  
// (Admin xem tất cả, bao gồm cả slot đã bị tắt)
router.get(
  '/',
  protect,
  isAdmin,
  deliveryTimeSlotController.getAllSlots
);

router.patch(
  '/:id',
  protect,
  isAdmin,
  validate(deliveryTimeSlotValidation.updateSlotSchema),
  deliveryTimeSlotController.updateSlot
);

router.delete(
  '/:id',
  protect,
  isAdmin,
  validate(deliveryTimeSlotValidation.deleteSlotSchema),
  deliveryTimeSlotController.deleteSlot
);

export default router;