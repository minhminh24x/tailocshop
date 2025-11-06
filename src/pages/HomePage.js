// src/pages/HomePage.js
import React from 'react';
import HeroSection from '../components/home/HeroSection.js'; // Nhớ thêm .js
import FeaturedItems from '../components/home/FeaturedItems.js'; // Nhớ thêm .js

export default function HomePage() {
  return (
    <main>
      {/* 1. Phần Hero */}
      <HeroSection />

      {/* 2. Phần vật phẩm (cần cuộn xuống 1 tý để thấy) */}
      <FeaturedItems />
      
      {/* (Bạn có thể thêm các section khác ở đây) */}
    </main>
  );
}