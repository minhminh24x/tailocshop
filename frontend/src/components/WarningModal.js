// src/components/WarningModal.js
import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'tailocShopWarningDismissed';
//const EXPIRATION_TIME = 30 * 60 * 1000; // 30 phút
const EXPIRATION_TIME = 30 ; 
export default function WarningModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Logic kiểm tra thời gian (giữ nguyên, đã tối ưu)
  useEffect(() => {
    const dismissedTimestamp = localStorage.getItem(STORAGE_KEY);
    
    if (!dismissedTimestamp) {
      setIsOpen(true);
    } else {
      const currentTime = new Date().getTime();
      const timePassed = currentTime - Number(dismissedTimestamp);

      if (timePassed > EXPIRATION_TIME) {
        setIsOpen(true);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Hàm này giờ sẽ có thêm state "closing" để tạo hiệu ứng "fade-out"
  const handleClose = () => {
    // 1. Lưu thời gian
    localStorage.setItem(STORAGE_KEY, new Date().getTime().toString());
    
    // 2. Đóng modal
    // (Chúng ta có thể thêm animation fade-out ở đây nếu muốn,
    // nhưng để đơn giản, ta sẽ đóng ngay)
    setIsOpen(false); 
  };

  if (!isOpen) {
    return null;
  }

  return (
    // Lớp nền mờ (Backdrop) với hiệu ứng 'fade-in'
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4 backdrop-blur-sm animate-fade-in">
      
      {/* Khung viền Gradient (Tùy chọn, tạo hiệu ứng "wao") */}
      <div className="rounded-2xl bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 p-0.5 shadow-2xl animate-slide-up-fade">
        
        {/* Khung nội dung modal */}
        <div className="relative w-full max-w-md rounded-xl bg-gray-800 p-6">
          
          <div className="flex flex-col items-center text-center">
            {/* Biểu tượng "Wao" hơn */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 bg-opacity-20 text-red-400">
              <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            </div>
            
            {/* Tiêu đề */}
            <h3 className="mt-4 text-2xl font-bold text-white">
              Lưu Ý Quan Trọng
            </h3>
          </div>

          {/* Nội dung */}
          <div className="mt-5 space-y-3 text-center text-gray-300">
            <p className="text-base">
              Tất cả vật phẩm tại <strong>Tài Lộc Shop</strong> được giao dịch bằng <strong>Tiền ($)</strong> và <strong>Xu</strong> trong Server KingMC (MegaEarth).
            </p>
            <p className="rounded-md border border-red-700 bg-red-900 bg-opacity-30 p-3 text-lg font-bold text-red-300">
              KHÔNG chấp nhận thanh toán bằng VND (Việt Nam Đồng) hay TIỀN MẶT dưới mọi hình thức.
            </p>
          </div>

          {/* Nút Đóng */}
          <div className="mt-6">
            <button
              onClick={handleClose}
              className="w-full rounded-lg bg-purple-600 px-5 py-3 text-base font-medium text-white shadow-lg transition duration-300 ease-in-out hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Tôi đã đọc và hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}