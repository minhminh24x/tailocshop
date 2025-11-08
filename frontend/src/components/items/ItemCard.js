// src/components/items/ItemCard.js
// [CODE ĐÃ CẬP NHẬT]
import React from 'react';
import { formatNumber } from '../../utils/formatNumber.js';

export default function ItemCard({ item }) {
  const imageUrl = item.thumbnailImageUrl || 'https://placehold.co/300x200/2D3748/FFFFFF?text=TaiLocShop';

  // Chuyển đổi giá sang SỐ một cách an toàn
  const priceCoinNum = parseFloat(item.priceCoin) || 0;
  const priceUsdNum = parseFloat(item.priceUsd) || 0;

  // Xác định các trạng thái
  const isCoinOnly = priceCoinNum > 0 && priceUsdNum <= 0;
  const isUsdOnly = priceUsdNum > 0 && priceCoinNum <= 0;
  const hasBothPrices = priceCoinNum > 0 && priceUsdNum > 0;

  return (
    // Trả về <div>
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
        
        {/* Logic hiển thị giá và tag */}
        <div className="mt-3">

          {/* TRƯỜNG HỢP 1: CHỈ BÁN BẰNG XU */}
          {isCoinOnly && (
            <>
              <span className="inline-block bg-yellow-600 text-yellow-100 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                Chỉ Được Bán Bằng Xu
              </span>
              {/* [SỬA] Dùng formatNumber */}
              <span className="block text-xl font-bold text-yellow-400">
                {formatNumber(priceCoinNum)} Xu
              </span>
            </>
          )}

          {/* TRƯỜNG HỢP 2: CHỈ BÁN BẰNG USD */}
          {isUsdOnly && (
            <>
              <span className="inline-block bg-green-600 text-green-100 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                Có thể mua bằng USD
              </span>
              {/* [SỬA] Dùng formatNumber */}
              <span className="block text-xl font-bold text-green-400">
                ${formatNumber(priceUsdNum)}
              </span>
            </>
          )}

          {/* TRƯỜNG HỢP 3: CÓ CẢ 2 GIÁ */}
          {hasBothPrices && (
            <>
              {/* [SỬA] Dùng formatNumber */}
              <span className="block text-xl font-bold text-green-400">
                ${formatNumber(priceUsdNum)}
              </span>
              {/* [SỬA] Dùng formatNumber */}
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