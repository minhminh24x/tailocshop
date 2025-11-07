/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Quét tất cả file React
    "./public/index.html"
  ],
  theme: {
    extend: {
      // --- THÊM PHẦN NÀY VÀO ---
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-up-fade': 'slide-up-fade 0.4s ease-out forwards',
      },
      // --- KẾT THÚC PHẦN NÀY ---  
    },
  },
  plugins: [],
};