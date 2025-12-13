// File: frontend/src/pages/admin/manager/AdminManageItems.js
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getAllItemsAdmin,
  createItemAdmin,
  updateItemAdmin,
  deleteItemAdmin
} from '../../../services/adminItemService.js';
import ItemModal from '../../../components/admin/ItemModal.js';
import Pagination from '../../../components/common/Pagination.js';
import { FaSearch } from 'react-icons/fa';

export default function AdminManageItems() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // State cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null); // null = tạo mới

  // Hàm tải dữ liệu
  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await getAllItemsAdmin();
      setItems(data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể tải danh sách vật phẩm';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // === Logic Pagination & Filter ===
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // === Xử lý Modal ===
  const handleOpenCreateModal = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  // === Xử lý CRUD ===
  const handleSaveItem = async (itemData) => {
    try {
      if (itemToEdit) {
        await updateItemAdmin(itemToEdit.id, itemData);
        toast.success('Cập nhật vật phẩm thành công!');
      } else {
        await createItemAdmin(itemData);
        toast.success('Tạo vật phẩm mới thành công!');
      }
      handleCloseModal();
      fetchItems();
    } catch (err) {
      const errorMsg = err.response?.data?.errors ? err.response.data.errors.join(', ') : (err.response?.data?.message || 'Thao tác thất bại');
      toast.error(errorMsg);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vật phẩm này?')) {
      try {
        await deleteItemAdmin(id);
        toast.success('Xóa vật phẩm thành công!');
        fetchItems();
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Không thể xóa vật phẩm';
        toast.error(errorMsg);
      }
    }
  };

  const StockStatusBadge = ({ quantity }) => {
    let text = 'Còn Nhiều';
    let classes = 'bg-green-700 text-green-100 border-green-500';

    if (quantity <= 0) {
      text = 'Hết Hàng';
      classes = 'bg-red-700 text-red-100 border-red-500';
    } else if (quantity <= 20) {
      text = 'Còn Ít';
      classes = 'bg-yellow-700 text-yellow-100 border-yellow-500';
    }

    const style = `px-3 py-1 text-xs font-semibold rounded-full border ${classes}`;
    return <span className={style}>{text}</span>;
  };

  if (isLoading) return <p className="text-center text-lg text-gray-300">Đang tải vật phẩm...</p>;
  if (error) return <p className="text-center text-lg text-red-400">Lỗi: {error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Quản lý Vật phẩm</h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          + Tạo Vật phẩm mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Tìm kiếm vật phẩm..."
          className="w-full md:w-1/3 p-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
      </div>

      <div className="bg-gray-900 shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full text-white">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Tên Vật phẩm</th>
              <th className="py-3 px-4 text-left">Phân loại</th>
              <th className="py-3 px-4 text-left">Đơn vị</th>
              <th className="py-3 px-4 text-center">Giá (Xu)</th>
              <th className="py-3 px-4 text-center">Tồn kho</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {currentItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-700">
                <td className="py-3 px-4 font-medium">{item.name}</td>
                <td className="py-3 px-4 text-gray-400">{item.category?.name || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-400">{item.unit}</td>
                <td className="py-3 px-4 text-center font-mono text-green-400">{item.priceCoin || 0}</td>
                <td className="py-3 px-4 text-center"><StockStatusBadge quantity={item.stockQuantity} /></td>
                <td className="py-3 px-4 text-center">{item.isActive ? <span className="px-2 py-1 text-xs font-semibold bg-green-700 text-green-100 rounded-full">Kích hoạt</span> : <span className="px-2 py-1 text-xs font-semibold bg-red-700 text-red-100 rounded-full">Ẩn</span>}</td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => handleOpenEditModal(item)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md mr-2">Sửa</button>
                  <button onClick={() => handleDeleteItem(item.id)} className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-md">Xóa</button>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan="7" className="py-4 px-4 text-center text-gray-400">Không tìm thấy vật phẩm nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
      />
    </div>
  );
}