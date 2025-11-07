// File: frontend/src/pages/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/orderService.js';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient.js'; // <-- Dùng để gọi API public

export default function CheckoutPage() {
  const { items, totalItems, subtotal, clearCart } = useCartStore();
  const { user, vipLevel } = useAuthStore();
  const navigate = useNavigate();

  // State cho form
  const [inGameName, setInGameName] = useState(user?.inGameName || '');
  
  // === STATE MỚI CHO KHUNG GIỜ ===
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  // === KẾT THÚC STATE MỚI ===

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // === HÀM MỚI: TẢI KHUNG GIỜ ===
  useEffect(() => {
    setIsLoadingTimeSlots(true);
    // Gọi API public mà chúng ta vừa tạo
    apiClient.get('/delivery-time-slots/public')
      .then(response => {
        setTimeSlots(response.data);
        if (response.data.length > 0) {
          setSelectedTimeSlot(response.data[0].id); // Chọn cái đầu tiên
        } else {
          // Nếu không có slot nào, dùng ID MẶC ĐỊNH
          setSelectedTimeSlot("00000000-0000-0000-0000-000000000000");
        }
      })
      .catch(err => {
        toast.error('Không thể tải khung giờ. Sẽ giao sớm nhất.');
        // Lỗi cũng dùng ID MẶC ĐỊNH
        setSelectedTimeSlot("00000000-0000-0000-0000-000000000000");
      })
      .finally(() => {
        setIsLoadingTimeSlots(false);
      });
    
  }, []);
  // === KẾT THÚC HÀM MỚI ===


  // Tính toán giảm giá
  const discountPercent = vipLevel?.discountPercent || 0;
  const discountAmount = subtotal * (discountPercent / 100);
  const totalAmount = subtotal - discountAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalItems === 0) {
      toast.error('Giỏ hàng của bạn đang rỗng!');
      return;
    }
    if (!inGameName.trim()) {
      toast.error('Vui lòng nhập Tên trong game');
      return;
    }
    // === THÊM KIỂM TRA KHUNG GIỜ ===
    if (!selectedTimeSlot) {
      toast.error('Vui lòng chọn một khung giờ giao hàng');
      return;
    }
    // === KẾT THÚC KIỂM TRA ===

    setIsLoading(true);
    setError(null);

    const orderData = {
      inGameName,
      items: items.map(item => ({ itemId: item.id, quantity: item.quantity })),
      deliveryTimeSlotId: selectedTimeSlot, // <-- GỬI DỮ LIỆU NÀY LÊN
    };

    try {
      await createOrder(orderData);
      toast.success('Đặt hàng thành công!');
      clearCart();
      navigate('/my-orders');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đặt hàng thất bại';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-pink-500">Thanh toán</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Cột 1: Thông tin & Form */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Thông tin Giao hàng</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="inGameName" className="block text-sm font-medium text-gray-300 mb-2">
                  Tên trong game (In-Game Name)
                </label>
                <input
                  type="text"
                  id="inGameName"
                  value={inGameName}
                  onChange={(e) => setInGameName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                  placeholder="Nhập tên chính xác của bạn"
                />
              </div>

              {/* === KHUNG GIỜ MỚI === */}
              <div className="mb-6">
                <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-300 mb-2">
                  Chọn khung giờ nhận hàng
                </label>
                <select
                  id="timeSlot"
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={isLoadingTimeSlots || (timeSlots.length === 0 && !isLoadingTimeSlots)}
                  required
                >
                  {isLoadingTimeSlots ? (
                    <option value="">Đang tải khung giờ...</option>
                  ) : (
                    timeSlots.length > 0 ? (
                      timeSlots.map(slot => (
                        <option key={slot.id} value={slot.id}>
                          {`${slot.startTime} - ${slot.endTime} (Ngày: ${slot.dayOfWeek})`}
                        </option>
                      ))
                    ) : (
                      <option value="00000000-0000-0000-0000-000000000000">Giao hàng ngay khi có thể</option>
                    )
                  )}
                </select>
                {timeSlots.length === 0 && !isLoadingTimeSlots && (
                  <p className="text-sm text-gray-400 mt-2">
                    Không có khung giờ cụ thể, shop sẽ giao sớm nhất.
                  </p>
                )}
              </div>
              {/* === KẾT THÚC KHUNG GIỜ MỚI === */}

              {error && (
                <div className="mb-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || totalItems === 0 || isLoadingTimeSlots}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 disabled:bg-gray-600"
              >
                {isLoading ? 'Đang xử lý...' : `Xác nhận Đặt hàng (${totalItems} vật phẩm)`}
              </button>
            </form>
          </div>

          {/* Cột 2: Tóm tắt Đơn hàng (Giữ nguyên) */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
            <h2 className="text-2xl font-semibold mb-6">Tóm tắt Đơn hàng</h2>
            
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="text-gray-300">
                    <p className="font-medium text-white">{item.name}</p>
                    <p>SL: {item.quantity} x {item.priceCoin} Xu</p>
                  </div>
                  <p className="font-semibold text-white">{(item.quantity * item.priceCoin).toFixed(2)} Xu</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Tạm tính:</span>
                <span className="text-white">{subtotal.toFixed(2)} Xu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Giảm giá VIP ({discountPercent}%):</span>
                <span className="text-pink-400">-{discountAmount.toFixed(2)} Xu</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t border-gray-700 pt-2 mt-2">
                <span className="text-white">Tổng cộng:</span>
                <span className="text-green-400">{totalAmount.toFixed(2)} Xu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}