// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Đảm bảo file này đã được sửa ở Bước 2
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';
import { BrowserRouter } from 'react-router-dom'; // <-- 1. Import

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. Bọc App lại */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();