// File: backend/server/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import prisma from '../lib/prisma.js';
import httpStatus from 'http-status';

/**
 * [ĐÃ SỬA LỖI & NÂNG CẤP]
 * Middleware 'protect'
 * - Thêm: Kiểm tra 'mustChangePassword'
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Lấy token từ cookie (Giữ nguyên logic của bạn)
  if (req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Bạn chưa đăng nhập, vui lòng đăng nhập');
  }

  try {
    // 2. Xác thực token (Giữ nguyên logic của bạn)
    // Hãy chắc chắn .env của bạn có JWT_SECRET_KEY
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3. Lấy thông tin user từ DB
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.id }, // Giữ nguyên 'payload.id'
      select: {
        id: true,
        email: true,
        role: true,
        inGameName: true,
        mustChangePassword: true, // [THÊM] Lấy cờ này
      },
    });

    if (!currentUser) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Người dùng của token này không còn tồn tại');
    }

    // 4. [LOGIC MỚI] Kiểm tra cờ bắt buộc đổi mật khẩu
    if (currentUser.mustChangePassword) {
      // Cho phép truy cập CHỈ endpoint 'change-password' và 'logout'
      // [SỬA] Bỏ /v1 vì routes thực tế không có /v1
      const isChangingPassword = req.originalUrl.includes('/api/users/change-password');
      const isLoggingOut = req.originalUrl.includes('/api/auth/logout');

      if (!isChangingPassword && !isLoggingOut) {
        // Nếu cố truy cập API khác
        const error = new ApiError(
          httpStatus.FORBIDDEN,
          'Bạn phải đổi mật khẩu lần đầu tiên để tiếp tục',
          true,
          { code: 'MUST_CHANGE_PASSWORD' } //
        );
        return next(error);
      }
    }
    // [KẾT THÚC LOGIC MỚI]

    // 5. Gắn toàn bộ thông tin user vào request
    req.user = currentUser;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Token đã hết hạn');
    }

    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token không hợp lệ hoặc lỗi truy vấn người dùng');
  }
});

/**
 * [SỬA] Middleware để kiểm tra vai trò (role)
 * @param {...string} requiredRoles - Các vai trò yêu cầu (ví dụ: 'ADMIN', 'STAFF')
 */
export const authorize = (...requiredRoles) => {
  return (req, res, next) => {
    // Phải dùng sau 'protect', nên req.user đã có
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Bạn không có quyền truy cập chức năng này'
      );
    }
    next();
  };
};

/**
 * Middleware kiểm tra xem user có phải là 'ADMIN' không
 * (Giữ nguyên hàm này vì nó được dùng ở nơi khác)
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    next(new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này'));
  }
};