// File: frontend/src/pages/admin/manager/AdminManageApplications.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import apiClient from '../../../services/apiClient';
import Pagination from '../../../components/common/Pagination';
import { FaSearch, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { Users, Store, Handshake } from 'lucide-react';

export default function AdminManageApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('PENDING');
    const [selectedApp, setSelectedApp] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 20,
            };
            if (filterType) params.type = filterType;
            if (filterStatus) params.status = filterStatus;

            const { data } = await apiClient.get('/applications', { params });
            setApplications(data.data || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalItems(data.pagination?.total || 0);
        } catch (error) {
            console.error('[Applications] Error:', error);
            toast.error('Lỗi khi tải danh sách đơn đăng ký');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filterType, filterStatus]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleApprove = async (app) => {
        if (!window.confirm(`Duyệt đơn đăng ký của ${app.inGameName}?`)) return;
        try {
            await apiClient.put(`/applications/${app.id}/status`, { status: 'APPROVED' });
            toast.success(`Đã duyệt đơn của ${app.inGameName}`);
            fetchApplications();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi duyệt');
        }
    };

    const handleReject = async (app) => {
        const reason = window.prompt(`Lý do từ chối đơn của ${app.inGameName}:`, 'Không đủ điều kiện');
        if (!reason) return;
        try {
            await apiClient.put(`/applications/${app.id}/status`, {
                status: 'REJECTED',
                rejectReason: reason,
            });
            toast.success(`Đã từ chối đơn của ${app.inGameName}`);
            fetchApplications();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi từ chối');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'STAFF': return <Users className="w-4 h-4" />;
            case 'SUPPLIER': return <Store className="w-4 h-4" />;
            case 'PARTNER': return <Handshake className="w-4 h-4" />;
            default: return null;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'STAFF': return 'Staff';
            case 'SUPPLIER': return 'Nhà cung cấp';
            case 'PARTNER': return 'Đối tác';
            default: return type;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-600 text-white';
            case 'APPROVED': return 'bg-green-600 text-white';
            case 'REJECTED': return 'bg-red-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ duyệt';
            case 'APPROVED': return 'Đã duyệt';
            case 'REJECTED': return 'Đã từ chối';
            default: return status;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Đơn Đăng Ký</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <select
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                >
                    <option value="">Tất cả loại</option>
                    <option value="STAFF">Staff</option>
                    <option value="SUPPLIER">Nhà cung cấp</option>
                    <option value="PARTNER">Đối tác</option>
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Đã từ chối</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-white/10">
                <table className="min-w-full text-white">
                    <thead className="bg-slate-800">
                        <tr>
                            <th className="py-3 px-4 text-left">Loại</th>
                            <th className="py-3 px-4 text-left">Tên In-game</th>
                            <th className="py-3 px-4 text-left">Email</th>
                            <th className="py-3 px-4 text-left">Discord</th>
                            <th className="py-3 px-4 text-center">Trạng thái</th>
                            <th className="py-3 px-4 text-center">Ngày gửi</th>
                            <th className="py-3 px-4 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-400">Đang tải...</td>
                            </tr>
                        ) : applications.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-400">
                                    Không có đơn đăng ký nào
                                </td>
                            </tr>
                        ) : (
                            applications.map((app) => (
                                <tr key={app.id} className="hover:bg-white/5">
                                    <td className="py-3 px-4">
                                        <span className="flex items-center gap-2">
                                            {getTypeIcon(app.type)}
                                            {getTypeLabel(app.type)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-medium">{app.inGameName}</td>
                                    <td className="py-3 px-4 text-gray-400">{app.email}</td>
                                    <td className="py-3 px-4 text-blue-400">{app.discord || '-'}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(app.status)}`}>
                                            {getStatusLabel(app.status)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-gray-400 text-sm">
                                        {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => { setSelectedApp(app); setShowDetailModal(true); }}
                                                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                                                title="Xem chi tiết"
                                            >
                                                <FaEye />
                                            </button>
                                            {app.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(app)}
                                                        className="p-2 bg-green-600 hover:bg-green-500 text-white rounded"
                                                        title="Duyệt"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(app)}
                                                        className="p-2 bg-red-600 hover:bg-red-500 text-white rounded"
                                                        title="Từ chối"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer info */}
            <p className="text-gray-400 text-sm mt-4">
                Tổng cộng: <strong>{totalItems}</strong> đơn đăng ký
            </p>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-white/10 max-h-[80vh] overflow-y-auto">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Chi tiết đơn đăng ký</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 text-sm">Loại</p>
                                    <p className="text-white font-medium flex items-center gap-2">
                                        {getTypeIcon(selectedApp.type)} {getTypeLabel(selectedApp.type)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Trạng thái</p>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(selectedApp.status)}`}>
                                        {getStatusLabel(selectedApp.status)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Tên In-game</p>
                                    <p className="text-yellow-400 font-bold">{selectedApp.inGameName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Email</p>
                                    <p className="text-white">{selectedApp.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Discord</p>
                                    <p className="text-blue-400">{selectedApp.discord || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Ngày gửi</p>
                                    <p className="text-white">{new Date(selectedApp.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>

                            {/* Form Data */}
                            {selectedApp.formData && Object.keys(selectedApp.formData).length > 0 && (
                                <div className="p-4 bg-slate-800 rounded-xl">
                                    <p className="text-gray-400 text-sm mb-2">Thông tin bổ sung:</p>
                                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                                        {JSON.stringify(selectedApp.formData, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedApp.rejectReason && (
                                <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
                                    <p className="text-red-400 text-sm">Lý do từ chối: {selectedApp.rejectReason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
