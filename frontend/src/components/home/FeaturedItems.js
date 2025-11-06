// src/components/home/FeaturedItems.js
import React, { useState, useEffect } from 'react'; // [THÊM] Import useState, useEffect
import ItemCard from '../items/ItemCard.js';
import apiClient from '../../services/apiClient.js'; // [THÊM] Import apiClient

// [XÓA] Xóa bỏ mảng mockItems

export default function FeaturedItems() {
  // [THÊM] Tạo các state để quản lý
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // [THÊM] Sử dụng useEffect để gọi API khi component được render
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Gọi API backend (đã được định nghĩa trong server/routes/item.route.js)
        const response = await apiClient.get('/items');
        
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
  }, []); // [] đảm bảo hàm này chỉ chạy 1 lần khi component mount

  // [THÊM] Xử lý trạng thái loading
  if (isLoading) {
    return (
      <section className="py-16 text-center">
        <p className="text-xl text-gray-400">Đang tải vật phẩm...</p>
      </section>
    );
  }

  // [THÊM] Xử lý trạng thái lỗi
  if (error) {
    return (
      <section className="py-16 text-center">
        <p className="text-xl text-red-500">Lỗi: {error}</p>
      </section>
    );
  }
  
  // [THÊM] Xử lý khi không có vật phẩm
  if (!items || items.length === 0) {
     return (
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-center mb-10">Vật Phẩm Nổi Bật</h2>
        <p className="text-xl text-gray-400">Hiện chưa có vật phẩm nào được bán.</p>
      </section>
    );
  }

  return (
    // Hiệu ứng 5: Cả khu vực sẽ mờ dần từ dưới lên
    <section className="py-16 animate-fade-up animate-delay-500">
      <h2 className="text-3xl font-bold text-center mb-10">Vật Phẩm Nổi Bật</h2>
      
      {/* [SỬA] Lặp qua 'items' (từ state) thay vì 'mockItems' */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}