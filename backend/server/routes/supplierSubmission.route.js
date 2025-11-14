// File: backend/server/routes/supplierSubmission.route.js
import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.js';
import { supplierSubmissionValidation } from '../validations/supplierSubmission.validation.js';
import { supplierSubmissionController } from '../controllers/supplierSubmission.controller.js';

const router = express.Router();

router
  .route('/')
  // Supplier tạo phiếu
  .post(
    auth('SUPPLIER'),
    validate(supplierSubmissionValidation.createSubmission),
    supplierSubmissionController.handleCreateSubmission
  )
  // Admin/Staff/Supplier xem list phiếu (Service sẽ tự lọc)
  .get(
    auth('ADMIN', 'STAFF', 'SUPPLIER'), 
    supplierSubmissionController.handleGetSubmissions
  );

router
  .route('/:submissionId')
  // Admin/Staff/Supplier xem chi tiết phiếu (Service sẽ tự lọc)
  .get(
    auth('ADMIN', 'STAFF', 'SUPPLIER'),
    validate(supplierSubmissionValidation.getSubmissionById),
    supplierSubmissionController.handleGetSubmissionById
  );

// Admin/Staff duyệt
router.put(
  '/:submissionId/approve',
  auth('ADMIN', 'STAFF'),
  validate(supplierSubmissionValidation.approveSubmission),
  supplierSubmissionController.handleApproveSubmission
);

// Admin/Staff từ chối
router.put(
  '/:submissionId/reject',
  auth('ADMIN', 'STAFF'),
  validate(supplierSubmissionValidation.rejectSubmission),
  supplierSubmissionController.handleRejectSubmission
);

export default router;