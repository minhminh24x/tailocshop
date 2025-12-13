// server/validations/deliveryTimeSlot.validation.js
import { z } from 'zod';

const createSlotSchema = z.object({
  body: z.object({
    displayText: z
      .string()
      .min(3, 'Nội dung hiển thị phải có ít nhất 3 ký tự'),
    dayOfWeek: z.number().int().min(0).max(7).default(0),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ bắt đầu không hợp lệ (HH:mm)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ kết thúc không hợp lệ (HH:mm)'),
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