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
  isLoading: false,
  error: null,
  // --- THÊM STATE MỚI ---
  // isAuthLoading: Dùng để kiểm tra phiên đăng nhập khi tải trang.
  // Bắt đầu là 'true' để báo cho App biết "đang kiểm tra"
  isAuthLoading: true,

  // 2. ACTIONS (Hàm cập nhật state)

  // --- HÀM KIỂM TRA PHIÊN ĐĂNG NHẬP (MỚI) ---
  checkAuthStatus: async () => {
    // Không set isLoading = true, vì đây là tiến trình nền
    set({ isAuthLoading: true }); 
    try {
      // Gọi API /api/users/profile
      const { data } = await getMyProfile();
      // Nếu thành công (cookie hợp lệ), server trả về user
      set({ user: data.user, isAuthLoading: false });
    } catch (err) {
      // Nếu lỗi 401 (cookie hết hạn hoặc không có)
      set({ user: null, isAuthLoading: false });
    }
  },

  // --- HÀM ĐĂNG NHẬP ---
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
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
    set({ isLoading: true, error: null });
    try {
      await registerUser(userData);
      set({ isLoading: false });
      // Sửa lại thông báo cho rõ ràng hơn
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
    set({ isLoading: true, error: null });
    try {
      await logoutUser();
      set({ user: null, isLoading: false }); // Xóa user khỏi state
      toast.success('Đăng xuất thành công!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi đăng xuất';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
    }
  },
}));