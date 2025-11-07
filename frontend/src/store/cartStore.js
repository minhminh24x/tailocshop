// File: frontend/src/store/cartStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';

// Hàm helper để xử lý logic thêm/cập nhật giỏ hàng
const upsertItem = (items, itemToAdd, quantity) => {
  const existingItemIndex = items.findIndex(
    (entry) => entry.itemData.id === itemToAdd.id
  );

  // Kiểm tra tồn kho
  const stock = itemToAdd.stockQuantity;
  
  if (existingItemIndex > -1) {
    // Vật phẩm đã có trong giỏ -> Cập nhật số lượng
    const newItems = [...items];
    const newQuantity = newItems[existingItemIndex].quantity + quantity;

    if (newQuantity > stock) {
      toast.error(`Chỉ có thể thêm tối đa ${stock} vật phẩm này.`);
      newItems[existingItemIndex].quantity = stock;
    } else {
      newItems[existingItemIndex].quantity = newQuantity;
      toast.success('Đã cập nhật số lượng trong giỏ!');
    }
    return newItems;

  } else {
    // Vật phẩm chưa có trong giỏ -> Thêm mới
    if (quantity > stock) {
      toast.error(`Chỉ có thể thêm tối đa ${stock} vật phẩm này.`);
      return [...items, { itemData: itemToAdd, quantity: stock }];
    } else {
      toast.success('Đã thêm vật phẩm vào giỏ!');
      return [...items, { itemData: itemToAdd, quantity }];
    }
  }
};

export const useCartStore = create(
  persist(
    (set) => ({
      // 1. STATE
      items: [], // Sẽ là một mảng [{ itemData: {...}, quantity: 1 }, ...]

      // 2. ACTIONS (Hàm cập nhật state)
      
      /**
       * Thêm một số lượng vật phẩm vào giỏ
       * @param {object} itemData - Toàn bộ object item
       * @param {number} quantity - Số lượng muốn thêm
       */
      addItem: (itemData, quantity) =>
        set((state) => ({
          items: upsertItem(state.items, itemData, quantity),
        })),

      /**
       * Xóa 1 vật phẩm khỏi giỏ
       * @param {string} itemId - ID của vật phẩm
       */
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((entry) => entry.itemData.id !== itemId),
        })),

      /**
       * Cập nhật số lượng chính xác
       * @param {string} itemId 
       * @param {number} newQuantity 
       */
      updateItemQuantity: (itemId, newQuantity) =>
        set((state) => {
          // Nếu số lượng là 0 hoặc âm, xóa vật phẩm
          if (newQuantity <= 0) {
            return {
              items: state.items.filter((entry) => entry.itemData.id !== itemId),
            };
          }

          // Kiểm tra tồn kho
          const itemEntry = state.items.find(e => e.itemData.id === itemId);
          const stock = itemEntry?.itemData.stockQuantity || 0;
          
          let finalQuantity = newQuantity;
          if (newQuantity > stock) {
            toast.error(`Tồn kho chỉ còn ${stock}.`);
            finalQuantity = stock;
          }

          return {
            items: state.items.map((entry) =>
              entry.itemData.id === itemId
                ? { ...entry, quantity: finalQuantity }
                : entry
            ),
          };
        }),
      
      /**
       * Xóa sạch giỏ hàng (dùng khi đăng xuất hoặc đặt hàng xong)
       */
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'tailocshop-cart-storage',
      // [ĐÁP ỨNG REQ 1]
      // Dùng sessionStorage thay vì localStorage.
      // Dữ liệu sẽ mất khi người dùng đóng trình duyệt.
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);