// File: frontend/src/pages/admin/manager/AdminExportData.js
import React, { useState } from 'react';
import { Download, FileSpreadsheet, Users, Package, ShoppingCart, Filter } from 'lucide-react';
import apiClient from '../../../services/apiClient.js';
import toast from 'react-hot-toast';

export default function AdminExportData() {
    const [isExporting, setIsExporting] = useState({});
    const [orderFilters, setOrderFilters] = useState({
        status: '',
        paymentStatus: '',
        fromDate: '',
        toDate: ''
    });
    const [inventoryFilters, setInventoryFilters] = useState({
        lowStockOnly: false,
        threshold: 10
    });

    const handleExport = async (type, filters = {}) => {
        setIsExporting(prev => ({ ...prev, [type]: true }));

        try {
            const params = new URLSearchParams(filters).toString();
            const response = await apiClient.get(
                `/export/${type}${params ? `?${params}` : ''}`,
                { responseType: 'blob' }
            );

            // Extract filename from content-disposition header
            const contentDisposition = response.headers['content-disposition'];
            const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
            const filename = filenameMatch ? filenameMatch[1] : `${type}_export.csv`;

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`Xuất ${type} thành công!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể xuất dữ liệu');
        } finally {
            setIsExporting(prev => ({ ...prev, [type]: false }));
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Download className="w-8 h-8 text-pink-500" />
                <h1 className="text-3xl font-bold text-white">Xuất Dữ Liệu</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* Export Orders */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-600/20 rounded-lg">
                            <ShoppingCart className="w-6 h-6 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Đơn hàng</h2>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">
                        Xuất danh sách đơn hàng với thông tin chi tiết
                    </p>

                    {/* Filters */}
                    <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Filter className="w-4 h-4" />
                            Bộ lọc (tùy chọn)
                        </div>

                        <select
                            value={orderFilters.status}
                            onChange={(e) => setOrderFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="PENDING">Đang chờ</option>
                            <option value="PREPARING">Đang chuẩn bị</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>

                        <select
                            value={orderFilters.paymentStatus}
                            onChange={(e) => setOrderFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                        >
                            <option value="">Tất cả thanh toán</option>
                            <option value="PAID">Đã thanh toán</option>
                            <option value="UNPAID">Chưa thanh toán</option>
                        </select>

                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={orderFilters.fromDate}
                                onChange={(e) => setOrderFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                                placeholder="Từ ngày"
                            />
                            <input
                                type="date"
                                value={orderFilters.toDate}
                                onChange={(e) => setOrderFilters(prev => ({ ...prev, toDate: e.target.value }))}
                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                                placeholder="Đến ngày"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => handleExport('orders', orderFilters)}
                        disabled={isExporting.orders}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition"
                    >
                        <FileSpreadsheet className="w-5 h-5" />
                        {isExporting.orders ? 'Đang xuất...' : 'Xuất CSV'}
                    </button>
                </div>

                {/* Export Inventory */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-600/20 rounded-lg">
                            <Package className="w-6 h-6 text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Tồn kho</h2>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">
                        Xuất danh sách sản phẩm với số lượng tồn kho
                    </p>

                    {/* Filters */}
                    <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Filter className="w-4 h-4" />
                            Bộ lọc (tùy chọn)
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={inventoryFilters.lowStockOnly}
                                onChange={(e) => setInventoryFilters(prev => ({ ...prev, lowStockOnly: e.target.checked }))}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-gray-300 text-sm">Chỉ sản phẩm sắp hết</span>
                        </label>

                        {inventoryFilters.lowStockOnly && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">Ngưỡng:</span>
                                <input
                                    type="number"
                                    value={inventoryFilters.threshold}
                                    onChange={(e) => setInventoryFilters(prev => ({ ...prev, threshold: e.target.value }))}
                                    className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                                    min="1"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => handleExport('inventory', inventoryFilters)}
                        disabled={isExporting.inventory}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition"
                    >
                        <FileSpreadsheet className="w-5 h-5" />
                        {isExporting.inventory ? 'Đang xuất...' : 'Xuất CSV'}
                    </button>
                </div>

                {/* Export Customers */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-600/20 rounded-lg">
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Khách hàng</h2>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">
                        Xuất danh sách khách hàng với thông tin VIP
                    </p>

                    <div className="h-24 flex items-center justify-center text-gray-500 text-sm mb-4">
                        Không có bộ lọc
                    </div>

                    <button
                        onClick={() => handleExport('customers')}
                        disabled={isExporting.customers}
                        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition"
                    >
                        <FileSpreadsheet className="w-5 h-5" />
                        {isExporting.customers ? 'Đang xuất...' : 'Xuất CSV'}
                    </button>
                </div>
            </div>
        </div>
    );
}
