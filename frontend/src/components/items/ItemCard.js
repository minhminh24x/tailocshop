// src/components/items/ItemCard.js
import React, { useState } from 'react';
import { formatNumber } from '../../utils/formatNumber.js';

// Ngưỡng hiển thị giá USD
const MIN_USD_DISPLAY_THRESHOLD = 1.00; 

export default function ItemCard({ item }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageUrl = item.thumbnailImageUrl || 'https://placehold.co/300x200/2D3748/FFFFFF?text=TaiLocShop';

  const priceCoinNum = parseFloat(item.priceCoin) || 0;
  const priceUsdNum = parseFloat(item.priceUsd) || 0;

  const isUsdAvailable = priceUsdNum >= MIN_USD_DISPLAY_THRESHOLD;
  const isCoinOnly = priceCoinNum > 0 && !isUsdAvailable;
  const isUsdOnly = isUsdAvailable && priceCoinNum <= 0; 
  const hasBothPrices = priceCoinNum > 0 && isUsdAvailable;

  return (
    <div className="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out hover:-translate-y-2 border border-gray-700 hover:border-yellow-500/50">
      
      {/* Phần hình ảnh với Skeleton Loading */}
      <div className="aspect-w-16 aspect-h-9 overflow-hidden relative h-48 bg-gray-700">
        {/* Skeleton loader (hiện khi ảnh chưa load) */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse" />
        )}
        
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy" // [NÂNG CẤP] Lazy load native
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* [NÂNG CẤP] Badge giảm giá hoặc Unit (Ví dụ hiển thị Unit ở góc) */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-gray-600">
          {item.unit}
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-5">
        <h3 
          className="text-lg font-bold text-white truncate group-hover:text-yellow-400 transition-colors" 
          title={item.name}
        >
          {item.name}
        </h3>
        
        {/* Phần hiển thị giá */}
        <div className="mt-4 space-y-1">
          {isCoinOnly && (
            <>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-500/20 text-yellow-300 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                  Coin Only
                </span>
              </div>
              <div className="text-2xl font-extrabold text-yellow-400 drop-shadow-sm">
                {formatNumber(priceCoinNum)} <span className="text-sm font-normal text-yellow-200">Xu</span>
              </div>
            </>
          )}

          {isUsdOnly && (
             <>
              <div className="flex items-center gap-2">
                <span className="bg-green-500/20 text-green-300 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                  USD
                </span>
              </div>
              <div className="text-2xl font-extrabold text-green-400 drop-shadow-sm">
                ${formatNumber(priceUsdNum)}
              </div>
            </>
          )}

          {hasBothPrices && (
            <div className="flex flex-col">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-green-400">${formatNumber(priceUsdNum)}</span>
                <span className="text-xs text-gray-400">hoặc</span>
              </div>
              <div className="text-lg font-bold text-yellow-400">
                {formatNumber(priceCoinNum)} <span className="text-sm text-yellow-200">Xu</span>
              </div>
            </div>
          )}
        </div>

        {/* [NÂNG CẤP] Button ảo (Call to Action) */}
        <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Xem chi tiết</span>
          <div className="bg-yellow-500 text-black p-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}