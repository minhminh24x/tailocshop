// server/routes/deliveryTimeSlot.route.js
import express from 'express';
import { deliveryTimeSlotController } from '../controllers/deliveryTimeSlot.controller.js';
import validate from '../middleware/validate.js';
import { deliveryTimeSlotValidation } from '../validations/index.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// === PUBLIC ROUTES ===
// Dành cho khách hàng khi đặt hàng
router.get('/active', deliveryTimeSlotController.getPublicDeliveryTimeSlots);

// === ADMIN ROUTES ===
router
  .route('/')
  .post(
    protect,
    authorize('ADMIN'),
    validate(deliveryTimeSlotValidation.createSlotSchema),
    deliveryTimeSlotController.createSlot
  )
  .get(
    protect,
    authorize('ADMIN'),
    deliveryTimeSlotController.getAllDeliveryTimeSlots // ✅ dùng đúng hàm
  );

router
  .route('/:id')
  .patch(
    protect,
    authorize('ADMIN'),
    validate(deliveryTimeSlotValidation.updateSlotSchema),
    deliveryTimeSlotController.updateSlot
  )
  .delete(
    protect,
    authorize('ADMIN'),
    validate(deliveryTimeSlotValidation.deleteSlotSchema),
    deliveryTimeSlotController.deleteSlot
  );

export default router;
