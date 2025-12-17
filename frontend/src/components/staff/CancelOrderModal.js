// File: frontend/src/components/staff/CancelOrderModal.js
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function CancelOrderModal({ isOpen, onClose, order, onCancel }) {
    const [reason, setReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const predefinedReasons = [
        { value: 'petrolimex', label: 'Thuộc Bang Petrolimex' },
        { value: 'wrong_name', label: 'Không đúng tên' },
        { value: 'out_of_stock', label: 'Hết hàng' },
        { value: 'no_contact', label: 'Không liên lạc được' },
        { value: 'customer_request', label: 'Khách yêu cầu hủy' },
        { value: 'other', label: 'Khác (nhập lý do)' },
    ];

    if (!isOpen || !order) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalReason = reason === 'other' ? customReason : reason;
        if (!finalReason) {
            return;
        }

        setIsLoading(true);
        try {
            await onCancel(finalReason);
            onClose();
        } catch (error) {
            console.error('Cancel error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedLabel = predefinedReasons.find(r => r.value === reason)?.label || '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-red-500/30 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Hủy Đơn Hàng
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Order info */}
                    <div className="p-3 bg-slate-800 rounded-xl">
                        <p className="text-gray-400 text-sm">Đơn hàng:</p>
                        <p className="text-white font-bold font-mono">
                            #{order.orderNumber || order.id?.slice(0, 8)}
                        </p>
                        <p className="text-gray-500 text-sm">Khách: {order.inGameName}</p>
                    </div>

                    {/* Warning */}
                    <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200">
                            Hủy đơn sẽ hoàn trả vật phẩm về kho và không thể hoàn tác.
                        </p>
                    </div>

                    {/* Reason selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Lý do hủy đơn *
                        </label>
                        <div className="space-y-2">
                            {predefinedReasons.map((r) => (
                                <label
                                    key={r.value}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${reason === r.value
                                            ? 'bg-red-900/30 border-red-500/50'
                                            : 'bg-slate-800 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.value}
                                        checked={reason === r.value}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="text-red-500"
                                    />
                                    <span className="text-gray-300">{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Custom reason input */}
                    {reason === 'other' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nhập lý do cụ thể *
                            </label>
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Nhập lý do hủy đơn..."
                                required
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 resize-none"
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
                            Đóng
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !reason || (reason === 'other' && !customReason)}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Đang xử lý...' : '❌ Xác nhận hủy'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
