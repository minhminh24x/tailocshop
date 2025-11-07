// server/routes/item.route.js
import express from 'express';
import { itemController } from '../controllers/item.controller.js';

// [ĐÃ SỬA] Import 'validate' không có dấu {}
import validate from '../middleware/validate.js';

import { itemValidation } from '../validations/index.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// === PUBLIC ROUTES ===
router.get('/featured', itemController.getFeaturedItems);
router.get('/', itemController.getAllItems);
router.get(
  '/:slug/:unit',
  validate(itemValidation.getItemSchema),
  itemController.getItem
);

// === ADMIN ROUTES ===
router.post(
  '/',
  protect,
  isAdmin,
  validate(itemValidation.createItemSchema),
  itemController.createItem
);

router.patch(
  '/:id',
  protect,
  isAdmin,
  validate(itemValidation.updateItemSchema),
  itemController.updateItem
);

router.delete(
  '/:id',
  protect,
  isAdmin,
  validate(itemValidation.deleteItemSchema),
  itemController.deleteItem
);

export default router;