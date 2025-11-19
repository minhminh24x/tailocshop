// File: frontend/src/components/cart/LoginPromptModal.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPromptModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy vị trí trang cart

  const handleLogin = () => {
    onClose();
    // Chuyển đến trang login, mang theo state 'from'
    // để sau khi login, quay lại đúng trang cart
      
    navigate('/login', { state: { from: location } });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 p-0.5 shadow-2xl animate-slide-up-fade">
        <div className="relative w-full max-w-md rounded-xl bg-gray-800 p-6">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 bg-opacity-20 text-blue-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A1.5 1.5 0 0118 21.75H6a1.5 1.5 0 01-1.499-1.632z" />
              </svg>
            </div>
            
            <h3 className="mt-4 text-2xl font-bold text-white">
              Bạn chưa đăng nhập
            </h3>
          </div>

          <div className="mt-5 space-y-3 text-center text-gray-300">
            <p className="text-base">
              Đăng nhập để nhận được nhiều khuyến mãi hơn và tiến hành đặt hàng!
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse">
            <button
              onClick={handleLogin}
              className="w-full sm:w-auto justify-center rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white shadow-lg transition duration-300 ease-in-out hover:bg-blue-700"
            >
              Đăng nhập ngay
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto justify-center mt-3 sm:mt-0 rounded-lg bg-gray-700 px-5 py-3 text-base font-medium text-gray-300 transition duration-300 hover:bg-gray-600"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}