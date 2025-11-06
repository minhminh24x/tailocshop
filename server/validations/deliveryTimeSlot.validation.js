// server/validations/deliveryTimeSlot.validation.js
import { z } from 'zod';

const createSlotSchema = z.object({
  body: z.object({
    displayText: z
      .string()
      .min(3, 'Nội dung hiển thị phải có ít nhất 3 ký tự'),
    isActive: z.boolean().default(true).optional(),
  }),
});

const updateSlotSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID khung giờ không hợp lệ'),
  }),
  body: createSlotSchema.shape.body.partial(), // .partial() = tất cả đều optional
});

const deleteSlotSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID khung giờ không hợp lệ'),
  }),
});

export const deliveryTimeSlotValidation = {
  createSlotSchema,
  updateSlotSchema,
  deleteSlotSchema,
};