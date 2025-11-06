// src/services/apiClient.js
import axios from 'axios';

// ✅ Tự động chọn URL API (Render hoặc Local)
const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : 'https://tailocshop.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cho phép gửi cookie
});

export default apiClient;
