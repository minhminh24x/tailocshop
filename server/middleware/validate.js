// server/middleware/validate.js
import httpStatus from 'http-status';
// [SỬA 1] Import cả 'ZodError' để check 'instanceof' một cách an toàn
import { z, ZodError } from 'zod'; 

/**
 * Middleware này nhận vào một Zod schema.
 * Nó sẽ trả về một middleware khác của Express.
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Thử parse (validate) req.body, req.query, req.params
    // dựa trên schema bạn cung cấp
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Nếu không có lỗi, đi tiếp
    return next();
  } catch (error) {
    // [SỬA 2] Check 'instanceof' bằng 'ZodError' đã import
    if (error instanceof ZodError) {
      
      // [SỬA 3] Dùng 'error.issues' thay vì 'error.errors'
      // Đây là thuộc tính ổn định và chính thức của Zod
      const errorMessages = error.issues.map((issue) => {
        // 'issue.path' cho biết trường nào bị lỗi (ví dụ: ['body', 'name'])
        return `${issue.path.at(-1)}: ${issue.message}`;
      });

      // Trả về lỗi 400 (BAD_REQUEST)
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: errorMessages,
      });
    }

    // Nếu là lỗi khác (không phải ZodError)
    return next(error);
  }
};

export default validate;