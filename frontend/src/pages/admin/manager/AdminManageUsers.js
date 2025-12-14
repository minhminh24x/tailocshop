// File: frontend/src/pages/admin/manager/AdminManageUsers.js
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../../../services/adminUserService';
import CreateUserModal from '../../../components/admin/CreateUserModal';
import Pagination from '../../../components/common/Pagination';
import { FaSearch, FaCoins } from 'react-icons/fa';
import { formatNumber } from '../../../utils/formatNumber';

export default function AdminManageUsers({ type = 'STAFF' }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // [NÂNG CẤP] Server-side Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const isCustomerMode = type === 'CUSTOMER';
  const pageTitle = isCustomerMode ? 'Quản lý Khách hàng' : 'Quản lý Nhân sự';
  const rolesToFetch = isCustomerMode ? ['CUSTOMER'] : ['STAFF', 'SUPPLIER'];

  // [SỬA] Dùng ref để track mounted state và prevent infinite loops
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // [SỬA] Fetch với kiểm tra prevent duplicate calls
  useEffect(() => {
    // Prevent concurrent calls
    if (fetchInProgress.current) return;

    const fetchUsers = async () => {
      fetchInProgress.current = true;
      setLoading(true);

      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          roles: rolesToFetch.join(','),
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const response = await getUsers(params);
        console.log('[AdminManageUsers] API Response:', response); // DEBUG

        if (isMounted.current) {
          // [FIX] API trả về { data: [...], pagination: {...} }
          // response đã là object chứa data và pagination
          const usersData = response?.data || [];
          const paginationData = response?.pagination || {};

          console.log('[AdminManageUsers] Users:', usersData); // DEBUG

          setUsers(usersData);
          setTotalPages(paginationData.totalPages || 1);
          setTotalItems(paginationData.total || 0);
        }
      } catch (error) {
        if (isMounted.current) {
          toast.error('Lỗi khi tải danh sách người dùng');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
        fetchInProgress.current = false;
      }
    };

    fetchUsers();
  }, [currentPage, itemsPerPage, debouncedSearch, type]); // [SỬA] Dùng type thay vì rolesToFetch

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset khi đổi type (Customer vs Staff) - CHỈ reset search và page
  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, [type]);

  const handleUserCreated = () => {
    setIsModalOpen(false);
    setCurrentPage(1); // Trigger refetch
    toast.success('Tạo tài khoản thành công!');
  };

  const handleRowClick = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
        {!isCustomerMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            + Tạo tài khoản mới
          </button>
        )}
      </div>

      {/* Search (cho cả Customer và Staff) */}
      <div className="relative mb-6 max-w-md">
        <input
          type="text"
          placeholder="Tìm theo tên, email..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
      </div>

      {/* Table */}
      <div className="bg-slate-900 shadow-xl rounded-lg overflow-hidden border border-white/10">
        <table className="min-w-full text-white">
          <thead className="bg-slate-800">
            <tr>
              <th className="py-3 px-4 text-left">Tên In-game</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Vai trò</th>
              {isCustomerMode && (
                <>
                  <th className="py-3 px-4 text-left">Cấp VIP</th>
                  <th className="py-3 px-4 text-right">Tổng chi tiêu</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={isCustomerMode ? 5 : 3} className="text-center py-8 text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={isCustomerMode ? 5 : 3} className="text-center py-8 text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(user.id)}
                >
                  <td className="p-4 font-medium text-yellow-400">{user.inGameName}</td>
                  <td className="p-4 text-gray-300">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-900 text-red-200' :
                      user.role === 'STAFF' ? 'bg-green-900 text-green-200' :
                        user.role === 'SUPPLIER' ? 'bg-blue-900 text-blue-200' :
                          'bg-gray-900 text-gray-200'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  {isCustomerMode && (
                    <>
                      <td className="p-4 text-blue-400">
                        {user.vipLevel?.name || 'Mới'}
                      </td>
                      <td className="p-4 text-right text-yellow-400 flex items-center justify-end">
                        <FaCoins className="mr-1" />
                        {formatNumber(user.totalCoinSpent || 0)}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Info */}
      <div className="mt-4 flex justify-between items-center text-gray-400">
        <span>
          Tổng cộng: <strong className="text-white">{totalItems}</strong> người dùng
        </span>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUserCreated}
        defaultRole={isCustomerMode ? 'CUSTOMER' : 'STAFF'}
      />
    </div>
  );
}