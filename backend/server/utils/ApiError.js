// server/utils/ApiError.js
import httpStatus from 'http-status';

/**
 * Lớp Error tùy chỉnh để xử lý các lỗi API
 * mà chúng ta có thể kiểm soát được (ví dụ: 404 Not Found)
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    // Gọi constructor của lớp Error cha (Error)
    super(message);
    
    // Gán các thuộc tính tùy chỉnh
    this.statusCode = statusCode;
    // Kiểm tra xem statusCode có phải là 4xx (lỗi client) không
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational; // Lỗi do hoạt động (ví dụ: nhập sai id)
    
    // Ghi lại stack trace nếu có
    if (stack) {
      this.stack = stack;
    } else {
      // Tự động tạo stack trace
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;