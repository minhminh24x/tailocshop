// File: frontend/src/components/order/OrderReviewModal.js
import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export default function OrderReviewModal({ order, isOpen, onClose, onSuccess }) {
    const [ratings, setRatings] = useState({
        productRating: 0,
        serviceRating: 0,
        staffRating: 0,
    });
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const ratingCategories = [
        { key: 'productRating', label: 'Chất lượng sản phẩm', emoji: '📦' },
        { key: 'serviceRating', label: 'Dịch vụ đặt hàng', emoji: '🛒' },
        { key: 'staffRating', label: 'Nhân viên phục vụ', emoji: '👤' },
    ];

    const handleSubmit = async () => {
        // Validate
        for (const cat of ratingCategories) {
            if (ratings[cat.key] === 0) {
                toast.error(`Vui lòng đánh giá ${cat.label}`);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await apiClient.post(`/order-reviews/orders/${order.id}`, {
                ...ratings,
                comment: comment.trim() || null,
            });

            toast.success('Cảm ơn bạn đã đánh giá! 🎉');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đánh giá thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">⭐ Đánh giá đơn hàng</h2>
                    <button onClick={onClose} className="text-slate-900 hover:text-slate-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div className="bg-slate-700/50 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">Mã đơn hàng</p>
                        <p className="text-white font-bold text-lg">#{order.orderNumber || order.id.slice(0, 8)}</p>
                        {order.staff && (
                            <p className="text-gray-400 text-sm mt-1">
                                Nhân viên: <span className="text-blue-400">{order.staff.inGameName}</span>
                            </p>
                        )}
                    </div>

                    {/* Rating Categories */}
                    {ratingCategories.map(category => (
                        <div key={category.key} className="space-y-2">
                            <label className="text-gray-300 font-medium flex items-center gap-2">
                                <span>{category.emoji}</span>
                                {category.label}
                            </label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRatings(prev => ({ ...prev, [category.key]: star }))}
                                        className={`p-1 transition-transform hover:scale-110 ${star <= ratings[category.key]
                                                ? 'text-yellow-400'
                                                : 'text-gray-600'
                                            }`}
                                    >
                                        <Star
                                            className="w-8 h-8"
                                            fill={star <= ratings[category.key] ? 'currentColor' : 'none'}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-gray-400 self-center">
                                    {ratings[category.key] > 0 ? `${ratings[category.key]}/5` : ''}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Comment */}
                    <div className="space-y-2">
                        <label className="text-gray-300 font-medium">💬 Nhận xét (tùy chọn)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                    >
                        Để sau
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Send className="w-5 h-5" />
                        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </div>
            </div>
        </div>
    );
}
