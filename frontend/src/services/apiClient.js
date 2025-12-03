// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json', // [THÊM] Đảm bảo luôn gửi JSON
  }
});

export default axiosClient;