// src/store/authStore.js
import { create } from 'zustand';
import {
  loginUser,
  registerUser,
  logoutUser,
} from '../services/authService.js';
import toast from 'react-hot-toast';

// create(set => (...)) là cú pháp của Zustand
export const useAuthStore = create((set) => ({
  // 1. STATE (Dữ liệu)
  user: null,         // Thông tin user, null = chưa đăng nhập
  isLoading: false,   // Đang loading (để hiện spinner...)
  error: null,        // Lỗi (nếu có)

  // 2. ACTIONS (Hàm cập nhật state)

  // --- HÀM ĐĂNG NHẬP ---
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // Gọi service API (file backend của chúng ta trả về { message, user })
      const { data } = await loginUser(credentials);
      
      // Lưu user vào state
      set({ user: data.user, isLoading: false });

      toast.success('Đăng nhập thành công!');

      return true; // Báo thành công
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi đăng nhập';
      set({ error: errorMsg, isLoading: false });
      return false; // Báo thất bại
    }
  },

  // --- HÀM ĐĂNG KÝ ---
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      // Gọi service API
      await registerUser(userData);
      
      set({ isLoading: false });

      toast.success('Đăng ký tài khoản thành công!');

      return true; // Báo thành công
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi đăng ký';
      set({ error: errorMsg, isLoading: false });
      return false; // Báo thất bại
    }
  },

  // --- HÀM ĐĂNG XUẤT ---
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await logoutUser(); // Gọi API backend để xóa cookie
      set({ user: null, isLoading: false }); // Xóa user khỏi state
      
      toast.success('Đăng xuất thành công!');

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi đăng xuất';
      set({ error: errorMsg, isLoading: false });
    }
  },
}));