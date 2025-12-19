// src/index.js
// [NÂNG CẤP] Thêm React Query Provider cho caching
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// [MỚI] Tạo QueryClient với cấu hình tối ưu
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data trong 5 phút
      staleTime: 5 * 60 * 1000,
      // Giữ cache trong 30 phút
      gcTime: 30 * 60 * 1000,
      // Retry 2 lần nếu fail
      retry: 2,
      // Không refetch khi focus window (giảm requests)
      refetchOnWindowFocus: false,
      // Không refetch khi reconnect
      refetchOnReconnect: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();
