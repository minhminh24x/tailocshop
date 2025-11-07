// File: frontend/src/pages/ItemsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { getAllItems } from '../services/itemService.js'; // Import API service
import ItemCard from '../components/items/ItemCard.js'; // Import ItemCard

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho tìm kiếm và sắp xếp
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc'); // Mặc định sắp xếp

  // 1. Gọi API để lấy tất cả vật phẩm
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAllItems();
        setItems(response.data);
      } catch (err) {
        console.error('Lỗi khi tải vật phẩm:', err);
        setError(err.response?.data?.message || 'Không thể tải danh sách vật phẩm');
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  // 2. Logic lọc và sắp xếp (thực hiện ở frontend)
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Lọc theo tìm kiếm (không phân biệt hoa thường)
    if (searchTerm) {
      filtered = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sắp xếp
    const [key, direction] = sortBy.split('-');
    
    return [...filtered].sort((a, b) => {
      let valA, valB;

      if (key === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (key === 'price') {
        // Ưu tiên giá Coin
        valA = parseFloat(a.priceCoin || a.priceUsd || 0);
        valB = parseFloat(b.priceCoin || b.priceUsd || 0);
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, searchTerm, sortBy]);

  // 3. Render
  if (isLoading) {
    return <p className="text-center text-xl text-gray-400">Đang tải vật phẩm...</p>;
  }

  if (error) {
    return <p className="text-center text-xl text-red-500">Lỗi: {error}</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-pink-500">Tất cả Vật phẩm</h1>

      {/* Thanh Tìm kiếm & Sắp xếp */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm vật phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full md:w-auto px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="name-asc">Tên (A-Z)</option>
          <option value="name-desc">Tên (Z-A)</option>
          <option value="price-asc">Giá (Thấp đến Cao)</option>
          <option value="price-desc">Giá (Cao đến Thấp)</option>
        </select>
      </div>

      {/* Lưới vật phẩm */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAndSortedItems.map((item) => (
            // [QUAN TRỌNG] Bọc ItemCard bằng Link
            <Link key={item.id} to={`/item/${item.slug}/${item.unit}`}>
              <ItemCard item={item} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-xl text-gray-400">Không tìm thấy vật phẩm nào.</p>
      )}
    </div>
  );
}