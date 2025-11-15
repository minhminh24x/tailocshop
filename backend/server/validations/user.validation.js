// File: backend/server/validations/user.validation.js
import { z } from 'zod';

// [SỬA] Bọc toàn bộ bằng z.object()
const adminCreateUser = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    inGameName: z.string().min(3, 'Tên in-game phải có ít nhất 3 ký tự'),
    role: z.enum(['STAFF', 'SUPPLIER'], {
      required_error: 'Chỉ có thể tạo role STAFF hoặc SUPPLIER',
    }),
  }),
  // Thêm query và params rỗng để Zod không báo lỗi
  query: z.object({}),
  params: z.object({}),
});

// [SỬA] Bọc toàn bộ bằng z.object()
const changeMyPassword = z.object({
  body: z
    .object({
      oldPassword: z.string().min(1, 'Mật khẩu cũ là bắt buộc'),
      newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
      confirmNewPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: 'Mật khẩu mới không khớp',
      path: ['confirmNewPassword'],
    }),
  // Thêm query và params rỗng
  query: z.object({}),
  params: z.object({}),
});

export const userValidation = {
  adminCreateUser,
  changeMyPassword,
};