// server/utils/asyncHandler.js

/**
 * Hàm này nhận vào một hàm controller (fn)
 * và trả về một hàm mới.
 * Hàm mới này sẽ thực thi fn,
 * và nếu có lỗi (promise bị rejected), nó sẽ bắt (catch)
 * và chuyển (pass) lỗi đó cho middleware 'next'.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export default asyncHandler;