// File: frontend/src/pages/admin/manager/AdminManageInventory.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../../services/apiClient';
import { formatNumber } from '../../../utils/formatNumber';
import { FaBox, FaHistory, FaSearch } from 'react-icons/fa';

export default function AdminManageInventory() {
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('STOCK'); // STOCK or LOGS
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'STOCK') {
        // [FIX] Đổi endpoint từ /public sang /admin/all
        const res = await apiClient.get('/items/admin/all');
        setItems(res.data || []);
      } else {
        // Giả định endpoint lấy lịch sử nhập xuất kho
        // Nếu chưa có, cần tạo backend route: /inventory/logs
        // Ở đây ta sẽ mock data nếu API chưa có, hoặc try catch
        try {
          const res = await apiClient.get('/inventory/logs');
          setLogs(res.data);
        } catch (e) {
          // Mock data tạm thời nếu API chưa sẵn sàng
          setLogs([
            { id: 1, itemName: 'Kim Cương', change: +50, reason: 'Nhập hàng', date: new Date().toISOString(), user: 'Admin' },
            { id: 2, itemName: 'Vàng', change: -10, reason: 'Đơn hàng #123', date: new Date().toISOString(), user: 'System' },
          ]);
        }
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu kho');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Quản lý Kho hàng</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('STOCK')}
          className={`pb-2 px-4 font-semibold transition ${activeTab === 'STOCK'
            ? 'text-pink-500 border-b-2 border-pink-500'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          <FaBox className="inline mr-2" /> Tồn kho hiện tại
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`pb-2 px-4 font-semibold transition ${activeTab === 'LOGS'
            ? 'text-pink-500 border-b-2 border-pink-500'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          <FaHistory className="inline mr-2" /> Lịch sử Nhập/Xuất
        </button>
      </div>

      {/* Content */}
      {activeTab === 'STOCK' && (
        <div>
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Tìm kiếm vật phẩm..."
              className="w-full md:w-1/3 p-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          </div>

          <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-700">
            <table className="min-w-full text-white">
              <thead className="bg-gray-800">
                <tr>
                  <th className="py-3 px-4 text-left">Tên Vật phẩm</th>
                  <th className="py-3 px-4 text-center">Đơn vị</th>
                  <th className="py-3 px-4 text-center">Tồn kho</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-800">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-400">{item.unit}</td>
                    <td className="py-3 px-4 text-center font-bold text-lg">
                      {formatNumber(item.stockQuantity)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.stockQuantity > 0 ? (
                        <span className="text-green-400 text-xs font-bold px-2 py-1 bg-green-900/30 rounded-full">Còn hàng</span>
                      ) : (
                        <span className="text-red-400 text-xs font-bold px-2 py-1 bg-red-900/30 rounded-full">Hết hàng</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-700">
          <table className="min-w-full text-white">
            <thead className="bg-gray-800">
              <tr>
                <th className="py-3 px-4 text-left">Thời gian</th>
                <th className="py-3 px-4 text-left">Vật phẩm</th>
                <th className="py-3 px-4 text-center">Thay đổi</th>
                <th className="py-3 px-4 text-left">Lý do</th>
                <th className="py-3 px-4 text-left">Người thực hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-800">
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {new Date(log.date || log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">{log.itemName || log.item?.name}</td>
                  <td className={`py-3 px-4 text-center font-bold ${log.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {log.change > 0 ? '+' : ''}{log.change}
                  </td>
                  <td className="py-3 px-4 text-sm">{log.reason}</td>
                  <td className="py-3 px-4 text-sm text-gray-400">{log.user || log.user?.inGameName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}