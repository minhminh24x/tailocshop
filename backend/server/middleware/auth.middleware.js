// File: server/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import prisma from '../lib/prisma.js';
import httpStatus from 'http-status';

/**
 * [ĐÃ SỬA LỖI]
 * Middleware 'protect'
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Lấy token từ cookie
  if (req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Bạn chưa đăng nhập, vui lòng đăng nhập');
  }

  try {
    // 2. Xác thực token (Đã đúng)
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3. Lấy thông tin user từ DB
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.id },
      // [SỬA LỖI] Sửa lại khối 'select' cho đúng schema
      select: {
        id: true,
        email: true,
        // 'name: true,' đã bị xóa
        role: true, // Đảm bảo model User của bạn có trường 'role'
        inGameName: true, // [THÊM VÀO] Lấy 'inGameName'
      },
    });

    if (!currentUser) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Người dùng của token này không còn tồn tại');
    }

    // 4. Gắn toàn bộ thông tin user vào request
    req.user = currentUser;
    next();

  } catch (error) {
    // [LƯU Ý]
    // Lỗi Prisma (như lỗi 'name' không tồn tại) cũng sẽ bị bắt ở đây
    // và trả về 'Token không hợp lệ'.
    // Đây là lý do bạn thấy thông báo lỗi này.

    if (error.name === 'TokenExpiredError') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Token đã hết hạn');
    }
    
    // Nếu lỗi là do Prisma (giống như vừa rồi) hoặc JWT sai
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token không hợp lệ hoặc lỗi truy vấn người dùng');
  }
});

/**
 * Middleware để kiểm tra vai trò (role)
 * @param {string} requiredRole - Vai trò yêu cầu (ví dụ: 'ADMIN')
 */
export const authorize = (requiredRole) => {
  return (req, res, next) => {
    // Phải dùng sau 'protect', nên req.user đã có
    if (!req.user || req.user.role !== requiredRole) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Bạn không có quyền truy cập chức năng này'
      );
    }
    next();
  };
};
/**
 * [HÀM MỚI] (Giữ nguyên, đã đúng)
 * Middleware kiểm tra xem user có phải là 'ADMIN' không
 */
export const isAdmin = (req, res, next) => {
  // Hàm 'protect' đã chạy trước và gắn `req.user`
  if (req.user && req.user.role === 'ADMIN') {
    // Nếu đúng là ADMIN, cho phép đi tiếp
    next();
  } else {
    // Nếu không, ném lỗi 403 Forbidden (Cấm truy cập)
    next(new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này'));
  }
};