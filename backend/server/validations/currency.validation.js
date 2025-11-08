// File: backend/server/validations/currency.validation.js
// [CODE MỚI]
import { z } from 'zod';

const updateRateSchema = z.object({
  params: z.object({
    rateType: z.string().min(1, 'rateType là bắt buộc'),
  }),
  body: z.object({
    rate: z
      .number()
      .positive('Tỷ giá (rate) phải là số dương'),
  }),
});

export const currencyValidation = {
  updateRateSchema,
};