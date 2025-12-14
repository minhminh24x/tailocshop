// File: src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  loginUser,
  registerUser,
  logoutUser,
} from '../services/authService.js';
import { getMyProfile } from '../services/userService.js';
import toast from 'react-hot-toast';

export const useAuthStore = create(persist(
  (set, get) => ({
    user: null,
    nextVipLevel: null,
    isLoading: false,
    error: null,
    isAuthLoading: true,

    // Hàm này dùng để refresh user data (VIP, etc.)
    checkAuthStatus: async () => {
      try {
        const { data } = await getMyProfile();
        set({
          user: data.user,
          nextVipLevel: data.nextVipLevel,
          isAuthLoading: false
        });
      } catch (err) {
        // [FIX] Chỉ reset user nếu CHƯA có user (tức là đang check lần đầu khi F5)
        // Nếu đã có user (đã login) thì giữ nguyên, chỉ set isAuthLoading = false
        const currentUser = get().user;
        if (!currentUser) {
          set({ user: null, nextVipLevel: null, isAuthLoading: false });
        } else {
          // Giữ nguyên user hiện tại, chỉ cập nhật loading state
          set({ isAuthLoading: false });
        }
      }
    },

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        // 1. Gọi API đăng nhập
        const { data } = await loginUser(credentials);

        // 2. Lưu ngay user vào state
        set({
          user: data.user,
          isLoading: false
        });

        // 3. Kiểm tra đổi mật khẩu
        if (data.user.mustChangePassword) {
          toast.success('Đăng nhập thành công! Bạn cần đổi mật khẩu.');
          return '/profile';
        }

        // [FIX] Gọi checkAuthStatus để lấy đầy đủ VIP data
        // Đợi 100ms để cookie được set xong
        setTimeout(async () => {
          try {
            await get().checkAuthStatus();
          } catch (e) {
            console.log('Could not refresh VIP data');
          }
        }, 100);

        toast.success('Đăng nhập thành công!');

        // 4. Lấy role từ dữ liệu vừa login để điều hướng
        const loggedInUser = data.user;

        if (!loggedInUser || !loggedInUser.role) {
          return '/';
        }

        // 5. Điều hướng phân quyền
        switch (loggedInUser.role) {
          case 'ADMIN': return '/admin';
          case 'STAFF': return '/staff';
          case 'SUPPLIER': return '/supplier';
          case 'CUSTOMER': return '/';
          default: return '/';
        }

      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Lỗi khi đăng nhập';
        set({ error: errorMsg, isLoading: false });
        toast.error(errorMsg);
        // Ném lỗi để component bắt được nếu cần, 
        // nhưng ở LoginPage bạn đang không try/catch nên return false/null sẽ an toàn hơn
        return null;
      }
    },

    register: async (userData) => {
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
        // Xóa sạch state
        set({ user: null, nextVipLevel: null, isLoading: false, error: null });
        toast.success('Đăng xuất thành công!');
      } catch (err) {
        set({ user: null, nextVipLevel: null, isLoading: false, error: null });
        toast.error('Lỗi khi đăng xuất');
      }
    },
  }),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => localStorage),
  }
));

export default useAuthStore;