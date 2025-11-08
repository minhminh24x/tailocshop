// File: frontend/src/utils/formatNumber.js
// [CODE MỚI]

/**
 * Định dạng một số theo yêu cầu:
 * - Dùng dấu '.' làm phân cách hàng ngàn (ví dụ: 6.000)
 * - Dùng dấu '.' làm phân cách thập phân (ví dụ: 1.5)
 * - Tự động bỏ phần thập phân '.00' nếu là số nguyên
 * @param {number | string} value - Giá trị số cần định dạng
 * @returns {string} - Chuỗi đã định dạng
 */
export const formatNumber = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return '0';
  }

  // Chuyển số về chuỗi, tự động xử lý (1.50 -> "1.5", 6000.00 -> "6000")
  let parts = num.toString().split('.');

  // Thêm dấu chấm hàng ngàn cho phần nguyên
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Nối phần nguyên và phần thập phân (nếu có)
  return parts.join('.');
};