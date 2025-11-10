// File: src/store/authStore.js
import { create } from 'zustand';
import {
  loginUser,
  registerUser,
  logoutUser,
} from '../services/authService.js';
import { getMyProfile } from '../services/userService.js'; 
import toast from 'react-hot-toast';

const useAuthStore = create((set) => ({
  user: null,
  // [THÊM] State để lưu VIP tiếp theo
  nextVipLevel: null, 
  isLoading: false, 
  error: null,
  isAuthLoading: true, 

  checkAuthStatus: async () => {
    try {
      // API getMyProfile (từ file userService) giờ trả về { data: { user, nextVipLevel } }
      const { data } = await getMyProfile(); 
      
      // [SỬA] Lưu cả user và nextVipLevel vào store
      set({ 
        user: data.user, 
        nextVipLevel: data.nextVipLevel, // <-- LƯU Ở ĐÂY
        isAuthLoading: false 
      });
    } catch (err) {
      set({ user: null, nextVipLevel: null, isAuthLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // API login cũng cần trả về { user, nextVipLevel }
      // (Bạn sẽ cần sửa auth.controller.js - login)
      const { data } = await loginUser(credentials); 
      
      // [SỬA] Lưu cả hai khi login
      set({ 
        user: data.user, 
        nextVipLevel: data.nextVipLevel, // <-- LƯU Ở ĐÂY
        isLoading: false 
      });
      toast.success('Đăng nhập thành công!');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi đăng nhập';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  register: async (userData) => {
    // (Giữ nguyên, register không cần login)
    set({ isLoading: true, error: null });
    try {
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

  logout: async () => {
    set({ isLoading: true, error: null }); 
    try {
      await logoutUser(); 
      // [SỬA] Xóa hết state khi logout
      set({ user: null, nextVipLevel: null, isLoading: false }); 
      toast.success('Đăng xuất thành công!');
    } catch (err) {
      set({ user: null, nextVipLevel: null, isLoading: false }); 
      const errorMsg = err.response?.data?.message || 'Lỗi khi đăng xuất';
      toast.error(errorMsg);
    }
  },
}));

export { useAuthStore };