// File: backend/server/validations/supplierSubmission.validation.js
import { z } from 'zod';

// Lấy ENUM từ schema
const ItemUnitEnum = z.enum(['PIECE', 'STACK', 'SHULKER']);

// POST /
const createSubmission = {
  body: z.object({
    supplierNotes: z.string().optional(),
    details: z
      .array(
        z.object({
          itemId: z.string().uuid(),
          quantity: z.number().int().positive(),
          unit: ItemUnitEnum,
          suggestedPricePerUnitCoin: z
            .number()
            .positive()
            .or(z.string().regex(/^\d+(\.\d{1,2})?$/)), // Chấp nhận số hoặc string số
        })
      )
      .min(1, 'Phiếu nhập phải có ít nhất 1 vật phẩm'),
  }),
};

// PUT /:submissionId/approve
const approveSubmission = {
  params: z.object({
    submissionId: z.string().uuid(),
  }),
  body: z.object({
    adminNotes: z.string().optional(),
    // Admin phải chốt giá cuối cùng cho từng line item
    finalPrices: z
      .array(
        z.object({
          detailId: z.string().uuid(), // ID của SupplierSubmissionDetail
          finalPricePerUnitCoin: z
            .number()
            .nonnegative()
            .or(z.string().regex(/^\d+(\.\d{1,2})?$/)),
        })
      )
      .min(1),
  }),
};

// PUT /:submissionId/reject
const rejectSubmission = {
  params: z.object({
    submissionId: z.string().uuid(),
  }),
  body: z.object({
    adminNotes: z.string().optional(),
  }),
};

// GET /:submissionId
const getSubmissionById = {
  params: z.object({
    submissionId: z.string().uuid(),
  }),
};

export const supplierSubmissionValidation = {
  createSubmission,
  approveSubmission,
  rejectSubmission,
  getSubmissionById,
};