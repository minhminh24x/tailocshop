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

export default function AdminManageItems() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      // Lưu ý: API hiện tại có thể chỉ trả về các item "isActive: true"
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
        // Cập nhật
        await updateItemAdmin(itemToEdit.id, itemData);
        toast.success('Cập nhật vật phẩm thành công!');
      } else {
        // Tạo mới
        await createItemAdmin(itemData);
        toast.success('Tạo vật phẩm mới thành công!');
      }
      handleCloseModal();
      fetchItems(); // Tải lại danh sách
    } catch (err) {
      const errorMsg = err.response?.data?.errors ? err.response.data.errors.join(', ') : (err.response?.data?.message || 'Thao tác thất bại');
      toast.error(errorMsg);
      // Không đóng modal nếu có lỗi
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vật phẩm này? (Nếu vật phẩm đã có trong đơn hàng, sẽ không xóa được)')) {
      try {
        await deleteItemAdmin(id);
        toast.success('Xóa vật phẩm thành công!');
        fetchItems(); // Tải lại danh sách
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Không thể xóa vật phẩm';
        toast.error(errorMsg);
      }
    }
  };
  /**
   * Hiển thị badge trạng thái tồn kho
   * @param {object} props
   * @param {number} props.quantity Số lượng tồn kho
   */
  const StockStatusBadge = ({ quantity }) => {
    let text = 'Còn Nhiều';
    let classes = 'bg-green-700 text-green-100 border-green-500'; // "Còn Nhiều"

    if (quantity <= 0) {
      text = 'Hết Hàng';
      classes = 'bg-red-700 text-red-100 border-red-500'; // "Hết Hàng"
    } else if (quantity <= 20) {
      // Bạn có thể thay đổi mốc 20 này thành 10, 50, ... tùy ý
      text = 'Còn Ít';
      classes = 'bg-yellow-700 text-yellow-100 border-yellow-500'; // "Còn Ít"
    }

    // Thêm viền mờ như bạn yêu cầu
    const style = `px-3 py-1 text-xs font-semibold rounded-full border ${classes}`;

    return (
      <span className={style}>
        {text}
      </span>
    );
  };

  // === Render ===
  if (isLoading) {
    return <p className="text-center text-lg text-gray-300">Đang tải vật phẩm...</p>;
  }

  if (error) {
    return <p className="text-center text-lg text-red-400">Lỗi: {error}</p>;
  }

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

      {/* Bảng dữ liệu */}
      <div className="bg-gray-900 shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full text-white">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Tên Vật phẩm</th>
              <th className="py-3 px-4 text-left">Phân loại</th>
              <th className="py-3 px-4 text-left">Đơn vị</th>
              <th className="py-3 px-4 text-center">Giá (Xu)</th> {/* Sửa: text-center */}
              <th className="py-3 px-4 text-center">Tồn kho</th> {/* Sửa: text-center */}
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-700">
                <td className="py-3 px-4 font-medium">{item.name}</td>
                <td className="py-3 px-4 text-gray-400">{item.category?.name || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-400">{item.unit}</td>
                <td className="py-3 px-4 text-center font-mono text-green-400">{item.priceCoin || 0}</td>
                <td className="py-3 px-4 text-center">
                  <StockStatusBadge quantity={item.stockQuantity} />
                </td>
                <td className="py-3 px-4 text-center">{item.isActive ? (<span className="px-2 py-1 text-xs font-semibold bg-green-700 text-green-100 rounded-full">Kích hoạt</span>) : (<span className="px-2 py-1 text-xs font-semibold bg-red-700 text-red-100 rounded-full">Ẩn</span>)}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-md"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="7" className="py-4 px-4 text-center text-gray-400">
                  Chưa có vật phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo/Sửa */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
      />
    </div>
  );
}