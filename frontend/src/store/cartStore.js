// File: frontend/src/store/cartStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { UNIT_MULTIPLIER } from '../utils/unitUtils.js';

// 🧮 Helper để tính lại subtotal & totalItems
const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, entry) => {
    // [SỬA] Sử dụng giá từ basePriceCoin hoặc priceCoin, tính theo unit
    const basePrice = parseFloat(entry.itemData.basePriceCoin) || parseFloat(entry.itemData.priceCoin) || 0;
    const baseUnit = entry.itemData.baseUnit || 'PIECE';
    const entryUnit = entry.unit || 'PIECE';

    // Tính giá cho unit của entry
    const baseMultiplier = UNIT_MULTIPLIER[baseUnit] || 1;
    const entryMultiplier = UNIT_MULTIPLIER[entryUnit] || 1;
    const pricePerUnit = basePrice * (entryMultiplier / baseMultiplier);

    return sum + entry.quantity * pricePerUnit;
  }, 0);

  const totalItems = items.reduce((sum, entry) => sum + entry.quantity, 0);
  return { subtotal, totalItems };
};

// 🛒 Helper để thêm hoặc cập nhật vật phẩm
// [SỬA] Thêm unit parameter - cùng item + khác unit = khác dòng trong cart
const upsertItem = (items, itemToAdd, quantity, unit = 'PIECE') => {
  // Key duy nhất = itemId + unit
  const existingItemIndex = items.findIndex(
    (entry) => entry.itemData.id === itemToAdd.id && entry.unit === unit
  );

  // Tính stock theo unit
  const stockPieces = itemToAdd.stockQuantity || 0;
  const unitMultiplier = UNIT_MULTIPLIER[unit] || 1;
  const stockInUnit = Math.floor(stockPieces / unitMultiplier);

  if (existingItemIndex > -1) {
    const newItems = [...items];
    const newQuantity = newItems[existingItemIndex].quantity + quantity;

    if (newQuantity > stockInUnit) {
      toast.error(`Chỉ có thể thêm tối đa ${stockInUnit} ${unit}.`);
      newItems[existingItemIndex].quantity = stockInUnit;
    } else {
      newItems[existingItemIndex].quantity = newQuantity;
      toast.success(`Đã cập nhật số lượng ${unit} trong giỏ!`);
    }

    return newItems;
  } else {
    if (quantity > stockInUnit) {
      toast.error(`Chỉ có thể thêm tối đa ${stockInUnit} ${unit}.`);
      return [...items, { itemData: itemToAdd, quantity: stockInUnit, unit }];
    } else {
      toast.success(`Đã thêm ${quantity} ${unit} vào giỏ!`);
      return [...items, { itemData: itemToAdd, quantity, unit }];
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

      // ➕ Thêm vật phẩm [SỬA] Thêm unit parameter
      addItem: (itemData, quantity, unit = 'PIECE') =>
        set((state) => {
          const updatedItems = upsertItem(state.items, itemData, quantity, unit);
          return { ...calculateTotals(updatedItems), items: updatedItems };
        }),

      // ❌ Xóa vật phẩm [SỬA] Cần cả itemId và unit
      removeItem: (itemId, unit) =>
        set((state) => {
          const updatedItems = state.items.filter(
            (entry) => !(entry.itemData.id === itemId && entry.unit === unit)
          );
          return { ...calculateTotals(updatedItems), items: updatedItems };
        }),

      // 🔄 Cập nhật số lượng [SỬA] Cần cả itemId và unit
      updateItemQuantity: (itemId, unit, newQuantity) =>
        set((state) => {
          if (newQuantity <= 0) {
            const updatedItems = state.items.filter(
              (entry) => !(entry.itemData.id === itemId && entry.unit === unit)
            );
            return { ...calculateTotals(updatedItems), items: updatedItems };
          }

          const itemEntry = state.items.find(
            (e) => e.itemData.id === itemId && e.unit === unit
          );

          // [SỬA] Tính stock theo unit
          const stockPieces = itemEntry?.itemData.stockQuantity || 0;
          const unitMultiplier = UNIT_MULTIPLIER[unit] || 1;
          const stockInUnit = Math.floor(stockPieces / unitMultiplier);
          let finalQuantity = newQuantity;

          if (newQuantity > stockInUnit) {
            toast.error(`Tồn kho chỉ còn ${stockInUnit} ${unit}.`);
            finalQuantity = stockInUnit;
          }

          const updatedItems = state.items.map((entry) =>
            entry.itemData.id === itemId && entry.unit === unit
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
