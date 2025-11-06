// src/components/items/ItemCard.js
import React from 'react';

// Nhận "item" (dữ liệu) làm prop
export default function ItemCard({ item }) {
  // [SỬA LỖI] Đổi dịch vụ placeholder phòng khi 'via.placeholder.com' bị lỗi
  const imageUrl = item.imageUrl || 'https://placehold.co/300x200/2D3748/FFFFFF?text=TaiLocShop';

  return (
    // Hiệu ứng 3: Thẻ sẽ hơi "nảy" lên khi hover (group-hover)
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg group transition-transform duration-300 ease-in-out hover:-translate-y-2">
      <div className="overflow-hidden">
        {/* Hiệu ứng 4: Ảnh sẽ phóng to ra 1 chút khi hover thẻ */}
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
        <p className="text-sm text-gray-400">{item.unit} (Đơn vị)</p>
        <div className="mt-3">
          <span className="text-xl font-bold text-green-400">{item.priceCoin} Xu</span>
          {/* Bạn có thể thêm giá USD nếu muốn */}
          {/* <span className="text-md text-gray-500 line-through ml-2">{item.priceUsd}$</span> */}
        </div>
      </div>
    </div>
  );
}