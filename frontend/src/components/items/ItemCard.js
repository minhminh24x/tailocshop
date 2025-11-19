import React, { useState } from 'react';
import { formatNumber } from '../../utils/formatNumber.js';
import { ShoppingCart } from 'lucide-react';

const MIN_USD_DISPLAY_THRESHOLD = 1.00; 

export default function ItemCard({ item }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageUrl = item.thumbnailImageUrl || 'https://placehold.co/300x200/0f172a/FFFFFF?text=TaiLocShop';

  const priceCoinNum = parseFloat(item.priceCoin) || 0;
  const priceUsdNum = parseFloat(item.priceUsd) || 0;

  const isUsdAvailable = priceUsdNum >= MIN_USD_DISPLAY_THRESHOLD;
  const isCoinOnly = priceCoinNum > 0 && !isUsdAvailable;
  const isUsdOnly = isUsdAvailable && priceCoinNum <= 0; 
  const hasBothPrices = priceCoinNum > 0 && isUsdAvailable;

  return (
    <div className="group relative bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
      
      {/* Hiệu ứng Glow phía sau khi hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/0 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Image Area */}
      <div className="aspect-w-16 aspect-h-10 bg-slate-800/50 relative overflow-hidden">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse" />
        )}
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Unit Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
          {item.unit}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 relative">
        <h3 
          className="text-lg font-bold text-white truncate mb-1 group-hover:text-yellow-400 transition-colors" 
          title={item.name}
        >
          {item.name}
        </h3>
        
        <div className="w-10 h-0.5 bg-slate-700 group-hover:bg-yellow-500 transition-colors duration-500 mb-4"></div>

        {/* Price Section */}
        <div className="space-y-2">
          {isCoinOnly && (
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Giá Xu</span>
              <div className="text-2xl font-extrabold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                {formatNumber(priceCoinNum)} <span className="text-sm font-medium">Xu</span>
              </div>
            </div>
          )}

          {isUsdOnly && (
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-400 font-bold uppercase">Giá USD</span>
               <div className="text-2xl font-extrabold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                ${formatNumber(priceUsdNum)}
              </div>
            </div>
          )}

          {hasBothPrices && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-green-400">${formatNumber(priceUsdNum)}</span>
                <span className="text-xs text-gray-500">hoặc</span>
              </div>
              <div className="text-lg font-bold text-yellow-400">
                {formatNumber(priceCoinNum)} Xu
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">Xem chi tiết</span>
          <button className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-lg hover:bg-yellow-400">
            <ShoppingCart size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}