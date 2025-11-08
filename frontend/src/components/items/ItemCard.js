// src/components/items/ItemCard.js
// [CODE ĐẦY ĐỦ]
import React from 'react';
import { formatNumber } from '../../utils/formatNumber.js';
import { useCurrencyStore } from '../../store/currencyStore.js';

// Ngưỡng tối thiểu để hiển thị giá USD
const MIN_USD_DISPLAY_THRESHOLD = 1.00; 

export default function ItemCard({ item }) {
  // Lấy tỷ giá từ store (dùng getState() để tối ưu hiệu năng trong danh sách)
  const USD_PER_XU = useCurrencyStore.getState().rate;

  const imageUrl = item.thumbnailImageUrl || 'https://placehold.co/300x200/2D3748/FFFFFF?text=TaiLocShop';

  // Nguồn chân lý LUÔN LÀ priceCoin
  const priceCoinNum = parseFloat(item.priceCoin) || 0;
  // Tự tính toán giá USD, lờ đi giá USD trong DB
  const calculatedUsd = priceCoinNum * USD_PER_XU;

  // Quyết định hiển thị dựa trên giá đã TÍNH TOÁN
  const isUsdAvailable = calculatedUsd >= MIN_USD_DISPLAY_THRESHOLD;

  const isCoinOnly = priceCoinNum > 0 && !isUsdAvailable;
  const hasBothPrices = priceCoinNum > 0 && isUsdAvailable;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg group transition-transform duration-300 ease-in-out hover:-translate-y-2 block">
      <div className="overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate" title={item.name}>{item.name}</h3>
        <p className="text-sm text-gray-400">{item.unit} (Đơn vị)</p>
        
        <div className="mt-3">
          {/* TRƯỜNG HỢP 1: CHỈ BÁN BẰNG XU (Vì USD < 1.00) */}
          {isCoinOnly && (
            <>
              <span className="inline-block bg-yellow-600 text-yellow-100 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                Chỉ Được Bán Bằng Xu
              </span>
              <span className="block text-xl font-bold text-yellow-400">
                {formatNumber(priceCoinNum)} Xu
              </span>
            </>
          )}

          {/* TRƯỜNG HỢP 3: CÓ CẢ 2 GIÁ (Vì USD >= 1.00) */}
          {hasBothPrices && (
            <>
              <span className="block text-xl font-bold text-green-400">
                ${formatNumber(calculatedUsd)}
              </span>
              <span className="block text-lg font-bold text-yellow-400">
                {formatNumber(priceCoinNum)} Xu
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}