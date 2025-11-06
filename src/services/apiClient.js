import axios from "axios";

const apiClient = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? import.meta.env.VITE_API_URL
      : import.meta.env.VITE_API_URL_PROD,
  withCredentials: true,
});

export default apiClient;
