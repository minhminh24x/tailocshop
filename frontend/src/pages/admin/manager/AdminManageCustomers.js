// File: frontend/src/pages/admin/manager/AdminManageCustomers.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { getUsers } from '../../../services/adminUserService';

export default function AdminManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = await getUsers(['CUSTOMER']);
        setCustomers(data);
      } catch (error) {
        toast.error('Lỗi khi tải danh sách khách hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Khách hàng</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto text-gray-900">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Tên In-game</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Cấp VIP</th>
                <th className="p-4 text-left">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{user.inGameName}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    {user.vipLevel ? user.vipLevel.name : 'Chưa có'} (Level {user.vipLevel.level})
                  </td>
                  <td className="p-4">
                    <Link
                      to={`/admin/customer/${user.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}