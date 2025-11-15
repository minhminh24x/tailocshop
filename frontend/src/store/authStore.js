// File: src/store/authStore.js
import { create } from 'zustand';
// [SỬA] Import 'persist' để lưu state khi F5
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  loginUser,
  registerUser,
  logoutUser,
} from '../services/authService.js';
import { getMyProfile } from '../services/userService.js';
import toast from 'react-hot-toast';

// [SỬA] Bọc 'create' bằng 'persist'
export const useAuthStore = create(persist(
  (set, get) => ({ // Thêm 'get' để gọi hàm nội bộ
    user: null,
    nextVipLevel: null,
    isLoading: false, // Dùng cho các hành động (login, register)
    error: null,
    isAuthLoading: true, // Dùng cho việc tải trang ban đầu

    checkAuthStatus: async () => {
      // Hàm này (getMyProfile) được gọi khi tải lại trang
      try {
        const { data } = await getMyProfile();
        set({
          user: data.user,
          nextVipLevel: data.nextVipLevel,
          isAuthLoading: false
        });
      } catch (err) {
        set({ user: null, nextVipLevel: null, isAuthLoading: false });
      }
    },

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        // 1. API login (authService) chỉ cần trả về user
        const { data } = await loginUser(credentials);

        // 2. Set user cơ bản vào state
        set({
          user: data.user, // Giả định API login trả về { data: { user: ... } }
          isLoading: false
        });

        // 3. [QUAN TRỌNG] Gọi lại checkAuthStatus để lấy full profile (gồm nextVipLevel)
        await get().checkAuthStatus();

        toast.success('Đăng nhập thành công!');

        // 4. [QUAN TRỌNG] Trả về redirect path cho LoginPage
        const loggedInUser = get().user; // Lấy user đầy đủ sau khi checkAuthStatus

        if (loggedInUser.mustChangePassword) {
          return '/profile'; // Bắt buộc đổi mật khẩu
        }

        switch (loggedInUser.role) {
          case 'ADMIN':
            return '/admin';
          case 'STAFF':
            return '/staff';
          case 'SUPPLIER':
            return '/supplier';
          default:
            return '/';
        }

      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Lỗi khi đăng nhập';
        set({ error: errorMsg, isLoading: false });
        toast.error(errorMsg);
        throw err; // Ném lỗi để LoginPage (nơi gọi) bắt được
      }
    },

    register: async (userData) => {
      // Logic register của bạn đã ổn
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
        // Xóa tất cả state
        set({ user: null, nextVipLevel: null, isLoading: false, error: null });
        toast.success('Đăng xuất thành công!');
      } catch (err) {
        // Kể cả khi API lỗi, vẫn xóa state ở local
        set({ user: null, nextVipLevel: null, isLoading: false, error: null });
        const errorMsg = err.response?.data?.message || 'Lỗi khi đăng xuất';
        toast.error(errorMsg);
      }
    },
  }),
  {
    // Cấu hình persist
    name: 'auth-storage', // Tên của key trong localStorage
    storage: createJSONStorage(() => localStorage),
  }
));

// [SỬA] Dùng export default để nhất quán với project
export default useAuthStore;