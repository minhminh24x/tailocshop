// File: frontend/src/pages/CheckoutPage.js
import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/orderService.js';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items: cartItems, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [inGameName, setInGameName] = useState(user?.inGameName || '');
  const [isLoading, setIsLoading] = useState(false);

  // Tính toán tổng tiền (chỉ để hiển thị, backend sẽ tính lại)
  const subTotal = cartItems.reduce((acc, entry) => {
    const price = parseFloat(entry.itemData.priceCoin || 0);
    return acc + price * entry.quantity;
  }, 0);
  
  // (Giả sử tính VIP giống backend để tạm hiển thị)
  const vipDiscount = subTotal * (user.vipLevel || 0) * 0.05;
  const totalAmount = subTotal - vipDiscount;

  if (cartItems.length === 0) {
    // Nếu giỏ hàng rỗng, không cho ở trang checkout
    navigate('/items');
    return null;
  }

  const handleSubmitOrder = async () => {
    if (!inGameName.trim()) {
      toast.error('Vui lòng nhập tên trong game của bạn.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Gọi API để tạo đơn hàng
      await createOrder(cartItems, inGameName);

      // 2. Thành công
      toast.success('Đặt hàng thành công!');
      clearCart(); // Xóa giỏ hàng
      navigate('/my-orders'); // Chuyển đến trang quản lý đơn hàng

    } catch (err) {
      // 3. Thất bại (vd: Hết hàng, lỗi server)
      // Lỗi "Hết hàng" từ backend (Req 2) sẽ được hiển thị ở đây
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Cột 1: Thông tin và Thanh toán */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Xác nhận Đơn hàng</h1>
        
        {/* Form Tên trong game */}
        <div className="mb-6">
          <label htmlFor="inGameName" className="block text-sm font-medium text-gray-300 mb-2">
            Tên trong game (Để nhận hàng)
          </label>
          <input
            type="text"
            id="inGameName"
            value={inGameName}
            onChange={(e) => setInGameName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Nhập tên nhân vật..."
            disabled={isLoading}
          />
        </div>
        
        {/* Thông tin thanh toán (Tạm thời) */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">Phương thức thanh toán</h2>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-white">Thanh toán bằng <span className="font-bold text-green-400">Xu (Coin)</span></p>
            <p className="text-gray-400 text-sm mt-1">Số dư sẽ bị trừ sau khi Admin duyệt đơn.</p>
          </div>
        </div>

        <button
          onClick={handleSubmitOrder}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 disabled:bg-gray-600 disabled:opacity-70"
        >
          {isLoading ? 'Đang xử lý...' : 'Xác nhận Đặt hàng'}
        </button>
      </div>

      {/* Cột 2: Tóm tắt Đơn hàng */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 h-fit">
        <h2 className="text-2xl font-semibold text-white mb-4">Tóm tắt Giỏ hàng</h2>
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
          {cartItems.map(({ itemData, quantity }) => (
            <div key={itemData.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src={itemData.thumbnailImageUrl || 'https://placehold.co/64x64/2D3748/FFFFFF?text=Item'} 
                  alt={itemData.name} 
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div>
                  <p className="text-white font-medium">{itemData.name}</p>
                  <p className="text-gray-400 text-sm">SL: {quantity}</p>
                </div>
              </div>
              <p className="text-white font-medium">
                {(parseFloat(itemData.priceCoin || 0) * quantity).toFixed(2)} Xu
              </p>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-700 pt-4 space-y-2">
          <div className="flex justify-between text-gray-300">
            <span>Tạm tính:</span>
            <span className="text-white">{subTotal.toFixed(2)} Xu</span>
          </div>
          <div className="flex justify-between text-pink-400">
            <span>Giảm giá VIP (Cấp {user.vipLevel || 0}):</span>
            <span className="text-white">-{vipDiscount.toFixed(2)} Xu</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-white pt-2">
            <span>Tổng cộng:</span>
            <span className="text-green-400">{totalAmount.toFixed(2)} Xu</span>
          </div>
        </div>
      </div>
    </div>
  );
}