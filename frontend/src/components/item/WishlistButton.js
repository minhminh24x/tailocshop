// File: frontend/src/components/item/WishlistButton.js
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toggleWishlist, checkInWishlist } from '../../services/wishlistService.js';
import { useAuthStore } from '../../store/authStore.js';
import toast from 'react-hot-toast';

/**
 * Nút yêu thích cho sản phẩm
 * @param {string} itemId - ID của sản phẩm
 * @param {string} className - CSS classes
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function WishlistButton({ itemId, className = '', size = 'md' }) {
    const [inWishlist, setInWishlist] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuthStore();

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    // Kiểm tra trạng thái wishlist khi component mount
    // [SỬA] Chỉ gọi API nếu user đã đăng nhập
    useEffect(() => {
        // Không gọi API nếu chưa đăng nhập hoặc không có itemId
        if (!user || !itemId) {
            setInWishlist(false);
            return;
        }

        const checkStatus = async () => {
            try {
                const { data } = await checkInWishlist(itemId);
                setInWishlist(data.inWishlist);
            } catch (error) {
                // Quietly fail - set to false
                setInWishlist(false);
            }
        };

        checkStatus();
    }, [itemId, user?.id]); // Chỉ dependency vào user.id để tránh re-render không cần thiết

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
            return;
        }

        try {
            setIsLoading(true);
            const { data } = await toggleWishlist(itemId);
            setInWishlist(data.inWishlist);

            if (data.action === 'added') {
                toast.success('Đã thêm vào yêu thích ❤️');
            } else {
                toast.success('Đã xóa khỏi yêu thích');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`p-2 rounded-full transition-all duration-200 ${inWishlist
                ? 'bg-pink-600 text-white hover:bg-pink-700'
                : 'bg-gray-800/80 text-gray-400 hover:text-pink-400 hover:bg-gray-700'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            title={inWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
            <Heart
                className={sizeClasses[size]}
                fill={inWishlist ? 'currentColor' : 'none'}
            />
        </button>
    );
}
