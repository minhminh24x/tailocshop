// File: frontend/src/pages/WishlistPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { getMyWishlist, removeFromWishlist } from '../services/wishlistService.js';
import { useCartStore } from '../store/cartStore.js';
import { formatNumber } from '../utils/formatNumber.js';
import toast from 'react-hot-toast';

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addItem } = useCartStore();

    const fetchWishlist = async () => {
        try {
            setIsLoading(true);
            const { data } = await getMyWishlist();
            setWishlist(data);
        } catch (error) {
            toast.error('Không thể tải danh sách yêu thích');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (itemId) => {
        try {
            await removeFromWishlist(itemId);
            setWishlist(prev => prev.filter(w => w.itemId !== itemId));
            toast.success('Đã xóa khỏi danh sách yêu thích');
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    const handleAddToCart = (item) => {
        if (!item.isActive) {
            toast.error('Sản phẩm đã ngừng bán');
            return;
        }
        if (item.stockQuantity <= 0) {
            toast.error('Sản phẩm đã hết hàng');
            return;
        }
        addItem({
            id: item.id,
            name: item.name,
            slug: item.slug,
            unit: item.unit,
            thumbnailImageUrl: item.thumbnailImageUrl,
            priceCoin: parseFloat(item.priceCoin) || 0,
            priceUsd: parseFloat(item.priceUsd) || 0,
            stockQuantity: item.stockQuantity,
        }, 1);
        toast.success('Đã thêm vào giỏ hàng');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-300 text-lg">Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="w-8 h-8 text-pink-500" fill="currentColor" />
                    <h1 className="text-3xl font-bold">Danh sách yêu thích</h1>
                    <span className="bg-pink-600 px-3 py-1 rounded-full text-sm font-bold">
                        {wishlist.length}
                    </span>
                </div>

                {wishlist.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-400 mb-2">Danh sách trống</h2>
                        <p className="text-gray-500 mb-6">
                            Bạn chưa thêm sản phẩm nào vào danh sách yêu thích
                        </p>
                        <Link
                            to="/items"
                            className="inline-block bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                        >
                            Khám phá sản phẩm
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map(({ item, createdAt }) => (
                            <div
                                key={item.id}
                                className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-pink-500/50 transition-all group"
                            >
                                {/* Image */}
                                <Link to={`/items/${item.slug}/${item.unit}`}>
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={item.thumbnailImageUrl || 'https://placehold.co/400x300/1a1a2e/ffffff?text=Item'}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {!item.isActive && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="text-red-400 font-bold">Ngừng bán</span>
                                            </div>
                                        )}
                                        {item.stockQuantity <= 0 && item.isActive && (
                                            <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-xs font-bold">
                                                Hết hàng
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Content */}
                                <div className="p-4">
                                    <Link to={`/items/${item.slug}/${item.unit}`}>
                                        <h3 className="font-semibold text-lg text-white hover:text-pink-400 transition line-clamp-2">
                                            {item.name}
                                        </h3>
                                    </Link>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Đơn vị: {item.unit}
                                    </p>

                                    {/* Price */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {item.priceCoin && (
                                            <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-sm font-medium">
                                                {formatNumber(item.priceCoin)} Xu
                                            </span>
                                        )}
                                        {item.priceUsd && (
                                            <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-sm font-medium">
                                                ${formatNumber(item.priceUsd)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Stock */}
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        Kho: {item.stockQuantity}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={!item.isActive || item.stockQuantity <= 0}
                                            className="flex-1 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Thêm vào giỏ
                                        </button>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="p-2 bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white rounded-lg transition"
                                            title="Xóa khỏi yêu thích"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
