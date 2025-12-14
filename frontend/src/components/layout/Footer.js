// src/components/layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 py-8 mt-12 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-700 pb-8 mb-8">
          {/* Cột 1: Giới thiệu */}
          <div>
            <h3 className="text-xl font-bold text-pink-500 mb-4">Tài Lộc Shop</h3>
            <p className="text-gray-300">
              Cửa hàng uy tín nhất KingMC - MegaEarth. Cung cấp các vật phẩm độc đáo và giá trị.
            </p>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-pink-500 transition-colors duration-200">Trang chủ</Link></li>
              <li><Link to="/items" className="hover:text-pink-500 transition-colors duration-200">Sản phẩm</Link></li>
              <li><Link to="/contact" className="hover:text-pink-500 transition-colors duration-200">Liên hệ</Link></li>
              <li><Link to="/privacy" className="hover:text-pink-500 transition-colors duration-200">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Liên hệ chúng tôi</h3>
            <p>Email: <a href="mailto:loclm112.noreply@gmail.com" className="text-yellow-400 hover:underline">loclm112.noreply@gmail.com</a></p>
            <p>Discord: KingMCCommunity</p>
            <p>Server: play.kingmc.vn</p>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="text-center text-sm">
          &copy; {new Date().getFullYear()} Tài Lộc Shop. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
}