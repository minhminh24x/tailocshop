// File: backend/server/routes/export.route.js
import express from 'express';
import { exportController } from '../controllers/export.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All export routes require ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

// GET /api/export/orders - Export orders to CSV
router.get('/orders', exportController.exportOrders);

// GET /api/export/inventory - Export inventory to CSV
router.get('/inventory', exportController.exportInventory);

// GET /api/export/customers - Export customers to CSV
router.get('/customers', exportController.exportCustomers);

export default router;
