// File: backend/server/routes/supplierSubmission.route.js
import express from 'express';

// [SỬA LỖI] Import 'protect' và 'authorize' thay vì 'auth'
import { protect, authorize } from '../middleware/auth.middleware.js'; 

import validate from '../middleware/validate.js';
import { supplierSubmissionValidation } from '../validations/supplierSubmission.validation.js';
import { supplierSubmissionController } from '../controllers/supplierSubmission.controller.js';

const router = express.Router();

router
  .route('/')
  // Supplier tạo phiếu
  .post(
    protect, // 1. Yêu cầu đăng nhập
    authorize('SUPPLIER'), // 2. Chỉ Supplier
    validate(supplierSubmissionValidation.createSubmission),
    supplierSubmissionController.handleCreateSubmission
  )
  // Admin/Staff/Supplier xem list phiếu (Service sẽ tự lọc)
  .get(
    protect, // 1. Yêu cầu đăng nhập
    authorize('ADMIN', 'STAFF', 'SUPPLIER'), // 2. Chỉ 3 role này
    supplierSubmissionController.handleGetSubmissions
  );

router
  .route('/:submissionId')
  // Admin/Staff/Supplier xem chi tiết phiếu (Service sẽ tự lọc)
  .get(
    protect, // 1. Yêu cầu đăng nhập
    authorize('ADMIN', 'STAFF', 'SUPPLIER'), // 2. Chỉ 3 role này
    validate(supplierSubmissionValidation.getSubmissionById),
    supplierSubmissionController.handleGetSubmissionById
  );

// Admin/Staff duyệt
router.put(
  '/:submissionId/approve',
  protect, // 1. Yêu cầu đăng nhập
  authorize('ADMIN', 'STAFF'), // 2. Chỉ Admin/Staff
  validate(supplierSubmissionValidation.approveSubmission),
  supplierSubmissionController.handleApproveSubmission
);

// Admin/Staff từ chối
router.put(
  '/:submissionId/reject',
  protect, // 1. Yêu cầu đăng nhập
  authorize('ADMIN', 'STAFF'), // 2. Chỉ Admin/Staff
  validate(supplierSubmissionValidation.rejectSubmission),
  supplierSubmissionController.handleRejectSubmission
);

export default router;