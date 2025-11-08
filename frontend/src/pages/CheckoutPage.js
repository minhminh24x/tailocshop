// File: frontend/src/pages/CheckoutPage.js
// [CODE ĐÃ SỬA]

import React, { useState, useEffect, useMemo } from 'react';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/orderService.js';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient.js';
import { FaCoins } from 'react-icons/fa';
import { FaDollarSign } from 'react-icons/fa';
import { formatNumber } from '../utils/formatNumber.js'; // <-- Bạn đã import đúng
  
export default function CheckoutPage() {
  const { items, totalItems, clearCart } = useCartStore();
  const { user, vipLevel } = useAuthStore();
  const navigate = useNavigate();

  // === STATE ===
  const [paymentMethod, setPaymentMethod] = useState('COIN');
  const [inGameName, setInGameName] = useState(user?.inGameName || '');
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // === Tải khung giờ ===
  useEffect(() => {
    setIsLoadingTimeSlots(true);
    apiClient.get('/delivery-time-slots/active')
      .then(response => {
        setTimeSlots(response.data);
        if (response.data.length > 0) {
          setSelectedTimeSlot(response.data[0].id);
        } else {
          setSelectedTimeSlot("00000000-0000-0000-0000-000000000000");
        }
      })
      .catch(err => {
        toast.error('Không thể tải khung giờ. Sẽ giao sớm nhất.');
        setSelectedTimeSlot("00000000-0000-0000-0000-000000000000");
      })
      .finally(() => {
        setIsLoadingTimeSlots(false);
      });
  }, []);

  // === Logic tính toán (Giữ nguyên) ===
  const orderSummary = useMemo(() => {
    // ... (Toàn bộ logic useMemo của bạn giữ nguyên) ...
    const coinOnlyItems = items.filter(
      (entry) => !entry.itemData.priceUsd || entry.itemData.priceUsd <= 0
    );
    const usdPayableItems = items.filter(
      (entry) => entry.itemData.priceUsd && entry.itemData.priceUsd > 0
    );
    const coinOnlySubtotalXu = coinOnlyItems.reduce(
      (acc, entry) => acc + entry.itemData.priceCoin * entry.quantity,
      0
    );
    const payableSubtotalXu = usdPayableItems.reduce(
      (acc, entry) => acc + entry.itemData.priceCoin * entry.quantity,
      0
    );
    const payableSubtotalUsd = usdPayableItems.reduce(
      (acc, entry) => acc + entry.itemData.priceUsd * entry.quantity,
      0
    );
    const totalXuEquivalent = coinOnlySubtotalXu + payableSubtotalXu;
    const discountPercent = vipLevel?.discountPercent || 0;
    const discountAmountXu = totalXuEquivalent * (discountPercent / 100);
    let finalTotalXu = 0;
    let finalTotalUsd = 0;
    if (paymentMethod === 'COIN') {
      finalTotalXu = totalXuEquivalent - discountAmountXu;
      finalTotalUsd = 0;
    } else {
      finalTotalXu = coinOnlySubtotalXu;
      const discountPercentOnPayable = payableSubtotalUsd * (discountPercent / 100);
      finalTotalUsd = payableSubtotalUsd - discountPercentOnPayable;
    }
    return {
      coinOnlyItems,
      usdPayableItems,
      coinOnlySubtotalXu,
      payableSubtotalUsd,
      totalXuEquivalent,
      discountPercent,
      discountAmountXu, 
      finalTotalXu,
      finalTotalUsd,
      showCoinOnlyWarning: paymentMethod === 'USD' && coinOnlyItems.length > 0,
      coinOnlyItemCount: coinOnlyItems.reduce((acc, item) => acc + item.quantity, 0)
    };
  }, [items, paymentMethod, vipLevel]);

  // === Xử lý submit (Giữ nguyên) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (Toàn bộ logic handleSubmit của bạn giữ nguyên) ...
    if (totalItems === 0) {
      toast.error('Giỏ hàng của bạn đang rỗng!');
      return;
    }
    if (!inGameName.trim()) {
      toast.error('Vui lòng nhập Tên trong game');
      return;
    }
    if (!selectedTimeSlot) {
      toast.error('Vui lòng chọn một khung giờ giao hàng');
      return;
    }
    setIsLoading(true);
    setError(null);
    const orderData = {
      inGameName,
      deliveryTimeSlotId: selectedTimeSlot,
      paymentMethod: paymentMethod, 
      items: items.map(item => ({ 
        itemId: item.itemData.id, 
        quantity: item.quantity 
      })),
      clientCalculations: {
        finalTotalXu: orderSummary.finalTotalXu,
        finalTotalUsd: orderSummary.finalTotalUsd,
        totalXuEquivalent: orderSummary.totalXuEquivalent
      }
    };
    if (paymentMethod === 'USD') {
        toast.error('Chức năng thanh toán bằng USD đang được phát triển.');
        setError('Hiện tại hệ thống chỉ hỗ trợ thanh toán bằng Xu.');
        setIsLoading(false);
        return;
    }
    try {
      await createOrder(items, inGameName, selectedTimeSlot);
      toast.success('Đặt hàng (Xu) thành công!');
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

          {/* Cột 1: Thông tin & Form (Giữ nguyên) */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            {/* ... (Toàn bộ form của bạn giữ nguyên) ... */}
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
                          {slot.displayText}
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hình thức thanh toán
                </label>
                <div className="flex flex-col space-y-3">
                  <label
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'COIN'
                        ? 'bg-yellow-500/20 border-yellow-500 border-2'
                        : 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COIN"
                      checked={paymentMethod === 'COIN'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio h-5 w-5 text-yellow-500 bg-gray-800 border-gray-600 focus:ring-yellow-600"
                    />
                    <span className="ml-3 flex items-center text-lg font-semibold">
                      <FaCoins className="mr-2 text-yellow-500" />
                      Thanh toán bằng Xu
                    </span>
                  </label>
                  <label
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'USD'
                        ? 'bg-green-500/20 border-green-500 border-2'
                        : 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="USD"
                      checked={paymentMethod === 'USD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio h-5 w-5 text-green-500 bg-gray-800 border-gray-600 focus:ring-green-600"
                    />
                    <span className="ml-3 flex items-center text-lg font-semibold">
                      <FaDollarSign className="mr-2 text-green-500" />
                      Thanh toán bằng Tiền ($)
                    </span>
                  </label>
                </div>
              </div>
              {orderSummary.showCoinOnlyWarning && (
                <div className="mb-4 text-center text-yellow-400 bg-yellow-900/50 p-3 rounded-lg">
                  Bạn đang có <strong>{formatNumber(orderSummary.coinOnlyItemCount)} vật phẩm</strong> bắt buộc phải trả bằng Xu.
                  Các vật phẩm này sẽ được giữ nguyên thanh toán bằng Xu.
                </div>
              )}
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
                {isLoading ? 'Đang xử lý...' : `Xác nhận Đặt hàng`}
              </button>
            </form>
          </div>

          {/* Cột 2: Tóm tắt Đơn hàng (ĐÃ SỬA) */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
            <h2 className="text-2xl font-semibold mb-6">Tóm tắt Đơn hàng</h2>

            {/* Danh sách vật phẩm */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
              {items.map(entry => (
                <div key={entry.itemData.id} className="flex justify-between items-center text-sm">
                  <div className="text-gray-300">
                    <p className="font-medium text-white">{entry.itemData.name}</p>
                    {/* [SỬA] Dùng formatNumber */}
                    <p>SL: {formatNumber(entry.quantity)} x {formatNumber(entry.itemData.priceCoin)} Xu
                      {entry.itemData.priceUsd && (
                        <span className="text-gray-400"> / ${formatNumber(entry.itemData.priceUsd)}</span>
                      )}
                    </p>
                  </div>
                  {/* [SỬA] Dùng formatNumber */}
                  <p className="font-semibold text-white">
                    {formatNumber(entry.quantity * entry.itemData.priceCoin)} Xu
                  </p>
                </div>
              ))}
            </div>

            {/* Tính toán */}
            <div className="border-t border-gray-700 pt-4 space-y-2">
              
              {paymentMethod === 'USD' && orderSummary.coinOnlySubtotalXu > 0 && (
                <>
                  <div className="flex justify-between text-gray-300">
                    <span>Tạm tính (Hàng trả bằng Xu):</span>
                    {/* [SỬA] Dùng formatNumber */}
                    <span className="text-white">{formatNumber(orderSummary.coinOnlySubtotalXu)} Xu</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tạm tính (Hàng trả bằng $):</span>
                    {/* [SỬA] Dùng formatNumber */}
                    <span className="text-white">${formatNumber(orderSummary.payableSubtotalUsd)}</span>
                  </div>
                </>
              )}
              
              {paymentMethod === 'COIN' && (
                  <div className="flex justify-between text-gray-300">
                    <span>Tạm tính (Xu):</span>
                    {/* [SỬA] Dùng formatNumber */}
                    <span className="text-white">{formatNumber(orderSummary.totalXuEquivalent)} Xu</span>
                  </div>
              )}

              {/* Giảm giá VIP */}
              <div className="flex justify-between">
                <span className="text-gray-300">Giảm giá VIP ({orderSummary.discountPercent}%):</span>
                {paymentMethod === 'COIN' ? (
                  // [SỬA] Dùng formatNumber
                  <span className="text-pink-400">-{formatNumber(orderSummary.discountAmountXu)} Xu</span>
                ) : (
                  // [SỬA] Dùng formatNumber
                  <span className="text-pink-400">
                    -${formatNumber(orderSummary.payableSubtotalUsd * (orderSummary.discountPercent / 100))}
                  </span>
                )}
              </div>

              {/* Tổng cộng COIN */}
              {paymentMethod === 'COIN' && (
                <div className="flex justify-between text-xl font-bold border-t border-gray-700 pt-2 mt-2">
                  <span className="text-white">Tổng cộng (Xu):</span>
                  {/* [SỬA] Dùng formatNumber */}
                  <span className="text-yellow-400">{formatNumber(orderSummary.finalTotalXu)} Xu</span>
                </div>
              )}
              
              {/* Tổng cộng USD (Mixed) */}
              {paymentMethod === 'USD' && (
                <div className="border-t border-gray-700 pt-2 mt-2 space-y-2">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white">Tổng cộng ($):</span>
                    {/* [SỬA] Dùng formatNumber */}
                    <span className="text-green-400">${formatNumber(orderSummary.finalTotalUsd)}</span>
                  </div>
                  {orderSummary.finalTotalXu > 0 && (
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-white">Tổng cộng (Xu):</span>
                      {/* [SỬA] Dùng formatNumber */}
                      <span className="text-yellow-400">{formatNumber(orderSummary.finalTotalXu)} Xu</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}