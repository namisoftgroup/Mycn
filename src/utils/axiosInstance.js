import axios from "axios";
import { Cookies } from "react-cookie";

axios.defaults.baseURL = "https://admin.mycn.online/api";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    const lang = localStorage.getItem("lang") || "ar";
    config.headers["lang"] = lang;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    console.log(status);

    if (status === 401) {
      document.cookie = "token=; Max-Age=0; path=/;";
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
