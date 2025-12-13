// File: frontend/src/components/item/ItemReviews.js
import React, { useState, useEffect } from 'react';
import { Star, User, Send } from 'lucide-react';
import { getItemReviews, createReview } from '../../services/reviewService.js';
import { useAuthStore } from '../../store/authStore.js';
import toast from 'react-hot-toast';

/**
 * Component hiển thị và tạo reviews cho sản phẩm
 * @param {string} itemId - ID của sản phẩm
 */
export default function ItemReviews({ itemId }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuthStore();

    const fetchReviews = async (pageNum = 1, append = false) => {
        try {
            setIsLoading(true);
            const { data } = await getItemReviews(itemId, { page: pageNum, limit: 5 });

            if (append) {
                setReviews(prev => [...prev, ...data.data]);
            } else {
                setReviews(data.data);
            }
            setStats(data.stats);
            setHasMore(pageNum < data.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (itemId) {
            fetchReviews();
        }
    }, [itemId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage, true);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            return;
        }

        if (rating === 0) {
            toast.error('Vui lòng chọn số sao');
            return;
        }

        try {
            setIsSubmitting(true);
            const { data: newReview } = await createReview({
                itemId,
                rating,
                comment: comment.trim() || null
            });

            if (newReview.isApproved) {
                setReviews(prev => [newReview, ...prev]);
                toast.success('Đánh giá của bạn đã được đăng!');
            } else {
                toast.success('Đánh giá của bạn đang chờ duyệt');
            }

            // Reset form
            setRating(0);
            setComment('');
            setShowForm(false);
            fetchReviews(1); // Refresh to get updated stats
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể gửi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (value, interactive = false) => {
        return [...Array(5)].map((_, index) => {
            const starValue = index + 1;
            const currentValue = interactive ? (hoverRating || rating) : value;

            return (
                <Star
                    key={index}
                    className={`w-5 h-5 ${starValue <= currentValue
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-600'
                        } ${interactive ? 'cursor-pointer transition-colors' : ''}`}
                    onClick={interactive ? () => setRating(starValue) : undefined}
                    onMouseEnter={interactive ? () => setHoverRating(starValue) : undefined}
                    onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                />
            );
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white mb-2">Đánh giá sản phẩm</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
                        <span className="text-2xl font-bold text-yellow-400">
                            {stats.averageRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                            ({stats.totalReviews} đánh giá)
                        </span>
                    </div>
                </div>

                {user && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                    >
                        <Star className="w-4 h-4" />
                        Viết đánh giá
                    </button>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-800 rounded-lg">
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Số sao của bạn</label>
                        <div className="flex gap-1">
                            {renderStars(rating, true)}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Nhận xét (tùy chọn)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                            rows="3"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 && !isLoading ? (
                    <p className="text-gray-500 text-center py-8">
                        Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
                    </p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="p-4 bg-gray-800 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{review.user?.inGameName || 'Ẩn danh'}</p>
                                        <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                            </div>
                            {review.comment && (
                                <p className="text-gray-300 mt-2 pl-13">{review.comment}</p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Load More */}
            {hasMore && (
                <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="w-full mt-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition"
                >
                    {isLoading ? 'Đang tải...' : 'Xem thêm đánh giá'}
                </button>
            )}
        </div>
    );
}
