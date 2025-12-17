// File: backend/server/routes/application.route.js
import express from 'express';
import { applicationController } from '../controllers/application.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route - Submit application
router.post('/', applicationController.submitApplication);

// Admin routes
router.get(
    '/',
    protect,
    authorize('ADMIN'),
    applicationController.getApplications
);

router.get(
    '/:id',
    protect,
    authorize('ADMIN'),
    applicationController.getApplicationById
);

router.put(
    '/:id/status',
    protect,
    authorize('ADMIN'),
    applicationController.updateApplicationStatus
);

export default router;
