// src/components/home/FeaturedItems.js
import React, { useState, useEffect } from 'react';
import ItemCard from '../items/ItemCard.js';
import apiClient from '../../services/apiClient.js';
import { Link } from 'react-router-dom'; // Import Link

export default function FeaturedItems() {
  // State để quản lý
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API khi component được render
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Gọi API backend
        const response = await apiClient.get('/items/featured');
        
        setItems(response.data); // Lưu dữ liệu thật vào state
      } catch (err) {
        console.error('Lỗi khi tải vật phẩm:', err);
        setError(
          err.response?.data?.message || 'Không thể tải danh sách vật phẩm'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []); // [] đảm bảo hàm này chỉ chạy 1 lần

  // Xử lý trạng thái loading
  if (isLoading) {
    return (
      <section className="py-16 text-center">
        <p className="text-xl text-gray-400">Đang tải vật phẩm...</p>
      </section>
    );
  }

  // Xử lý trạng thái lỗi
  if (error) {
    return (
      <section className="py-16 text-center">
        <p className="text-xl text-red-500">Lỗi: {error}</p>
      </section>
    );
  }
  
  // Xử lý khi không có vật phẩm
  if (!items || items.length === 0) {
     return (
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-center mb-10">Vật Phẩm Nổi Bật</h2>
        <p className="text-xl text-gray-400">Hiện chưa có vật phẩm nào được bán.</p>
      </section>
    );
  }

  return (
    <section className="py-16 animate-fade-up animate-delay-500">
      <h2 className="text-3xl font-bold text-center mb-10">Vật Phẩm Nổi Bật</h2>
      
      {/* Lặp qua 'items' (từ state) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          // [SỬA] Bọc ItemCard bằng Link, trỏ đến trang chi tiết
          <Link key={item.id} to={`/item/${item.slug}/${item.unit}`}>
            <ItemCard item={item} />
          </Link>
        ))}
      </div>
    </section>
  );
}