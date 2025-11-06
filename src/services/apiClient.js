// src/services/apiClient.js
import axios from 'axios';

// Tạo một instance của Axios
const apiClient = axios.create({
  // URL gốc của backend API
  baseURL: 'http://localhost:8080/api',

  // Đây là cấu hình mấu chốt:
  // Cho phép trình duyệt tự động gửi và nhận cookie
  // (bao gồm cả httpOnly access_token) khi gọi API
  withCredentials: true,
});

/*
 * (Tùy chọn nâng cao) Bạn có thể thêm Interceptors tại đây
 * Ví dụ: Tự động xử lý lỗi 401 (Unauthorized)
 *
 * apiClient.interceptors.response.use(
 * (response) => response,
 * (error) => {
 * if (error.response?.status === 401) {
 * // Xử lý logout hoặc refresh token tại đây
 * console.error('Chưa xác thực hoặc token hết hạn');
 * // window.location.href = '/login'; // Ví dụ
 * }
 * return Promise.reject(error);
 * }
 * );
 */

export default apiClient;