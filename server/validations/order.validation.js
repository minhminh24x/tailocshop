// server/validations/order.validation.js
import { z } from 'zod';
import { CurrencyType } from '@prisma/client';

// Schema cho 1 item trong giỏ hàng
const cartItemSchema = z.object({
  itemId: z.string().uuid('ID vật phẩm không hợp lệ'),
  quantity: z.number().int().positive('Số lượng phải là số nguyên dương'),
});

const createOrderSchema = z.object({
  body: z.object({
    deliveryTimeSlotId: z.string().uuid('ID khung giờ giao hàng là bắt buộc'),
    currencyUsed: z.nativeEnum(CurrencyType, {
      errorMap: () => ({ message: 'Loại tiền tệ không hợp lệ (USD, COIN)' }),
    }),
    notes: z.string().optional().nullable(),
    // items phải là một mảng chứa ít nhất 1 vật phẩm
    items: z
      .array(cartItemSchema)
      .nonempty('Giỏ hàng không được để trống'),
  }),
});

const getOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID đơn hàng không hợp lệ'),
  }),
});

// Import thêm 2 ENUM
import { OrderStatus, PaymentStatus } from '@prisma/client';

const updateOrderAdminSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID đơn hàng không hợp lệ'),
  }),
  body: z
    .object({
      status: z.nativeEnum(OrderStatus, {
        errorMap: () => ({ message: 'Trạng thái đơn hàng không hợp lệ' }),
      }),
      paymentStatus: z.nativeEnum(PaymentStatus, {
        errorMap: () => ({ message: 'Trạng thái thanh toán không hợp lệ' }),
      }),
      staffUserId: z.string().uuid('ID nhân viên không hợp lệ').nullable(),
    })
    .partial() // Admin có thể chỉ cập nhật 1 trong các trường
    .refine(
      (data) =>
        data.status !== undefined ||
        data.paymentStatus !== undefined ||
        data.staffUserId !== undefined,
      {
        message: 'Cần cung cấp ít nhất một trường để cập nhật',
      }
    ),
});

export const orderValidation = {
  createOrderSchema,
  getOrderSchema,
  updateOrderAdminSchema,
};