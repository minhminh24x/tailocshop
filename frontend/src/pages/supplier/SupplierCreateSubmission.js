// File: frontend/src/pages/supplier/SupplierCreateSubmission.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';

export default function SupplierCreateSubmission() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);
    const [notes, setNotes] = useState('');

    // Tải danh sách vật phẩm để chọn
    useEffect(() => {
        apiClient.get('/items/public') // Giả định có route public hoặc route cho supplier
            .then(res => setItems(res.data.items || []))
            .catch(err => toast.error('Không thể tải danh sách vật phẩm'));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedItem) {
            toast.error('Vui lòng chọn vật phẩm');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                details: [
                    {
                        itemId: selectedItem,
                        quantity: parseInt(quantity),
                        unit: 'PIECE', // Mặc định hoặc cho chọn
                        suggestedPricePerUnitCoin: parseFloat(price)
                    }
                ],
                supplierNotes: notes
            };

            await apiClient.post('/supplier-submissions', payload);
            toast.success('Tạo phiếu nhập thành công!');
            navigate('/supplier/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Tạo phiếu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-6">Tạo Phiếu nhập hàng mới</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-300 mb-2">Chọn Vật phẩm</label>
                    <select
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                        value={selectedItem}
                        onChange={(e) => setSelectedItem(e.target.value)}
                        required
                    >
                        <option value="">-- Chọn vật phẩm --</option>
                        {items.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-300 mb-2">Số lượng</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2">Giá đề xuất (Xu/cái)</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-300 mb-2">Ghi chú</label>
                    <textarea
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 h-32"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ghi chú cho Admin..."
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition disabled:bg-gray-600"
                >
                    {isLoading ? 'Đang gửi...' : 'Gửi Phiếu nhập'}
                </button>
            </form>
        </div>
    );
}
