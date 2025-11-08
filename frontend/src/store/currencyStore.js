// File: frontend/src/store/currencyStore.js
// [CODE MỚI]
import { create } from 'zustand';
import apiClient from '../services/apiClient.js';

// Tỷ giá mặc định nếu API lỗi, bạn có thể đặt là 100000
const FALLBACK_RATE = 100000; 
// Tên tỷ giá trong DB, ví dụ: "XU_TO_USD"
const RATE_NAME = 'XU_TO_USD'; 

export const useCurrencyStore = create((set) => ({
  // Giá trị tỷ giá (1 Xu = ? USD)
  rate: FALLBACK_RATE, 
  isLoading: true,
  error: null,

  /**
   * Gọi API backend để lấy tỷ giá thật từ DB
   */
  fetchRate: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get(`/rates/${RATE_NAME}`);
      
      // response.data.rate sẽ là "100000.00" (dạng chuỗi)
      const numericRate = parseFloat(response.data.rate);
      
      if (!isNaN(numericRate) && numericRate > 0) {
        set({ rate: numericRate, isLoading: false });
      } else {
        set({ rate: FALLBACK_RATE, isLoading: false });
      }
    } catch (err) {
      console.error('Không thể tải tỷ giá, sử dụng tỷ giá dự phòng.', err);
      set({ rate: FALLBACK_RATE, isLoading: false, error: 'Failed to fetch rate' });
    }
  },
}));