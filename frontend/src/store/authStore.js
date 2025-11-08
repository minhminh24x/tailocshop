// src/store/authStore.js
import { create } from 'zustand';
import {
  loginUser,
  registerUser,
  logoutUser,
} from '../services/authService.js';
// --- THÊM IMPORT MỚI ---
import { getMyProfile } from '../services/userService.js'; 
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  // 1. STATE (Dữ liệu)
  user: null,
  isLoading: false, // <-- Nên bắt đầu là false, vì nó chỉ true KHI bấm login/register
  error: null,
  isAuthLoading: true, // <-- Bắt đầu là true, chính xác!

  // 2. ACTIONS (Hàm cập nhật state)

  // --- HÀM KIỂM TRA PHIÊN ĐĂNG NHẬP (ĐÃ SỬA) ---
  checkAuthStatus: async () => {
    const token = localStorage.getItem('token');

    // Không cần set isAuthLoading: true, vì nó đã là true ngay từ đầu
    // set({ isAuthLoading: true }); // Dòng này có thể bỏ

    if (!token) {
      // === 💡 SỬA LỖI TẠI ĐÂY ===
      // Khi không có token (khách), set user: null và
      // quan trọng nhất là set isAuthLoading: false
      set({ user: null, isAuthLoading: false });
      // ========================
      return; 
    }
    
    try {
      // Gọi API /api/users/profile (tên hàm là getMyProfile theo code của bạn)
      const { data } = await getMyProfile();
      // Nếu thành công, server trả về user
      set({ user: data.user, isAuthLoading: false });
    } catch (err) {
      // Nếu lỗi 401 (token hết hạn hoặc không có)
      set({ user: null, isAuthLoading: false });
      // Xóa token hỏng nếu có
      localStorage.removeItem('token'); 
    }
  },

  // --- HÀM ĐĂNG NHẬP ---
  login: async (credentials) => {
    set({ isLoading: true, error: null }); // Dùng isLoading
    try {
      // ... (logic của bạn đã chuẩn)
      const { data } = await loginUser(credentials);
      set({ user: data.user, isLoading: false });
      toast.success('Đăng nhập thành công!');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi đăng nhập';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  // --- HÀM ĐĂNG KÝ ---
  register: async (userData) => {
    set({ isLoading: true, error: null }); // Dùng isLoading
    try {
      // ... (logic của bạn đã chuẩn)
      await registerUser(userData);
      set({ isLoading: false });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.'); 
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi đăng ký';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  // --- HÀM ĐĂNG XUẤT ---
  logout: async () => {
    set({ isLoading: true, error: null }); // Dùng isLoading
    try {
      // ... (logic của bạn đã chuẩn)
      await logoutUser();
      set({ user: null, isLoading: false }); 
      toast.success('Đăng xuất thành công!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi đăng xuất';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
    }
  },
}));