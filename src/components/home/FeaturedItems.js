// src/components/home/FeaturedItems.js
import React from 'react';
import ItemCard from '../items/ItemCard.js'; // Nhớ thêm .js

// (Tạm thời dùng dữ liệu giả, sau này ta sẽ gọi API)
const mockItems = [
  { id: 1, name: 'Netherite Stack', unit: 'STACK', priceCoin: 100, imageUrl: null },
  { id: 2, name: 'Totem', unit: 'PIECE', priceCoin: 10, imageUrl: null },
  { id: 3, name: 'Elytra', unit: 'PIECE', priceCoin: 50, imageUrl: null },
  { id: 4, name: 'Shulker Box (Full)', unit: 'SHULKER', priceCoin: 200, imageUrl: null },
];

export default function FeaturedItems() {
  return (
    // Hiệu ứng 5: Cả khu vực sẽ mờ dần từ dưới lên
    <section className="py-16 animate-fade-up animate-delay-500">
      <h2 className="text-3xl font-bold text-center mb-10">Vật Phẩm Nổi Bật</h2>
      
      {/* Chia lưới responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}