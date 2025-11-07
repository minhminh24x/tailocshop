// src/components/home/HeroSection.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20 md:py-32 overflow-hidden shadow-xl rounded-b-3xl">
      {/* Background Pattern (tùy chọn để thêm "wao") */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg className="w-full h-full" fill="none" viewBox="0 0 100 100">
          <pattern id="pattern-circles" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#4A5568"></circle>
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center animate-fade-in-up">
        {/* Tiêu đề chính */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-pink-500">
          Tài Lộc Shop
        </h1>

        {/* Phụ đề */}
        <p className="text-xl md:text-3xl text-gray-300 font-light mb-8 max-w-2xl mx-auto leading-relaxed">
          Shop uy tín nhất <span className="font-semibold text-white">MegaEarth</span> - <span className="font-semibold text-white">KingMC</span>
        </p>

        {/* Nút Call-to-Action */}
        <div className="flex justify-center space-x-4">
          <Link
            to="/items"
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
          >
            Khám phá vật phẩm
          </Link>
          <Link
            to="/about"
            className="bg-transparent border-2 border-white hover:border-pink-500 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
          >
            Tìm hiểu thêm
          </Link>
        </div>
      </div>
    </section>
  );
}