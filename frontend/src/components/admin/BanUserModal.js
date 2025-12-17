// File: frontend/src/components/admin/BanUserModal.js
import React, { useState } from 'react';
import { X, Ban, Calendar, AlertTriangle } from 'lucide-react';

export default function BanUserModal({ isOpen, onClose, user, onBan }) {
    const [reason, setReason] = useState('Vi phạm quy định');
    const [banType, setBanType] = useState('permanent'); // 'permanent' or 'temporary'
    const [banUntil, setBanUntil] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const predefinedReasons = [
        'Vi phạm quy định',
        'Gian lận, lừa đảo',
        'Spam, quấy rối',
        'Lạm dụng voucher',
        'Hủy đơn nhiều lần',
        'Khác',
    ];

    if (!isOpen || !user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onBan({
                banned: true,
                reason,
                banUntil: banType === 'temporary' ? banUntil : null,
            });
            onClose();
        } catch (error) {
            console.error('Ban error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate min date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-red-500/30 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                        <Ban className="w-5 h-5" />
                        Khóa tài khoản
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* User info */}
                    <div className="p-3 bg-slate-800 rounded-xl">
                        <p className="text-gray-400 text-sm">Người dùng:</p>
                        <p className="text-white font-bold">{user.inGameName}</p>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>

                    {/* Warning */}
                    <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200">
                            Người dùng bị khóa sẽ không thể đăng nhập và sử dụng hệ thống.
                        </p>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Lý do khóa
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                        >
                            {predefinedReasons.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ban type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Loại khóa
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="banType"
                                    value="permanent"
                                    checked={banType === 'permanent'}
                                    onChange={() => setBanType('permanent')}
                                    className="text-red-500"
                                />
                                <span className="text-gray-300">Vĩnh viễn</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="banType"
                                    value="temporary"
                                    checked={banType === 'temporary'}
                                    onChange={() => setBanType('temporary')}
                                    className="text-orange-500"
                                />
                                <span className="text-gray-300">Tạm thời</span>
                            </label>
                        </div>
                    </div>

                    {/* Ban until (if temporary) */}
                    {banType === 'temporary' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Khóa đến ngày
                            </label>
                            <input
                                type="date"
                                value={banUntil}
                                onChange={(e) => setBanUntil(e.target.value)}
                                min={minDate}
                                required
                                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500"
                            />
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || (banType === 'temporary' && !banUntil)}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Đang xử lý...' : '🔒 Khóa tài khoản'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
