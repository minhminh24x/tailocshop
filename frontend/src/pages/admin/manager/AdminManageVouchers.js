// File: frontend/src/pages/admin/manager/AdminManageVouchers.js
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    getAllVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher
} from '../../../services/voucherService.js';
import { FaPlus, FaEdit, FaTrash, FaPercent, FaDollarSign, FaTimes } from 'react-icons/fa';

export default function AdminManageVouchers() {
    const [vouchers, setVouchers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const fetchInProgress = useRef(false);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        startDate: '',
        endDate: '',
        isActive: true,
    });

    // Fetch vouchers
    useEffect(() => {
        if (fetchInProgress.current) return;

        const fetchVouchers = async () => {
            fetchInProgress.current = true;
            try {
                setIsLoading(true);
                const response = await getAllVouchers();
                // [SỬA] API trả về { data: { data: [...], pagination: {...} } }
                const vouchersData = response?.data?.data || response?.data || [];
                setVouchers(Array.isArray(vouchersData) ? vouchersData : []);
            } catch (error) {
                toast.error('Lỗi khi tải danh sách voucher');
                setVouchers([]);
            } finally {
                setIsLoading(false);
                fetchInProgress.current = false;
            }
        };

        fetchVouchers();
    }, []);

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountValue: '',
            minOrderValue: '',
            maxDiscount: '',
            usageLimit: '',
            startDate: '',
            endDate: '',
            isActive: true,
        });
        setEditingVoucher(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (voucher) => {
        setEditingVoucher(voucher);
        setFormData({
            code: voucher.code,
            description: voucher.description || '',
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            minOrderValue: voucher.minOrderValue || '',
            maxDiscount: voucher.maxDiscount || '',
            usageLimit: voucher.usageLimit || '',
            startDate: voucher.startDate ? voucher.startDate.split('T')[0] : '',
            endDate: voucher.endDate ? voucher.endDate.split('T')[0] : '',
            isActive: voucher.isActive,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
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

        if (!formData.code || !formData.discountValue) {
            toast.error('Vui lòng nhập mã voucher và giá trị giảm');
            return;
        }

        const payload = {
            code: formData.code.toUpperCase(),
            description: formData.description || null,
            discountType: formData.discountType,
            discountValue: parseFloat(formData.discountValue),
            minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
            endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
            isActive: formData.isActive,
        };

        try {
            if (editingVoucher) {
                await updateVoucher(editingVoucher.id, payload);
                toast.success('Cập nhật voucher thành công!');
            } else {
                await createVoucher(payload);
                toast.success('Tạo voucher mới thành công!');
            }

            // Refetch
            const response = await getAllVouchers();
            const vouchersData = response?.data?.data || response?.data || [];
            setVouchers(Array.isArray(vouchersData) ? vouchersData : []);
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thao tác thất bại');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa voucher này?')) return;

        try {
            await deleteVoucher(id);
            toast.success('Xóa voucher thành công!');
            setVouchers(prev => prev.filter(v => v.id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể xóa voucher');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Không giới hạn';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    if (isLoading) {
        return <p className="text-gray-400 text-center py-8">Đang tải danh sách voucher...</p>;
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Quản lý Voucher</h1>
                <button
                    onClick={handleOpenCreate}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center gap-2"
                >
                    <FaPlus /> Tạo Voucher
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-white/10">
                <table className="min-w-full text-white">
                    <thead className="bg-slate-800">
                        <tr>
                            <th className="py-3 px-4 text-left">Mã Code</th>
                            <th className="py-3 px-4 text-left">Loại giảm</th>
                            <th className="py-3 px-4 text-right">Giá trị</th>
                            <th className="py-3 px-4 text-center">Đã dùng / Giới hạn</th>
                            <th className="py-3 px-4 text-center">Hạn sử dụng</th>
                            <th className="py-3 px-4 text-center">Trạng thái</th>
                            <th className="py-3 px-4 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {vouchers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-gray-400">
                                    Chưa có voucher nào
                                </td>
                            </tr>
                        ) : (
                            vouchers.map((voucher) => (
                                <tr key={voucher.id} className="hover:bg-white/5">
                                    <td className="py-3 px-4">
                                        <span className="font-mono font-bold text-yellow-400">{voucher.code}</span>
                                        {voucher.description && (
                                            <p className="text-xs text-gray-500 mt-1">{voucher.description}</p>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${voucher.discountType === 'PERCENTAGE'
                                            ? 'bg-blue-900/50 text-blue-300'
                                            : 'bg-green-900/50 text-green-300'
                                            }`}>
                                            {voucher.discountType === 'PERCENTAGE' ? <FaPercent /> : <FaDollarSign />}
                                            {voucher.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-green-400">
                                        {voucher.discountType === 'PERCENTAGE'
                                            ? `${voucher.discountValue}%`
                                            : `${parseFloat(voucher.discountValue).toLocaleString('vi-VN')} Xu`
                                        }
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="text-gray-300">
                                            {voucher.usedCount} / {voucher.usageLimit || '∞'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-gray-400 text-sm">
                                        {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${voucher.isActive
                                            ? 'bg-green-900/50 text-green-300'
                                            : 'bg-red-900/50 text-red-300'
                                            }`}>
                                            {voucher.isActive ? 'Kích hoạt' : 'Tắt'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(voucher)}
                                                className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                                title="Sửa"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(voucher.id)}
                                                className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={handleCloseModal}>
                    <div
                        className="bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingVoucher ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Mã voucher *</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white uppercase focus:outline-none focus:border-yellow-500"
                                    placeholder="VD: SALE50"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Mô tả</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                    placeholder="VD: Giảm 50% cho mọi đơn hàng"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Discount Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Loại giảm *</label>
                                    <select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                    >
                                        <option value="PERCENTAGE">Phần trăm (%)</option>
                                        <option value="FIXED">Số xu cố định</option>
                                    </select>
                                </div>

                                {/* Discount Value */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Giá trị giảm {formData.discountType === 'PERCENTAGE' ? '(%)' : '(Xu)'} *
                                    </label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                        placeholder={formData.discountType === 'PERCENTAGE' ? '50' : '1000'}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Min Order */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Đơn tối thiểu (Xu)</label>
                                    <input
                                        type="number"
                                        name="minOrderValue"
                                        value={formData.minOrderValue}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Max Discount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Giảm tối đa (Xu)</label>
                                    <input
                                        type="number"
                                        name="maxDiscount"
                                        value={formData.maxDiscount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                        placeholder="Không giới hạn"
                                    />
                                </div>
                            </div>

                            {/* Usage Limit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Số lần sử dụng tối đa</label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    value={formData.usageLimit}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                    placeholder="Không giới hạn"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                    />
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                            </div>

                            {/* Active */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500"
                                />
                                <label htmlFor="isActive" className="text-gray-300">Kích hoạt ngay</label>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-bold rounded-xl transition-all"
                                >
                                    {editingVoucher ? 'Cập nhật' : 'Tạo Voucher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
