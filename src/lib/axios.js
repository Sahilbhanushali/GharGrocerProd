import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, 
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const envToken = process.env.REACT_APP_API_BEARER_TOKEN;
    const localToken = localStorage.getItem("authToken");

    // Priority: config flag > local storage > env token
    if (config.useLocalToken && localToken) {
      config.headers.Authorization = `Bearer ${localToken}`;
    } else if (!config.useLocalToken && envToken) {
      config.headers.Authorization = `Bearer ${envToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout on 401
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.location.href = "/"; 
    }
    return Promise.reject(error);
  }
);