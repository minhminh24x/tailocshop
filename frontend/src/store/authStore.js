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
        // 1. API login (authService) PHẢI trả về user data cơ bản
        // bao gồm { id, email, role, mustChangePassword }
        const { data } = await loginUser(credentials);

        // 2. Set user cơ bản vào state
        set({
          user: data.user,
          isLoading: false
        });

        // 3. [FIX QUAN TRỌNG] Kiểm tra cờ đổi mật khẩu NGAY LẬP TỨC
        if (data.user.mustChangePassword) {
          toast.success('Đăng nhập thành công! Bạn cần đổi mật khẩu.');
          // Không cần gọi checkAuthStatus, chuyển thẳng đến trang profile
          return '/profile';
        }

        // 4. Nếu KHÔNG phải đổi, lúc này mới gọi checkAuthStatus
        // (Và Lỗi 1 ở backend cũng phải được fix)
        await get().checkAuthStatus();

        toast.success('Đăng nhập thành công!');

        // 5. Sau khi gọi checkAuthStatus()
        await get().checkAuthStatus();

        // 6. Lấy user cập nhật từ state
        const loggedInUser = get().user;

        // [FIX QUAN TRỌNG]: Nếu không lấy được user đầy đủ → quay về trang chủ
        if (!loggedInUser || !loggedInUser.role) {
          console.warn("Không thể tải dữ liệu user từ checkAuthStatus");
          toast.error('Không thể tải thông tin tài khoản.');
          return '/'; // hoặc chuyển về '/login'
        }

        // 7. Điều hướng dựa trên role
        switch (loggedInUser.role) {
          case 'ADMIN': return '/admin';
          case 'STAFF': return '/staff';
          case 'SUPPLIER': return '/supplier';
          case 'CUSTOMER': return '/users'; // Bổ sung nếu cần
          default: return '/';
        }

      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Lỗi khi đăng nhập';
        set({ error: errorMsg, isLoading: false });
        toast.error(errorMsg);
        throw err;
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