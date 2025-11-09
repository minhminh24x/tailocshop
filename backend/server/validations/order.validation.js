// server/validations/order.validation.js
import { z } from 'zod';
import pkg from '@prisma/client';

// ✅ Lấy enum từ Prisma
const { CurrencyType, OrderStatus, PaymentStatus } = pkg;

// ✅ Schema cho từng sản phẩm trong đơn hàng
const cartItemSchema = z.object({
  itemId: z.string({
    required_error: 'ID vật phẩm là bắt buộc',
  }).uuid('ID vật phẩm không hợp lệ'),
  quantity: z.number({
    required_error: 'Số lượng là bắt buộc',
  })
    .int('Số lượng phải là số nguyên')
    .positive('Số lượng phải lớn hơn 0'),
  currencyAtPurchase: z.nativeEnum(CurrencyType, {
    errorMap: () => ({ message: 'Loại tiền tệ không hợp lệ (USD hoặc COIN)' }),
  }),
});

// ✅ Schema khi tạo đơn hàng mới (client gửi từ FE)
const createOrderSchema = z.object({
  body: z.object({
    inGameName: z.string({
      required_error: 'Tên nhân vật trong game là bắt buộc',
    }).min(1, 'Tên nhân vật không được để trống'),

    deliveryTimeSlotId: z.string({
      required_error: 'Khung giờ giao hàng là bắt buộc',
    }).uuid('ID khung giờ giao hàng không hợp lệ'),

    notes: z.string().optional().nullable(),

    // ✅ Danh sách sản phẩm (ít nhất 1 item)
    items: z
      .array(cartItemSchema)
      .nonempty('Giỏ hàng không được để trống'),
  }),
});

// ✅ Schema lấy đơn hàng theo ID
const getOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID đơn hàng không hợp lệ'),
  }),
});

// ✅ Schema cập nhật đơn hàng cho admin
const updateOrderAdminSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID đơn hàng không hợp lệ'),
  }),
  body: z
    .object({
      status: z.nativeEnum(OrderStatus, {
        errorMap: () => ({ message: 'Trạng thái đơn hàng không hợp lệ' }),
      }).optional(),
      paymentStatus: z.nativeEnum(PaymentStatus, {
        errorMap: () => ({ message: 'Trạng thái thanh toán không hợp lệ' }),
      }).optional(),
      staffUserId: z
        .string()
        .uuid('ID nhân viên không hợp lệ')
        .nullable()
        .optional(),
    })
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

// ✅ Export tổng hợp
export const orderValidation = {
  createOrderSchema,
  getOrderSchema,
  updateOrderAdminSchema,
};
