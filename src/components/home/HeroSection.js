// src/components/home/HeroSection.js
import React from 'react';

export default function HeroSection() {
  return (
    <section className="text-center py-20">
      {/* Hiệu ứng 1: Chữ Gradient "Vip Pro" */}
      <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
        Tài Lộc Shop
      </h1>

      {/* Hiệu ứng 2: Chữ mờ dần từ trên xuống */}
      <p className="mt-4 text-xl md:text-2xl text-gray-300 animate-fade-down animate-delay-300">
        Shop uy tín nhất MegaEarth - KingMC 
      </p>
    </section>
  );
}