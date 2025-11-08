// File: frontend/src/store/cartStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';

// 🧮 Helper để tính lại subtotal & totalItems
const calculateTotals = (items) => {
  const subtotal = items.reduce(
    (sum, entry) => sum + entry.quantity * (entry.itemData.priceCoin || 0),
    0
  );
  const totalItems = items.reduce((sum, entry) => sum + entry.quantity, 0);
  return { subtotal, totalItems };
};

// 🛒 Helper để thêm hoặc cập nhật vật phẩm
const upsertItem = (items, itemToAdd, quantity) => {
  const existingItemIndex = items.findIndex(
    (entry) => entry.itemData.id === itemToAdd.id
  );

  const stock = itemToAdd.stockQuantity;

  if (existingItemIndex > -1) {
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
    if (quantity > stock) {
      toast.error(`Chỉ có thể thêm tối đa ${stock} vật phẩm này.`);
      return [...items, { itemData: itemToAdd, quantity: stock }];
    } else {
      toast.success('Đã thêm vật phẩm vào giỏ!');
      return [...items, { itemData: itemToAdd, quantity }];
    }
  }
};

// 🧠 STORE CHÍNH
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      totalItems: 0,

      // ➕ Thêm vật phẩm
      addItem: (itemData, quantity) =>
        set((state) => {
          const updatedItems = upsertItem(state.items, itemData, quantity);
          return { ...calculateTotals(updatedItems), items: updatedItems };
        }),

      // ❌ Xóa vật phẩm
      removeItem: (itemId) =>
        set((state) => {
          const updatedItems = state.items.filter(
            (entry) => entry.itemData.id !== itemId
          );
          return { ...calculateTotals(updatedItems), items: updatedItems };
        }),

      // 🔄 Cập nhật số lượng
      updateItemQuantity: (itemId, newQuantity) =>
        set((state) => {
          if (newQuantity <= 0) {
            const updatedItems = state.items.filter(
              (entry) => entry.itemData.id !== itemId
            );
            return { ...calculateTotals(updatedItems), items: updatedItems };
          }

          const itemEntry = state.items.find((e) => e.itemData.id === itemId);
          const stock = itemEntry?.itemData.stockQuantity || 0;
          let finalQuantity = newQuantity;

          if (newQuantity > stock) {
            toast.error(`Tồn kho chỉ còn ${stock}.`);
            finalQuantity = stock;
          }

          const updatedItems = state.items.map((entry) =>
            entry.itemData.id === itemId
              ? { ...entry, quantity: finalQuantity }
              : entry
          );

          return { ...calculateTotals(updatedItems), items: updatedItems };
        }),

      // 🧹 Xóa toàn bộ giỏ
      clearCart: () => set({ items: [], subtotal: 0, totalItems: 0 }),
    }),
    {
      name: 'tailocshop-cart-storage',
      storage: createJSONStorage(() => sessionStorage),

      // ✅ Tự động tính lại subtotal & totalItems khi load từ session
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          const totals = calculateTotals(state.items);
          // Gọi set qua useCartStore thay vì biến cục bộ
          useCartStore.setState({ ...totals });
        }
      },
    }
  )
);
