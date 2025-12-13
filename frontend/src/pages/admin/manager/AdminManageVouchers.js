// File: frontend/src/pages/admin/manager/AdminManageVouchers.js
import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getAllVouchers, createVoucher, updateVoucher, deleteVoucher } from '../../../services/voucherService.js';
import { formatNumber } from '../../../utils/formatNumber.js';
import Pagination from '../../../components/common/Pagination.js';
import toast from 'react-hot-toast';

export default function AdminManageVouchers() {
    const [vouchers, setVouchers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterActive, setFilterActive] = useState('all'); // 'all', 'true', 'false'

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        isActive: true,
        startDate: '',
        endDate: ''
    });

    const fetchVouchers = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = { page: currentPage, limit: 10 };
            if (filterActive !== 'all') {
                params.isActive = filterActive;
            }
            const { data } = await getAllVouchers(params);
            setVouchers(data.data);
            setPagination(data.pagination);
        } catch (error) {
            toast.error('Không thể tải danh sách voucher');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, filterActive]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    const handleOpenModal = (voucher = null) => {
        if (voucher) {
            setEditingVoucher(voucher);
            setFormData({
                code: voucher.code,
                description: voucher.description || '',
                discountType: voucher.discountType,
                discountValue: voucher.discountValue,
                minOrderValue: voucher.minOrderValue || '',
                maxDiscount: voucher.maxDiscount || '',
                usageLimit: voucher.usageLimit || '',
                isActive: voucher.isActive,
                startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().slice(0, 16) : '',
                endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().slice(0, 16) : ''
            });
        } else {
            setEditingVoucher(null);
            setFormData({
                code: '',
                description: '',
                discountType: 'PERCENTAGE',
                discountValue: '',
                minOrderValue: '',
                maxDiscount: '',
                usageLimit: '',
                isActive: true,
                startDate: '',
                endDate: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVoucher(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            code: formData.code,
            description: formData.description || null,
            discountType: formData.discountType,
            discountValue: parseFloat(formData.discountValue),
            minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            isActive: formData.isActive,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null
        };

        try {
            if (editingVoucher) {
                await updateVoucher(editingVoucher.id, payload);
                toast.success('Cập nhật voucher thành công');
            } else {
                await createVoucher(payload);
                toast.success('Tạo voucher thành công');
            }
            handleCloseModal();
            fetchVouchers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thao tác thất bại');
        }
    };

    const handleDelete = async (voucherId) => {
        if (!window.confirm('Bạn có chắc muốn xóa voucher này?')) return;

        try {
            await deleteVoucher(voucherId);
            toast.success('Xóa voucher thành công');
            fetchVouchers();
        } catch (error) {
            toast.error('Không thể xóa voucher');
        }
    };

    const handleToggleActive = async (voucher) => {
        try {
            await updateVoucher(voucher.id, { isActive: !voucher.isActive });
            toast.success(voucher.isActive ? 'Đã tắt voucher' : 'Đã bật voucher');
            fetchVouchers();
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Ticket className="w-8 h-8 text-pink-500" />
                    <h1 className="text-3xl font-bold text-white">Quản lý Voucher</h1>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                    <Plus className="w-5 h-5" />
                    Tạo Voucher
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
                {['all', 'true', 'false'].map(val => (
                    <button
                        key={val}
                        onClick={() => { setFilterActive(val); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterActive === val
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {val === 'all' ? 'Tất cả' : val === 'true' ? 'Đang hoạt động' : 'Đã tắt'}
                    </button>
                ))}
            </div>

            {/* Table */}
            {isLoading ? (
                <p className="text-gray-400 text-center py-8">Đang tải...</p>
            ) : (
                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="py-3 px-4 text-left">Mã</th>
                                    <th className="py-3 px-4 text-left">Loại</th>
                                    <th className="py-3 px-4 text-right">Giảm</th>
                                    <th className="py-3 px-4 text-center">Đã dùng</th>
                                    <th className="py-3 px-4 text-center">Trạng thái</th>
                                    <th className="py-3 px-4 text-center">Hạn</th>
                                    <th className="py-3 px-4 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {vouchers.map((voucher) => (
                                    <tr key={voucher.id} className="hover:bg-gray-800/50">
                                        <td className="py-3 px-4 font-mono font-bold text-pink-400">{voucher.code}</td>
                                        <td className="py-3 px-4">
                                            {voucher.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Xu cố định'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-semibold text-yellow-400">
                                            {voucher.discountType === 'PERCENTAGE'
                                                ? `${voucher.discountValue}%`
                                                : `${formatNumber(voucher.discountValue)} Xu`}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {voucher.usedCount}{voucher.usageLimit ? `/${voucher.usageLimit}` : ''}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button onClick={() => handleToggleActive(voucher)}>
                                                {voucher.isActive ? (
                                                    <ToggleRight className="w-6 h-6 text-green-400 inline" />
                                                ) : (
                                                    <ToggleLeft className="w-6 h-6 text-gray-500 inline" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-center text-sm text-gray-400">
                                            {formatDate(voucher.endDate)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleOpenModal(voucher)}
                                                className="p-2 hover:bg-blue-600 rounded-lg transition mr-1"
                                                title="Sửa"
                                            >
                                                <Edit2 className="w-4 h-4 text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(voucher.id)}
                                                className="p-2 hover:bg-red-600 rounded-lg transition"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {vouchers.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8 text-gray-500">
                                            Chưa có voucher nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-gray-800">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit} className="p-6">
                            <h3 className="text-2xl font-bold text-white mb-6">
                                {editingVoucher ? 'Sửa Voucher' : 'Tạo Voucher mới'}
                            </h3>

                            <div className="space-y-4">
                                {/* Code */}
                                <div>
                                    <label className="block text-gray-300 mb-1">Mã voucher *</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white uppercase"
                                        required
                                        disabled={!!editingVoucher}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-gray-300 mb-1">Mô tả</label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                </div>

                                {/* Discount Type & Value */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Loại giảm giá</label>
                                        <select
                                            name="discountType"
                                            value={formData.discountType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        >
                                            <option value="PERCENTAGE">Phần trăm (%)</option>
                                            <option value="FIXED_COIN">Xu cố định</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Giá trị *</label>
                                        <input
                                            type="number"
                                            name="discountValue"
                                            value={formData.discountValue}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Min Order & Max Discount */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Đơn tối thiểu (Xu)</label>
                                        <input
                                            type="number"
                                            name="minOrderValue"
                                            value={formData.minOrderValue}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Giảm tối đa (Xu)</label>
                                        <input
                                            type="number"
                                            name="maxDiscount"
                                            value={formData.maxDiscount}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                    </div>
                                </div>

                                {/* Usage Limit */}
                                <div>
                                    <label className="block text-gray-300 mb-1">Số lần sử dụng tối đa</label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        placeholder="Để trống = không giới hạn"
                                    />
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Bắt đầu</label>
                                        <input
                                            type="datetime-local"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Kết thúc</label>
                                        <input
                                            type="datetime-local"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                    </div>
                                </div>

                                {/* Active */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded"
                                    />
                                    <span className="text-gray-300">Kích hoạt ngay</span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                                >
                                    {editingVoucher ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
