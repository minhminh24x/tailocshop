import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllItems } from '../services/itemService';
import { getAllCategoriesAdmin } from '../services/adminCategoryService'; 
import ItemCard from '../components/items/ItemCard';
import { Search, Sparkles } from 'lucide-react';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest'); 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        getAllItems(),
        getAllCategoriesAdmin() 
      ]);

      // [SỬA LỖI QUAN TRỌNG]: Lấy dữ liệu từ .data của axios response
      // Kiểm tra an toàn: nếu API trả về object có field 'items' (phân trang) hoặc trả về mảng trực tiếp
      const rawItems = itemsRes.data;
      const validItems = Array.isArray(rawItems) ? rawItems : (rawItems.items || []);
      
      setItems(validItems);
      setCategories(catsRes.data || []); // Category thường trả về mảng trực tiếp
      
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc và sắp xếp (Bây giờ items chắc chắn là mảng nên .filter sẽ hoạt động)
  const filteredItems = (items || []).filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Lưu ý: categoryId có thể là chuỗi hoặc số tùy DB, nên ép kiểu để so sánh
    const matchCat = selectedCategory === 'ALL' || String(item.categoryId) === String(selectedCategory);
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (sortOrder === 'price-asc') return parseFloat(a.priceCoin) - parseFloat(b.priceCoin);
    if (sortOrder === 'price-desc') return parseFloat(b.priceCoin) - parseFloat(a.priceCoin);
    return new Date(b.createdAt) - new Date(a.createdAt); // newest
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-yellow-500 font-bold animate-pulse">Đang tải kho báu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* PAGE TITLE */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          KHO TÀNG <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">VẬT PHẨM</span>
        </h1>
        <p className="text-gray-400 flex items-center justify-center gap-2">
          <Sparkles size={16} className="text-yellow-400" />
          Tất cả trang bị tốt nhất dành cho bạn
          <Sparkles size={16} className="text-yellow-400" />
        </p>
      </div>

      {/* CONTROL BAR (FILTER & SEARCH) */}
      <div className="glass-panel p-4 rounded-2xl sticky top-24 z-30 shadow-xl transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm vật phẩm..." 
              className="w-full bg-slate-900/80 border border-gray-700 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <select 
              className="bg-slate-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 cursor-pointer hover:bg-slate-800 transition-colors"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select 
              className="bg-slate-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 cursor-pointer hover:bg-slate-800 transition-colors"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp - cao</option>
              <option value="price-desc">Giá cao - thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* ITEMS GRID */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 opacity-60">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-300">Không tìm thấy vật phẩm nào</h3>
          <p className="text-gray-500">Thử tìm từ khóa khác xem sao nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Link key={item.id} to={`/items/${item.id}`} className="block h-full">
               <ItemCard item={item} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}