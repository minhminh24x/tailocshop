// src/pages/HomePage.js
import React from 'react';
// Nhớ thêm .js vào cuối file import
import HeroSection from '../components/home/HeroSection.js'; 
import FeaturedItems from '../components/home/FeaturedItems.js';
//oke luoi qua
export default function HomePage() {
  return (
    <main>
      {/* 1. Phần Hero (Giới thiệu "Vip Pro") */}
      <HeroSection />

      {/* 2. Phần vật phẩm (Cuộn xuống sẽ thấy) */}
      <FeaturedItems />
    </main>
  );
}