import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllItems } from '../services/itemService';
import { getAllCategoriesAdmin } from '../services/adminCategoryService';
import ItemCard from '../components/items/ItemCard';
import { Search, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 12; // Số items mỗi trang

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest');

  // [MỚI] Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortOrder]);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        getAllItems({ limit: 1000 }), // Lấy nhiều items, frontend sẽ phân trang
        getAllCategoriesAdmin()
      ]);

      // [SỬA] Xử lý response mới có pagination
      const rawItems = itemsRes.data;
      // Hỗ trợ cả format cũ (array) và mới (object với data)
      const validItems = Array.isArray(rawItems)
        ? rawItems
        : (rawItems.data || rawItems.items || []);

      setItems(validItems);
      setCategories(catsRes.data || []);

    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc và sắp xếp
  const filteredItems = useMemo(() => {
    return (items || []).filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || String(item.categoryId) === String(selectedCategory);
      return matchSearch && matchCat;
    }).sort((a, b) => {
      if (sortOrder === 'price-asc') return parseFloat(a.priceCoin) - parseFloat(b.priceCoin);
      if (sortOrder === 'price-desc') return parseFloat(b.priceCoin) - parseFloat(a.priceCoin);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [items, searchTerm, selectedCategory, sortOrder]);

  // [MỚI] Pagination logic
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
      <div className="glass-panel p-4 rounded-xl border border-white/10">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm vật phẩm..."
              className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp - cao</option>
              <option value="price-desc">Giá cao - thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* [MỚI] Thông tin số lượng & trang */}
      <div className="flex justify-between items-center text-sm text-gray-400">
        <p>
          Hiển thị <span className="text-yellow-400 font-bold">{paginatedItems.length}</span> / {filteredItems.length} vật phẩm
        </p>
        {totalPages > 1 && (
          <p>Trang <span className="text-yellow-400 font-bold">{currentPage}</span> / {totalPages}</p>
        )}
      </div>

      {/* ITEMS GRID */}
      {paginatedItems.length === 0 ? (
        <div className="text-center py-20 opacity-60">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-300">Không tìm thấy vật phẩm nào</h3>
          <p className="text-gray-500">Thử tìm từ khóa khác xem sao nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedItems.map((item) => (
            <Link key={item.id} to={`/items/${item.slug}/${item.unit}`} className="block h-full">
              <ItemCard item={item} />
            </Link>
          ))}
        </div>
      )}

      {/* [MỚI] Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-slate-800 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Page numbers */}
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Hiển thị: 1, currentPage-1, currentPage, currentPage+1, lastPage
                return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
              })
              .map((page, index, arr) => {
                // Thêm dấu ... giữa các số không liền nhau
                const prevPage = arr[index - 1];
                const showDots = prevPage && page - prevPage > 1;

                return (
                  <React.Fragment key={page}>
                    {showDots && <span className="px-2 text-gray-500">...</span>}
                    <button
                      onClick={() => goToPage(page)}
                      className={`px-4 py-2 rounded-lg font-bold transition ${page === currentPage
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black'
                        : 'bg-slate-800 border border-white/10 text-white hover:bg-slate-700'
                        }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-slate-800 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}